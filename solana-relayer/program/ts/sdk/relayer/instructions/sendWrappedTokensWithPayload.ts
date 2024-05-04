import { ChainId } from "@certusone/wormhole-sdk";
import { getTransferWrappedWithPayloadCpiAccounts } from "@certusone/wormhole-sdk/lib/cjs/solana";
import { getWrappedMeta } from "@certusone/wormhole-sdk/lib/cjs/solana/tokenBridge";
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

export async function createSendWrappedTokensWithPayloadInstruction(
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
        .then(async (message) => {
            const tmpTokenAccount = deriveTmpTokenAccountKey(
                programId,
                relayerOperator,
                buyer,
                orderSalt,
            );
            const orderAccount = deriveOrderKey(
                programId,
                relayerOperator,
                buyer,
                orderSalt,
            );

            const wrappedMeta = await getWrappedMeta(
                connection,
                tokenBridgeProgramId,
                mint,
            );
            const tokenBridgeAccounts = getTransferWrappedWithPayloadCpiAccounts(
                programId,
                tokenBridgeProgramId,
                wormholeProgramId,
                buyer,
                message,
                tmpTokenAccount,
                wrappedMeta.chain,
                wrappedMeta.tokenAddress,
            );

            return program.methods
                .sendWrappedTokensWithPayload(
                    params.batchId,
                    [...params.recipientAddress],
                    toChain,
                )
                .accounts({
                    config: deriveSenderConfigKey(programId),
                    foreignContract: deriveForeignContractKey(programId, toChain),
                    buyer: buyer,
                    tmpTokenAccount,
                    tokenBridgeProgram: tokenBridgeProgramId,
                    orderAccount: orderAccount,
                    ...tokenBridgeAccounts,
                })
                .instruction();
        });
}
