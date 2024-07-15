import {
  ChainId,
  isBytes,
  ParsedTokenTransferVaa,
  parseTokenTransferVaa,
  SignedVaa,
} from "@certusone/wormhole-sdk";
import { CompleteTransferWrappedWithPayloadCpiAccounts } from "@certusone/wormhole-sdk/lib/cjs/solana";
import {
  deriveEndpointKey,
  deriveMintAuthorityKey,
  deriveRedeemerAccountKey,
  deriveTokenBridgeConfigKey,
  deriveWrappedMetaKey,
  deriveWrappedMintKey,
} from "@certusone/wormhole-sdk/lib/cjs/solana/tokenBridge";
import {
  deriveClaimKey,
  derivePostedVaaKey,
} from "@certusone/wormhole-sdk/lib/cjs/solana/wormhole";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  Connection,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  deriveBridgeTmpTokenAccountKey,
  deriveForeignContractKey,
  deriveOrderKey,
  deriveRedeemerConfigKey,
  deriveTmpTokenAccountKey,
} from "../accounts";
import { createGoSwapShopRelayerProgramInterface } from "../program";

export async function createRedeemWrappedTransferWithPayloadInstruction(
  connection: Connection,
  programId: PublicKey,
  seller: PublicKey,
  goSwapShopOperator: PublicKey,
  tokenBridgeProgramId: PublicKey,
  wormholeProgramId: PublicKey,
  wormholeMessage: SignedVaa | ParsedTokenTransferVaa,
  orderSalt: Buffer,
): Promise<TransactionInstruction> {
  const program = createGoSwapShopRelayerProgramInterface(
    connection,
    programId,
  );

  const parsed = isBytes(wormholeMessage)
    ? parseTokenTransferVaa(wormholeMessage)
    : wormholeMessage;

  const tmpTokenAccount = deriveTmpTokenAccountKey(
    programId,
    goSwapShopOperator,
    seller,
    orderSalt,
  );
  const tokenBridgeAccounts = getCompleteTransferWrappedWithPayloadCpiAccounts(
    tokenBridgeProgramId,
    wormholeProgramId,
    seller,
    parsed,
    tmpTokenAccount,
  );
  const orderAccount = deriveOrderKey(
    programId,
    goSwapShopOperator,
    seller,
    orderSalt,
  );

  const wrappedMint = deriveWrappedMintKey(
    tokenBridgeProgramId,
    parsed.tokenChain,
    parsed.tokenAddress,
  );
  const bridgeTmpTokenAccount = deriveBridgeTmpTokenAccountKey(
    programId,
    wrappedMint,
  );

  return program.methods
    .redeemWrappedTransferWithPayload([...parsed.hash])
    .accounts({
      seller: seller,
      bridgeTmpTokenAccount: bridgeTmpTokenAccount,
      config: deriveRedeemerConfigKey(programId),
      foreignContract: deriveForeignContractKey(
        programId,
        parsed.emitterChain as ChainId,
      ),
      tmpTokenAccount,
      orderAccount: orderAccount,
      tokenBridgeProgram: tokenBridgeProgramId,
      ...tokenBridgeAccounts,
    })
    .instruction();
}

// Temporary
export function getCompleteTransferWrappedWithPayloadCpiAccounts(
  tokenBridgeProgramId: PublicKey,
  wormholeProgramId: PublicKey,
  payer: PublicKey,
  vaa: SignedVaa | ParsedTokenTransferVaa,
  toTokenAccount: PublicKey,
): CompleteTransferWrappedWithPayloadCpiAccounts {
  const parsed = isBytes(vaa) ? parseTokenTransferVaa(vaa) : vaa;
  const mint = deriveWrappedMintKey(
    tokenBridgeProgramId,
    parsed.tokenChain,
    parsed.tokenAddress,
  );
  const cpiProgramId = new PublicKey(parsed.to);
  return {
    payer: new PublicKey(payer),
    tokenBridgeConfig: deriveTokenBridgeConfigKey(tokenBridgeProgramId),
    vaa: derivePostedVaaKey(wormholeProgramId, parsed.hash),
    tokenBridgeClaim: deriveClaimKey(
      tokenBridgeProgramId,
      parsed.emitterAddress,
      parsed.emitterChain,
      parsed.sequence,
    ),
    tokenBridgeForeignEndpoint: deriveEndpointKey(
      tokenBridgeProgramId,
      parsed.emitterChain,
      parsed.emitterAddress,
    ),
    toTokenAccount: new PublicKey(toTokenAccount),
    tokenBridgeRedeemer: deriveRedeemerAccountKey(cpiProgramId),
    toFeesTokenAccount: new PublicKey(toTokenAccount),
    tokenBridgeWrappedMint: mint,
    tokenBridgeWrappedMeta: deriveWrappedMetaKey(tokenBridgeProgramId, mint),
    tokenBridgeMintAuthority: deriveMintAuthorityKey(tokenBridgeProgramId),
    rent: SYSVAR_RENT_PUBKEY,
    systemProgram: SystemProgram.programId,
    tokenProgram: TOKEN_PROGRAM_ID,
    wormholeProgram: new PublicKey(wormholeProgramId),
  };
}
