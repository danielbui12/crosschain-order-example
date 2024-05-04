import {
    TOKEN_PROGRAM_ID,
    getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import {
    Connection,
    PublicKey,
    SystemProgram,
    TransactionInstruction,
} from "@solana/web3.js";
import {
    deriveOrderKey,
    deriveSenderConfigKey,
    deriveTmpTokenAccountKey,
} from "../accounts";
import { createRelayerProgramInterface } from "../program";

export async function createCancelTheOrderInstruction(
    connection: Connection,
    programId: PublicKey,
    buyer: PublicKey,
    mint: PublicKey,
    relayerOperator: PublicKey,
    orderSalt: Buffer,
): Promise<TransactionInstruction> {
    const program = createRelayerProgramInterface(
        connection,
        programId,
    );
    const receiverTokenAccount = getAssociatedTokenAddressSync(mint, buyer);
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

    return program.methods
        .cancelTheOrder(orderSalt)
        .accounts({
            mint: mint,
            config: deriveSenderConfigKey(programId),
            tmpTokenAccount: tmpTokenAccount,
            orderAccount: orderAccount,
            buyerTokenAccount: receiverTokenAccount,
            buyer: buyer,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        })
        .instruction();
}
