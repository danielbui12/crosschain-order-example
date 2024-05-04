import { ChainId } from "@certusone/wormhole-sdk";
import { getTransferNativeWithPayloadCpiAccounts } from "@certusone/wormhole-sdk/lib/cjs/solana";
import { getProgramSequenceTracker } from "@certusone/wormhole-sdk/lib/cjs/solana/wormhole";
import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import {
    deriveForeignContractKey,
    deriveOrderKey,
    deriveSenderConfigKey,
    deriveTmpTokenAccountKey,
    deriveTokenTransferMessageKey,
} from "../accounts";
import { createRelayerProgramInterface } from "../program";
import { SendTokensParams } from "../types/Param";

export async function createSendNativeTokensWithPayloadInstruction(
    connection: Connection,
    programId: PublicKey,
    buyer: PublicKey,
    tokenBridgeProgramId: PublicKey,
    wormholeProgramId: PublicKey,
    mint: PublicKey,
    params: SendTokensParams,
    relayerOperator: PublicKey,
    orderSalt: Buffer,
    toChain: ChainId,
): Promise<TransactionInstruction> {
    const program = createRelayerProgramInterface(
        connection,
        programId,
    );

    return getProgramSequenceTracker(
        connection,
        tokenBridgeProgramId,
        wormholeProgramId,
    )
        .then((tracker) =>
            deriveTokenTransferMessageKey(programId, tracker.sequence + 1n),
        )
        .then((message) => {
            const orderAccount = deriveOrderKey(
                programId,
                relayerOperator,
                buyer,
                orderSalt,
            );
            const tmpTokenAccount = deriveTmpTokenAccountKey(
                programId,
                relayerOperator,
                buyer,
                orderSalt,
            );
            const tokenBridgeAccounts = getTransferNativeWithPayloadCpiAccounts(
                programId,
                tokenBridgeProgramId,
                wormholeProgramId,
                buyer,
                message,
                tmpTokenAccount,
                mint,
            );

            return program.methods
                .sendNativeTokensWithPayload(
                    params.batchId,
                    [...params.recipientAddress],
                    toChain,
                )
                .accounts({
                    config: deriveSenderConfigKey(programId),
                    foreignContract: deriveForeignContractKey(programId, toChain),
                    buyer: buyer,
                    orderAccount: orderAccount,
                    tmpTokenAccount,
                    tokenBridgeProgram: new PublicKey(tokenBridgeProgramId),
                    ...tokenBridgeAccounts,
                })
                .instruction();
        });
}
