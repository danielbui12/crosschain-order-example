import {
    CHAINS,
    CHAIN_ID_SOLANA,
    ChainId,
    parseTokenTransferPayload,
    tryNativeToHexString,
} from "@certusone/wormhole-sdk";
import * as mock from "@certusone/wormhole-sdk/lib/cjs/mock";
import { getTokenBridgeDerivedAccounts } from "@certusone/wormhole-sdk/lib/cjs/solana";
import * as wormhole from "@certusone/wormhole-sdk/lib/cjs/solana/wormhole";
import { getAccount, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { use as chaiUse, expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import * as relayer from "../sdk/relayer";

import { deriveWrappedMintKey } from "@certusone/wormhole-sdk/lib/cjs/solana/tokenBridge";
import {
    BUYER_KEYPAIR,
    CORE_BRIDGE_PID,
    RELAYER_OPERATOR_KEYPAIR,
    LOCALHOST,
    MINTS_WITH_DECIMALS,
    OWNER_KEYPAIR,
    RELAYER_KEYPAIR,
    SELLER_KEYPAIR,
    TOKEN_BRIDGE_PID,
    WETH_ADDRESS,
    WORMHOLE_CONTRACTS,
    boilerPlateReduction,
    calculateProduct,
    deriveMaliciousTokenBridgeEndpointKey,
    getEpochTimestampFromTime,
    makeId,
} from "./helpers";
chaiUse(chaiAsPromised);

const RELAYER_ID = new PublicKey(
    "6XR3iskY9jsg99WHNwYjLiq13CK9xaHviQ9WQPj76frr",
);
const ETHEREUM_TOKEN_BRIDGE_ADDRESS = WORMHOLE_CONTRACTS.ethereum.token_bridge;

describe("Relayer", function () {
    const connection = new Connection(LOCALHOST, "processed");
    const owner = OWNER_KEYPAIR;
    const buyer = BUYER_KEYPAIR;
    const seller = SELLER_KEYPAIR;
    const relayerOperator = RELAYER_OPERATOR_KEYPAIR;
    const relayerKp = RELAYER_KEYPAIR;

    console.log("owner pubkey:", owner.publicKey.toString());
    console.log("buyer pubkey:", buyer.publicKey.toString());
    console.log("seller pubkey:", seller.publicKey.toString());
    console.log(
        "relayer operator pubkey:",
        relayerOperator.publicKey.toString(),
    );

    const {
        guardianSign,
        postSignedMsgAsVaaOnSolana,
        expectIxToSucceed,
        expectIxToFailWithError,
    } = boilerPlateReduction(connection, owner);

    const foreignChain = CHAINS.ethereum;
    const invalidChain = (foreignChain + 1) as ChainId;
    const foreignContractAddress = Buffer.alloc(32, "deadbeef", "hex");
    const unregisteredContractAddress = Buffer.alloc(32, "deafbeef", "hex");
    const foreignTokenBridge = new mock.MockEthereumTokenBridge(
        ETHEREUM_TOKEN_BRIDGE_ADDRESS,
        200,
    );
    const program = relayer.createRelayerProgramInterface(
        connection,
        RELAYER_ID,
    );

    describe("Initialize Program", function () {
        // Set a relayer fee of 1%
        // Note: This will be overwritten later when update_relayer_fee instruction is called.
        const relayerFee = 1_000_000;
        const relayerFeePrecision = 100_000_000;

        const createInitializeIx = (opts?: {
            relayerFee?: number;
            relayerFeePrecision?: number;
        }) =>
            relayer.createInitializeInstruction(
                connection,
                RELAYER_ID,
                owner.publicKey,
                TOKEN_BRIDGE_PID,
                CORE_BRIDGE_PID,
                opts?.relayerFee ?? relayerFee,
                opts?.relayerFeePrecision ?? relayerFeePrecision,
            );

        it("Cannot Initialize With relayer_fee_precision == 0", async function () {
            await expectIxToFailWithError(
                await createInitializeIx({ relayerFee: 0, relayerFeePrecision: 0 }),
                "InvalidRelayerFee",
            );
        });

        it("Cannot Initialize With relayer_fee > relayer_fee_precision", async function () {
            await expectIxToFailWithError(
                await createInitializeIx({
                    relayerFee: relayerFeePrecision,
                    relayerFeePrecision: relayerFee,
                }),
                "InvalidRelayerFee",
            );
        });

        it("Finally Initialize Program", async function () {
            await expectIxToSucceed(createInitializeIx());

            const senderConfigData = await relayer.getSenderConfigData(
                connection,
                RELAYER_ID,
            );
            expect(senderConfigData.owner).deep.equals(owner.publicKey);
            expect(senderConfigData.finality).equals(0);

            const tokenBridgeAccounts = getTokenBridgeDerivedAccounts(
                RELAYER_ID,
                TOKEN_BRIDGE_PID,
                CORE_BRIDGE_PID,
            );

            (
                [
                    ["config", "tokenBridgeConfig"],
                    ["authoritySigner", "tokenBridgeAuthoritySigner"],
                    ["custodySigner", "tokenBridgeCustodySigner"],
                    ["wormholeBridge", "wormholeBridge"],
                    ["emitter", "tokenBridgeEmitter"],
                    ["wormholeFeeCollector", "wormholeFeeCollector"],
                    ["sequence", "tokenBridgeSequence"],
                ] as [
                    keyof typeof senderConfigData.tokenBridge,
                    keyof typeof tokenBridgeAccounts,
                ][]
            ).forEach(([lhs, rhs]) =>
                expect(senderConfigData.tokenBridge[lhs]).deep.equals(
                    tokenBridgeAccounts[rhs],
                ),
            );

            const redeemerConfigData = await relayer.getRedeemerConfigData(
                connection,
                RELAYER_ID,
            );
            expect(redeemerConfigData.owner).deep.equals(owner.publicKey);
            expect(redeemerConfigData.relayerFee).equals(relayerFee);
            expect(redeemerConfigData.relayerFeePrecision).equals(
                relayerFeePrecision,
            );

            (
                [
                    ["config", "tokenBridgeConfig"],
                    ["custodySigner", "tokenBridgeCustodySigner"],
                    ["mintAuthority", "tokenBridgeMintAuthority"],
                ] as [
                    keyof typeof redeemerConfigData.tokenBridge,
                    keyof typeof tokenBridgeAccounts,
                ][]
            ).forEach(([lhs, rhs]) =>
                expect(redeemerConfigData.tokenBridge[lhs]).deep.equals(
                    tokenBridgeAccounts[rhs],
                ),
            );
        });

        it("Cannot Call Instruction Again: initialize", async function () {
            await expectIxToFailWithError(
                await createInitializeIx({ relayerFee: 0, relayerFeePrecision: 1 }),
                "already in use",
            );
        });
    });

    describe("Update Relayer Fee", function () {
        // Set a relayer fee of 0.1%
        const relayerFee = 100_000;
        const relayerFeePrecision = 100_000_000;
        const createUpdateRelayerFeeIx = (opts?: {
            sender?: PublicKey;
            relayerFee?: number;
            relayerFeePrecision?: number;
        }) =>
            relayer.createUpdateRelayerFeeInstruction(
                connection,
                RELAYER_ID,
                opts?.sender ?? owner.publicKey,
                opts?.relayerFee ?? relayerFee,
                opts?.relayerFeePrecision ?? relayerFeePrecision,
            );

        it("Cannot Update as Non-Owner", async function () {
            await expectIxToFailWithError(
                await createUpdateRelayerFeeIx({
                    sender: relayerKp.publicKey,
                    relayerFee: relayerFee - 1,
                }),
                "OwnerOnly",
                relayerKp,
            );
        });

        it("Cannot Update With relayer_fee_precision == 0", async function () {
            await expectIxToFailWithError(
                await createUpdateRelayerFeeIx({
                    relayerFee: 0,
                    relayerFeePrecision: 0,
                }),
                "InvalidRelayerFee",
            );
        });

        it("Cannot Update With relayer_fee > relayer_fee_precision", async function () {
            await expectIxToFailWithError(
                await createUpdateRelayerFeeIx({
                    relayerFee: relayerFeePrecision,
                    relayerFeePrecision: relayerFee,
                }),
                "InvalidRelayerFee",
            );
        });

        it("Finally Update Relayer Fee", async function () {
            await expectIxToSucceed(createUpdateRelayerFeeIx());

            const redeemerConfigData = await relayer.getRedeemerConfigData(
                connection,
                RELAYER_ID,
            );
            expect(redeemerConfigData.relayerFee).equals(relayerFee);
            expect(redeemerConfigData.relayerFeePrecision).equals(
                relayerFeePrecision,
            );
        });
    });

    describe("Register Foreign Emitter", function () {
        const createRegisterForeignContractIx = (opts?: {
            sender?: PublicKey;
            contractAddress?: Buffer;
        }) =>
            relayer.createRegisterForeignContractInstruction(
                connection,
                RELAYER_ID,
                opts?.sender ?? owner.publicKey,
                TOKEN_BRIDGE_PID,
                foreignChain,
                opts?.contractAddress ?? foreignContractAddress,
                ETHEREUM_TOKEN_BRIDGE_ADDRESS,
            );

        it("Cannot Update as Non-Owner", async function () {
            const contractAddress = Buffer.alloc(32, "fbadc0de", "hex");
            await expectIxToFailWithError(
                await createRegisterForeignContractIx({
                    sender: relayerKp.publicKey,
                    contractAddress,
                }),
                "OwnerOnly",
                relayerKp,
            );
        });

        [CHAINS.unset, CHAINS.solana].forEach((chain) =>
            it(`Cannot Register Chain ID == ${chain}`, async function () {
                await expectIxToFailWithError(
                    await program.methods
                        .registerForeignContract(chain, [...foreignContractAddress])
                        .accounts({
                            owner: owner.publicKey,
                            config: relayer.deriveSenderConfigKey(
                                RELAYER_ID,
                            ),
                            foreignContract: relayer.deriveForeignContractKey(
                                RELAYER_ID,
                                chain,
                            ),
                            tokenBridgeForeignEndpoint: deriveMaliciousTokenBridgeEndpointKey(
                                TOKEN_BRIDGE_PID,
                                chain,
                                Buffer.alloc(32),
                            ),
                            tokenBridgeProgram: new PublicKey(TOKEN_BRIDGE_PID),
                        })
                        .instruction(),
                    "InvalidForeignContract",
                );
            }),
        );

        it("Cannot Register Zero Address", async function () {
            await expectIxToFailWithError(
                await createRegisterForeignContractIx({
                    contractAddress: Buffer.alloc(32),
                }),
                "InvalidForeignContract",
            );
        });

        it("Cannot Register Contract Address Length != 32", async function () {
            await expectIxToFailWithError(
                await createRegisterForeignContractIx({
                    contractAddress: foreignContractAddress.subarray(0, 31),
                }),
                "InstructionDidNotDeserialize",
            );
        });

        [Buffer.alloc(32, "fbadc0de", "hex"), foreignContractAddress].forEach(
            (contractAddress) =>
                it(`Register ${contractAddress === foreignContractAddress ? "Final" : "Random"} Address`, async function () {
                    await expectIxToSucceed(
                        createRegisterForeignContractIx({ contractAddress }),
                    );

                    const { chain, address } =
                        await relayer.getForeignContractData(
                            connection,
                            RELAYER_ID,
                            foreignChain,
                        );
                    expect(chain).equals(foreignChain);
                    expect(address).deep.equals(contractAddress);
                }),
        );
    });

    const batchId = 0;
    const sendAmount = 31337n; //we are sending once
    const recipientAddress = Buffer.alloc(32, "1337beef", "hex");

    const getWormholeSequence = async () =>
        (
            await wormhole.getProgramSequenceTracker(
                connection,
                TOKEN_BRIDGE_PID,
                CORE_BRIDGE_PID,
            )
        ).value() + 1n;

    const verifyWormholeMessage = async (sequence: bigint) => {
        const payload = parseTokenTransferPayload(
            (
                await wormhole.getPostedMessage(
                    connection,
                    relayer.deriveTokenTransferMessageKey(
                        RELAYER_ID,
                        sequence,
                    ),
                )
            ).message.payload,
        ).tokenTransferPayload;

        expect(payload.readUint8(0)).equals(1); // payload ID
        expect(recipientAddress).deep.equals(payload.subarray(1, 33));
    };

    const verifyTmpTokenAccountDoesNotExist = async (
        tmpTokenAccountKey: PublicKey,
    ) => {
        await expect(getAccount(connection, tmpTokenAccountKey)).to.be.rejected;
    };

    const getTokenBalance = async (tokenAccount: PublicKey) =>
        (await getAccount(connection, tokenAccount)).amount;

    (
        [
            [
                false,
                18,
                tryNativeToHexString(WETH_ADDRESS, foreignChain),
                deriveWrappedMintKey(TOKEN_BRIDGE_PID, foreignChain, WETH_ADDRESS),
            ],
            ...Array.from(MINTS_WITH_DECIMALS.entries()).map(
                ([decimals, { publicKey }]): [boolean, number, string, PublicKey] => [
                    true,
                    decimals,
                    publicKey.toBuffer().toString("hex"),
                    publicKey,
                ],
            ),
        ] as [boolean, number, string, PublicKey][]
    ).forEach(([isNative, decimals, tokenAddress, mint]) => {
        const DEFAULT_ORDER_DATA: relayer.OrderParams = {
            makerFee: 100n,
            takerFee: 100n,
            chainId: CHAINS.solana,
            claimDeadline: BigInt(
                getEpochTimestampFromTime(Date.now() + 10 * 60 * 1000),
            ),
            amount: sendAmount,
            claimer: relayer.Claimer.Buyer,
            buyer: buyer.publicKey,
            seller: seller.publicKey,
        };

        const createCreateAnOrderIx = (
            orderSalt: Buffer,
            opts?: {
                sender?: PublicKey;
                seller?: PublicKey;
                amount?: bigint;
            },
        ) =>
            relayer.createCreateAnOrderInstruction(
                connection,
                RELAYER_ID,
                opts?.sender ?? seller.publicKey,
                mint,
                DEFAULT_ORDER_DATA.amount,
                relayerOperator.publicKey,
                orderSalt,
            );

        const createPlaceAnOrderIx = (
            orderSalt: Buffer,
            chainId: ChainId = CHAIN_ID_SOLANA,
            opts?: {
                sender?: PublicKey;
                seller?: PublicKey;
                amount?: bigint;
            },
        ) =>
            relayer.createPlaceAnOrderInstruction(
                connection,
                RELAYER_ID,
                opts?.sender ?? buyer.publicKey,
                mint,
                DEFAULT_ORDER_DATA.amount,
                relayerOperator.publicKey,
                orderSalt,
                chainId,
            );

        const createCancelTheOrderIx = (
            orderSalt: Buffer,
            opts?: {
                sender?: PublicKey;
                amount?: bigint;
                recipientAddress?: Buffer;
                recipientChain?: ChainId;
            },
        ) =>
            relayer.createCancelTheOrderInstruction(
                connection,
                RELAYER_ID,
                opts?.sender ?? buyer.publicKey,
                mint,
                relayerOperator.publicKey,
                orderSalt,
            );

        const createConfirmTheOrderIx = (
            orderSalt: Buffer,
            opts?: {
                sender?: PublicKey;
                amount?: bigint;
                vaultAta?: PublicKey;
            },
        ) =>
            relayer.createConfirmTheOrderInstruction(
                connection,
                RELAYER_ID,
                opts?.sender ?? buyer.publicKey,
                seller.publicKey,
                mint,
                orderSalt,
                relayerOperator.publicKey,
            );

        const createClaimTheOrderIx = (
            orderSalt: Buffer,
            opts?: {
                sender?: PublicKey;
                amount?: bigint;
                vaultAta?: PublicKey;
            },
        ) =>
            relayer.createClaimTheOrderInstruction(
                connection,
                RELAYER_ID,
                seller.publicKey,
                mint,
                orderSalt,
                relayerOperator.publicKey,
            );

        const logBalance = async (key: string, orderSalt: Buffer) => {
            console.log("=".repeat(5), key, "=".repeat(5));
            const buyerTokenAccount = getAssociatedTokenAddressSync(
                mint,
                buyer.publicKey,
            );
            const { amount: buyerTokenAccountBalance } = await getAccount(
                connection,
                buyerTokenAccount,
            );
            console.log(
                "buyerTokenAccountBalance:",
                buyerTokenAccountBalance.toString(),
            );

            const sellerTokenAccount = getAssociatedTokenAddressSync(
                mint,
                seller.publicKey,
            );
            const { amount: sellerTokenAccountBalance } = await getAccount(
                connection,
                sellerTokenAccount,
            );
            console.log(
                "sellerTokenAccountBalance:",
                sellerTokenAccountBalance.toString(),
            );

            const vaultTokenAccount = getAssociatedTokenAddressSync(
                mint,
                relayerOperator.publicKey,
            );
            const { amount: vaultTokenAccountBalance } = await getAccount(
                connection,
                vaultTokenAccount,
            );
            console.log(
                "vaultTokenAccountBalance:",
                vaultTokenAccountBalance.toString(),
            );

            try {
                const tmpAccount = relayer.deriveTmpTokenAccountKey(
                    RELAYER_ID,
                    mint,
                    buyer.publicKey,
                    orderSalt,
                );
                const { amount: tmpAccountBalance } = await getAccount(
                    connection,
                    tmpAccount,
                );
                console.log("tmpAccountBalance:", tmpAccountBalance.toString());
            } catch (_) { }

            console.log("=".repeat(5), key, "=".repeat(5));
        };

        describe(`Seller 'create', Buyer 'place' and 'cancel' an Order`, function () {
            const ORDER_SALT = makeId();

            it("Create an order", async function () {
                const { value } =
                    await connection.getLatestBlockhashAndContext("finalized");
                const transaction = new Transaction({
                    ...value,
                    feePayer: seller.publicKey,
                });
                transaction.add(await createCreateAnOrderIx(ORDER_SALT));
                transaction.partialSign(relayerOperator);
                /// Serialize the transaction and convert to base64
                const serializedTransaction = transaction.serialize({
                    /// We will need Buyer to deserialize and sign the transaction
                    requireAllSignatures: false,
                });
                /// save this to db and waiting for buyer partial sign
                const transactionBase64 = serializedTransaction.toString("base64");

                /// Partial sign as Seller
                const deserializedTransaction = Transaction.from(
                    Buffer.from(transactionBase64, "base64"),
                );
                deserializedTransaction.partialSign(seller);
                // Serialize the transaction again to send it back to the network
                await expectIxToSucceed(deserializedTransaction.instructions, [
                    relayerOperator,
                    seller,
                ]);
                await logBalance("CREATE_AN_ORDER", ORDER_SALT);
            });

            it("Place an order", async function () {
                const { value } =
                    await connection.getLatestBlockhashAndContext("finalized");
                const transaction = new Transaction({
                    ...value,
                    feePayer: buyer.publicKey,
                });
                transaction.add(await createPlaceAnOrderIx(ORDER_SALT));
                transaction.partialSign(relayerOperator);
                /// Serialize the transaction and convert to base64
                const serializedTransaction = transaction.serialize({
                    /// We will need Buyer to deserialize and sign the transaction
                    requireAllSignatures: false,
                });
                /// save this to db and waiting for buyer partial sign
                const transactionBase64 = serializedTransaction.toString("base64");

                /// Partial sign as Buyer
                const deserializedTransaction = Transaction.from(
                    Buffer.from(transactionBase64, "base64"),
                );
                deserializedTransaction.partialSign(buyer);
                // Serialize the transaction again to send it back to the network
                await expectIxToSucceed(deserializedTransaction.instructions, [
                    relayerOperator,
                    buyer,
                ]);
                await logBalance("PLACE_AN_ORDER", ORDER_SALT);
            });

            it("Cancel the order", async function () {
                await expectIxToSucceed(createCancelTheOrderIx(ORDER_SALT), buyer);
                await logBalance("CANCEL_THE_ORDER", ORDER_SALT);
            });
        });

        describe(`Seller 'create', Buyer 'place' and 'confirm', Seller 'claim' an Order in 1 chain`, function () {
            const ORDER_SALT = makeId();

            it("Create an order", async function () {
                const { value } =
                    await connection.getLatestBlockhashAndContext("finalized");
                const transaction = new Transaction({
                    ...value,
                    feePayer: seller.publicKey,
                });
                transaction.add(await createCreateAnOrderIx(ORDER_SALT));
                transaction.partialSign(relayerOperator);
                /// Serialize the transaction and convert to base64
                const serializedTransaction = transaction.serialize({
                    /// We will need Buyer to deserialize and sign the transaction
                    requireAllSignatures: false,
                });
                /// save this to db and waiting for buyer partial sign
                const transactionBase64 = serializedTransaction.toString("base64");

                /// Partial sign as Seller
                const deserializedTransaction = Transaction.from(
                    Buffer.from(transactionBase64, "base64"),
                );
                deserializedTransaction.partialSign(seller);
                // Serialize the transaction again to send it back to the network
                await expectIxToSucceed(deserializedTransaction.instructions, [
                    relayerOperator,
                    seller,
                ]);
                await logBalance("CREATE_AN_ORDER", ORDER_SALT);
            });

            it("Place an order", async function () {
                const { value } =
                    await connection.getLatestBlockhashAndContext("finalized");
                const transaction = new Transaction({
                    ...value,
                    feePayer: buyer.publicKey,
                });
                transaction.add(await createPlaceAnOrderIx(ORDER_SALT));
                transaction.partialSign(relayerOperator);
                /// Serialize the transaction and convert to base64
                const serializedTransaction = transaction.serialize({
                    /// We will need Buyer to deserialize and sign the transaction
                    requireAllSignatures: false,
                });
                /// save this to db and waiting for buyer partial sign
                const transactionBase64 = serializedTransaction.toString("base64");

                /// Partial sign as Buyer
                const deserializedTransaction = Transaction.from(
                    Buffer.from(transactionBase64, "base64"),
                );
                deserializedTransaction.partialSign(buyer);
                // Serialize the transaction again to send it back to the network
                await expectIxToSucceed(deserializedTransaction.instructions, [
                    relayerOperator,
                    buyer,
                ]);
                await logBalance("PLACE_AN_ORDER", ORDER_SALT);
            });

            it("Confirm the order", async function () {
                await expectIxToSucceed(createConfirmTheOrderIx(ORDER_SALT), buyer);
            });

            it("Claim the order", async function () {
                await expectIxToSucceed(
                    await createClaimTheOrderIx(ORDER_SALT),
                    [seller, relayerOperator],
                );
                await logBalance("CLAIM_THE_ORDER", ORDER_SALT);
            });
        });

        describe(`For ${isNative ? "Native" : "Wrapped"} With ${decimals} Decimals`, function () {
            describe(`Send Tokens With Payload`, function () {
                const ORDER_SALT = makeId();

                const createSendTokensWithPayloadIx = (opts?: {
                    sender?: PublicKey;
                    amount?: bigint;
                    recipientAddress?: Buffer;
                }) =>
                    (isNative
                        ? relayer.createSendNativeTokensWithPayloadInstruction
                        : relayer.createSendWrappedTokensWithPayloadInstruction)(
                            connection,
                            RELAYER_ID,
                            opts?.sender ?? buyer.publicKey,
                            TOKEN_BRIDGE_PID,
                            CORE_BRIDGE_PID,
                            mint,
                            {
                                batchId,
                                recipientAddress: opts?.recipientAddress ?? recipientAddress,
                            },
                            relayerOperator.publicKey,
                            ORDER_SALT,
                            foreignChain,
                        );

                it("Place an order", async function () {
                    const { value } =
                        await connection.getLatestBlockhashAndContext("finalized");
                    const transaction = new Transaction({
                        ...value,
                        feePayer: buyer.publicKey,
                    });
                    transaction.add(await createPlaceAnOrderIx(ORDER_SALT, foreignChain));
                    transaction.partialSign(relayerOperator);
                    /// Serialize the transaction and convert to base64
                    const serializedTransaction = transaction.serialize({
                        /// We will need Buyer to deserialize and sign the transaction
                        requireAllSignatures: false,
                    });
                    /// save this to db and waiting for buyer partial sign
                    const transactionBase64 = serializedTransaction.toString("base64");

                    /// Partial sign as Buyer
                    const deserializedTransaction = Transaction.from(
                        Buffer.from(transactionBase64, "base64"),
                    );
                    deserializedTransaction.partialSign(buyer);
                    // Serialize the transaction again to send it back to the network
                    await expectIxToSucceed(deserializedTransaction.instructions, [
                        relayerOperator,
                        buyer,
                    ]);
                    await logBalance("PLACE_AN_ORDER", ORDER_SALT);
                });

                it("Cannot Send To Zero Address", async function () {
                    await expectIxToFailWithError(
                        await createSendTokensWithPayloadIx({
                            recipientAddress: Buffer.alloc(32),
                        }),
                        "InvalidRecipient",
                        buyer,
                    );
                });

                it("Finally Send Tokens With Payload", async function () {
                    const sequence = await getWormholeSequence();
                    const buyerTmpAccount = relayer.deriveTmpTokenAccountKey(
                        RELAYER_ID,
                        relayerOperator.publicKey,
                        buyer.publicKey,
                        ORDER_SALT,
                    );
                    const balanceBefore = await getTokenBalance(buyerTmpAccount);
                    console.log("balanceBefore", balanceBefore);

                    //depending on pda derivations, we can exceed our 200k compute units budget
                    const computeUnits = 250_000;
                    await expectIxToSucceed(
                        createSendTokensWithPayloadIx({
                            recipientAddress: recipientAddress,
                        }),
                        buyer,
                        computeUnits,
                    );
                    const balanceAfter = await getTokenBalance(buyerTmpAccount);
                    console.log("balanceAfter", balanceAfter);
                    // expect(balanceChange).equals((sendAmount / truncation) * truncation);

                    await verifyWormholeMessage(sequence);
                    // await verifyTmpTokenAccountDoesNotExist(
                    //   relayer.deriveTmpTokenAccountKey(
                    //     RELAYER_ID,
                    //     relayerOperator.publicKey,
                    //     buyer.publicKey,
                    //     ORDER_SALT
                    //   ),
                    // );
                });
            });

            describe(`Redeem Tokens With Payload`, function () {
                const ORDER_SALT = makeId();

                // We treat amount as if it was specified with a precision of 8 decimals
                const truncation = isNative ? 10n ** BigInt(decimals - 8) : 1n;
                const receiveAmount = calculateProduct(
                    DEFAULT_ORDER_DATA.amount / truncation * truncation,
                    DEFAULT_ORDER_DATA.takerFee,
                    relayer.MakerOrTaker.Taker,
                );

                const createRedeemTransferWithPayloadIx = (signedMsg: Buffer) =>
                    (isNative
                        ? relayer.createRedeemNativeTransferWithPayloadInstruction
                        : relayer.createRedeemWrappedTransferWithPayloadInstruction)(
                            connection,
                            RELAYER_ID,
                            seller.publicKey,
                            relayerOperator.publicKey,
                            TOKEN_BRIDGE_PID,
                            CORE_BRIDGE_PID,
                            signedMsg,
                            ORDER_SALT,
                        );

                it("Create an order", async function () {
                    const { value } =
                        await connection.getLatestBlockhashAndContext("finalized");
                    const transaction = new Transaction({
                        ...value,
                        feePayer: seller.publicKey,
                    });
                    transaction.add(await createCreateAnOrderIx(ORDER_SALT));
                    transaction.partialSign(relayerOperator);
                    /// Serialize the transaction and convert to base64
                    const serializedTransaction = transaction.serialize({
                        /// We will need Buyer to deserialize and sign the transaction
                        requireAllSignatures: false,
                    });
                    /// save this to db and waiting for buyer partial sign
                    const transactionBase64 = serializedTransaction.toString("base64");

                    /// Partial sign as Seller
                    const deserializedTransaction = Transaction.from(
                        Buffer.from(transactionBase64, "base64"),
                    );
                    deserializedTransaction.partialSign(seller);
                    // Serialize the transaction again to send it back to the network
                    await expectIxToSucceed(deserializedTransaction.instructions, [
                        relayerOperator,
                        seller,
                    ]);
                    await logBalance("CREATE_AN_ORDER", ORDER_SALT);
                });

                const recipientTmpTokenAccount =
                    relayer.deriveTmpTokenAccountKey(
                        RELAYER_ID,
                        relayerOperator.publicKey,
                        seller.publicKey,
                        ORDER_SALT,
                    );

                const publishAndSign = (opts?: {
                    foreignContractAddress?: Buffer;
                    recipient?: PublicKey;
                }) => {
                    const tokenTransferPayload = (() => {
                        const buf = Buffer.alloc(33);
                        buf.writeUInt8(1, 0); // payload ID
                        (opts?.recipient ?? recipientTmpTokenAccount)
                            .toBuffer()
                            .copy(buf, 1); // recipient
                        return buf;
                    })();

                    console.log('published amount:', receiveAmount / truncation);
                    const published = foreignTokenBridge.publishTransferTokensWithPayload(
                        tokenAddress,
                        isNative ? CHAINS.solana : foreignChain, // tokenChain
                        receiveAmount / truncation, //adjust for decimals
                        CHAINS.solana, // recipientChain
                        RELAYER_ID.toBuffer().toString("hex"),
                        opts?.foreignContractAddress ?? foreignContractAddress,
                        tokenTransferPayload,
                        batchId,
                    );
                    // published[51] = 3;

                    return guardianSign(published);
                };

                it("Cannot Redeem From Unregistered Foreign Contract", async function () {
                    const bogusMsg = publishAndSign({
                        foreignContractAddress: unregisteredContractAddress,
                    });
                    await postSignedMsgAsVaaOnSolana(bogusMsg);
                    await expectIxToFailWithError(
                        await createRedeemTransferWithPayloadIx(bogusMsg),
                        "InvalidForeignContract",
                        seller,
                    );
                });

                // it("Cannot Redeem With Bogus Token Account", async function () {
                //   const maliciousIx = await (async () => {
                //     const parsed = parseTokenTransferVaa(signedMsg);

                //     const tokenBridgeAccounts = (isNative
                //       ? relayer.getCompleteTransferNativeWithPayloadCpiAccounts
                //       : relayer.getCompleteTransferWrappedWithPayloadCpiAccounts)(
                //         TOKEN_BRIDGE_PID,
                //         CORE_BRIDGE_PID,
                //         seller.publicKey,
                //         parsed,
                //         recipientTmpTokenAccount
                //       );
                //     const orderAccount = relayer.deriveOrderKey(
                //       RELAYER_ID,
                //       relayerOperator.publicKey,
                //       seller.publicKey,
                //       ORDER_SALT
                //     );

                //     const method = isNative
                //       ? program.methods.redeemNativeTransferWithPayload
                //       : program.methods.redeemWrappedTransferWithPayload;

                //     return method([...parsed.hash])
                //       .accounts({
                //         seller: seller.publicKey,
                //         orderAccount: orderAccount,
                //         config: relayer.deriveRedeemerConfigKey(RELAYER_ID),
                //         foreignContract:
                //           relayer.deriveForeignContractKey(RELAYER_ID, parsed.emitterChain as ChainId),
                //         tmpTokenAccount: recipientTmpTokenAccount,
                //         tokenBridgeProgram: TOKEN_BRIDGE_PID,
                //         ...tokenBridgeAccounts,
                //       })
                //       .instruction();
                //   })();

                //   await expectIxToFailWithError(
                //     maliciousIx,
                //     "Error Code: InvalidRecipient. Error Number: 6015",
                //     relayer
                //   );
                // });

                it("Finally Receive Tokens With Payload", async function () {
                    console.log("receiveAmount", receiveAmount);
                    //got call it here so the nonce increases (signedMsg is different between tests)
                    const signedMsg = publishAndSign({
                        recipient: recipientTmpTokenAccount,
                    });
                    await postSignedMsgAsVaaOnSolana(signedMsg);

                    const balanceBefore = await getTokenBalance(recipientTmpTokenAccount);
                    console.log("Balance before: ", balanceBefore.toString());
                    await expectIxToSucceed(
                        createRedeemTransferWithPayloadIx(signedMsg),
                        seller,
                    );
                    const balanceAfter = await getTokenBalance(recipientTmpTokenAccount);
                    console.log("Balance after: ", balanceAfter.toString());

                    await expectIxToFailWithError(
                        await createRedeemTransferWithPayloadIx(signedMsg),
                        "AlreadyRedeemed",
                        seller,
                    );
                });

                it("Claim the order", async function () {
                    await expectIxToSucceed(
                        await createClaimTheOrderIx(ORDER_SALT),
                        [seller, relayerOperator],
                    );
                    await logBalance("CLAIM_THE_ORDER", ORDER_SALT);
                });
            });
        });
    });
});
