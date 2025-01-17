import {
  CHAINS,
  createWrappedOnSolana,
  redeemOnSolana,
  transferNativeSol,
  tryNativeToHexString,
} from "@certusone/wormhole-sdk";
import * as mock from "@certusone/wormhole-sdk/lib/cjs/mock";
import * as tokenBridge from "@certusone/wormhole-sdk/lib/cjs/solana/tokenBridge";
import * as wormhole from "@certusone/wormhole-sdk/lib/cjs/solana/wormhole";
import {
  createMint,
  getAccount,
  getAssociatedTokenAddressSync,
  getMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import { use as chaiUse, expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import {
  BUYER_KEYPAIR,
  CORE_BRIDGE_PID,
  GOSWAPSHOP_OPERATOR_KEYPAIR,
  GOVERNANCE_EMITTER_ADDRESS,
  LOCALHOST,
  MINTS_WITH_DECIMALS,
  MOCK_GUARDIANS,
  OWNER_KEYPAIR,
  RELAYER_KEYPAIR,
  SELLER_KEYPAIR,
  TOKEN_BRIDGE_PID,
  WETH_ADDRESS,
  WORMHOLE_CONTRACTS,
  boilerPlateReduction,
  createMaliciousRegisterChainInstruction,
} from "./helpers";
chaiUse(chaiAsPromised);

describe(" 0: Wormhole", () => {
  const connection = new Connection(LOCALHOST, "confirmed");
  const payer = OWNER_KEYPAIR;
  const seller = SELLER_KEYPAIR;
  const buyer = BUYER_KEYPAIR;
  const relayer = RELAYER_KEYPAIR;
  const goSwapShop = GOSWAPSHOP_OPERATOR_KEYPAIR;
  const accounts = [payer, buyer, seller, relayer, goSwapShop];
  const defaultMintAmount = 10n ** 6n;

  const {
    requestAirdrop,
    guardianSign,
    postSignedMsgAsVaaOnSolana,
    expectIxToSucceed,
    expectTxToSucceed,
  } = boilerPlateReduction(connection, payer);

  const signAndPost = async (message: Buffer) => {
    const signedMsg = guardianSign(message);
    await postSignedMsgAsVaaOnSolana(signedMsg);
    return signedMsg;
  };

  const governance = new mock.GovernanceEmitter(
    GOVERNANCE_EMITTER_ADDRESS.toBuffer().toString("hex"),
    20,
  );

  before("Airdrop", async function () {
    await Promise.all(accounts.map((kp) => kp.publicKey).map(requestAirdrop));
  });

  describe("Verify Local Validator", function () {
    it("Create SPL Tokens", async function () {
      await Promise.all(
        Array.from(MINTS_WITH_DECIMALS.entries()).map(
          async ([mintDecimals, { privateKey, publicKey }]) => {
            const mint = await createMint(
              connection,
              payer,
              payer.publicKey,
              null, // freezeAuthority
              mintDecimals,
              Keypair.fromSecretKey(privateKey),
            );
            expect(mint).deep.equals(publicKey);

            const { decimals } = await getMint(connection, mint);
            expect(decimals).equals(mintDecimals);
          },
        ),
      );
    });

    it("Create ATAs", async function () {
      for (const { publicKey: mint } of MINTS_WITH_DECIMALS.values()) {
        for (const account of accounts) {
          await expect(
            getOrCreateAssociatedTokenAccount(
              connection,
              account,
              mint,
              account.publicKey,
            ),
          ).to.be.fulfilled;
        }
      }
    });

    it("Mint to Wallet's ATAs", async function () {
      for (const [
        mintDecimals,
        { publicKey: mint },
      ] of MINTS_WITH_DECIMALS.entries()) {
        const mintAmount = defaultMintAmount * 10n ** BigInt(mintDecimals);
        for (const account of accounts) {
          const destination = getAssociatedTokenAddressSync(
            mint,
            account.publicKey,
          );

          await expect(
            mintTo(connection, payer, mint, destination, payer, mintAmount),
          ).to.be.fulfilled;

          const { amount } = await getAccount(connection, destination);
          console.log(
            "account:",
            account.publicKey.toString(),
            "amount",
            amount.toString(),
          );
          expect(amount).equals(mintAmount);
        }
      }
    });
  });

  describe("Verify Wormhole Program", function () {
    it("Initialize", async function () {
      const guardianSetExpirationTime = 86400;
      const fee = 100n;
      const devnetGuardian = MOCK_GUARDIANS.getPublicKeys()[0];
      const initialGuardians = [devnetGuardian];

      await expectIxToSucceed(
        wormhole.createInitializeInstruction(
          CORE_BRIDGE_PID,
          payer.publicKey,
          guardianSetExpirationTime,
          fee,
          initialGuardians,
        ),
      );

      const accounts = await connection.getProgramAccounts(CORE_BRIDGE_PID);
      expect(accounts).has.length(2);

      const info = await wormhole.getWormholeBridgeData(
        connection,
        CORE_BRIDGE_PID,
      );
      expect(info.guardianSetIndex).equals(0);
      expect(info.config.guardianSetExpirationTime).equals(
        guardianSetExpirationTime,
      );
      expect(info.config.fee).equals(fee);

      const guardianSet = await wormhole.getGuardianSet(
        connection,
        CORE_BRIDGE_PID,
        info.guardianSetIndex,
      );
      expect(guardianSet.index).equals(0);
      expect(guardianSet.keys).has.length(1);
      expect(devnetGuardian).deep.equal(guardianSet.keys[0]);
    });
  });

  describe("Verify Token Bridge Program", function () {
    const ethereumTokenBridge = new mock.MockEthereumTokenBridge(
      WORMHOLE_CONTRACTS.ethereum.token_bridge,
    );
    const tokenBridgeWethMint = tokenBridge.deriveWrappedMintKey(
      TOKEN_BRIDGE_PID,
      CHAINS.ethereum,
      WETH_ADDRESS,
    );

    it("Initialize", async function () {
      await expectIxToSucceed(
        tokenBridge.createInitializeInstruction(
          TOKEN_BRIDGE_PID,
          payer.publicKey,
          CORE_BRIDGE_PID,
        ),
      );

      const accounts = await connection.getProgramAccounts(TOKEN_BRIDGE_PID);
      expect(accounts).has.length(1);
    });

    const registerForeignEndpoint = async (
      message: Buffer,
      isMalicious: boolean,
      expectedAccountLength: number,
    ) => {
      const signedMsg = await expect(signAndPost(message)).to.be.fulfilled;

      const createIxFunc = isMalicious
        ? createMaliciousRegisterChainInstruction
        : tokenBridge.createRegisterChainInstruction;

      await expectIxToSucceed(
        createIxFunc(
          TOKEN_BRIDGE_PID,
          CORE_BRIDGE_PID,
          payer.publicKey,
          signedMsg,
        ),
      );

      const accounts = await connection.getProgramAccounts(TOKEN_BRIDGE_PID);
      expect(accounts).has.length(expectedAccountLength);
    };

    it("Register Foreign Endpoint (Ethereum)", async function () {
      const message = governance.publishTokenBridgeRegisterChain(
        0, //timestamp
        CHAINS.ethereum,
        WORMHOLE_CONTRACTS.ethereum.token_bridge,
      );
      await registerForeignEndpoint(message, false, 3);
    });

    // This shouldn't be allowed, but we're doing it just to prove the safety
    // of the scaffold programs.
    it("Register Bogus Foreign Endpoint (Chain ID == 0)", async function () {
      const message = governance.publishTokenBridgeRegisterChain(
        0, // timestamp
        CHAINS.solana, //will be overwritten
        PublicKey.default.toString(),
      );
      message.writeUInt16BE(CHAINS.unset, 86); //overwrite chainId
      await registerForeignEndpoint(message, true, 5);
    });

    // This shouldn't be allowed, but we're doing it just to prove the safety
    // of the scaffold programs.
    it("Register Bogus Foreign Endpoint (Chain ID == 1)", async function () {
      const message = governance.publishTokenBridgeRegisterChain(
        0, // timestamp
        CHAINS.solana,
        PublicKey.default.toString(),
      );
      await registerForeignEndpoint(message, true, 7);
    });

    it("Outbound Transfer Native", async function () {
      const targetAddress = Buffer.alloc(32, "deadbeef", "hex");
      await expectTxToSucceed(
        transferNativeSol(
          connection,
          CORE_BRIDGE_PID,
          TOKEN_BRIDGE_PID,
          payer.publicKey,
          BigInt(LAMPORTS_PER_SOL), //1 SOL
          targetAddress,
          CHAINS.ethereum,
        ),
      );

      const { sequence } = await wormhole.getProgramSequenceTracker(
        connection,
        TOKEN_BRIDGE_PID,
        CORE_BRIDGE_PID,
      );
      expect(sequence).equals(1n);
    });

    it("Attest WETH from Ethereum", async function () {
      const signedMsg = await expect(
        signAndPost(
          ethereumTokenBridge.publishAttestMeta(
            WETH_ADDRESS,
            18,
            "WETH",
            "Wrapped Ether",
          ),
        ),
      ).to.be.fulfilled;

      await expectTxToSucceed(
        createWrappedOnSolana(
          connection,
          CORE_BRIDGE_PID,
          TOKEN_BRIDGE_PID,
          payer.publicKey,
          signedMsg,
        ),
      );
    });

    it("Create WETH ATAs", async function () {
      await Promise.all(
        accounts.map(
          (wallet) =>
            expect(
              getOrCreateAssociatedTokenAccount(
                connection,
                wallet,
                tokenBridgeWethMint,
                wallet.publicKey,
              ),
            ).to.be.fulfilled,
        ),
      );
    });

    it("Mint WETH to Wallet ATA", async function () {
      await Promise.all(
        accounts.map(async (account) => {
          const destination = getAssociatedTokenAddressSync(
            tokenBridgeWethMint,
            account.publicKey,
          );

          const signedMsg = await expect(
            signAndPost(
              ethereumTokenBridge.publishTransferTokens(
                tryNativeToHexString(WETH_ADDRESS, "ethereum"),
                CHAINS.ethereum, // tokenChain
                defaultMintAmount,
                CHAINS.solana, // recipientChain
                destination.toBuffer().toString("hex"),
                0n, //fee
              ),
            ),
          ).to.be.fulfilled;

          await expectTxToSucceed(
            redeemOnSolana(
              connection,
              CORE_BRIDGE_PID,
              TOKEN_BRIDGE_PID,
              account.publicKey,
              signedMsg,
            ),
            account,
          );

          const { amount } = await getAccount(connection, destination);
          expect(amount).equals(defaultMintAmount);
        }),
      );
    });
  });
});
