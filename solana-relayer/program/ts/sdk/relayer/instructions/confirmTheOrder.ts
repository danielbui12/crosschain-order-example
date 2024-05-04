import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
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

export async function createConfirmTheOrderInstruction(
    connection: Connection,
    programId: PublicKey,
    buyer: PublicKey,
    seller: PublicKey,
    mint: PublicKey,
    orderSalt: Buffer,
    relayerOperator: PublicKey,
): Promise<TransactionInstruction> {
    const program = createRelayerProgramInterface(
        connection,
        programId,
    );
    const tmpTokenAccount = deriveTmpTokenAccountKey(
        programId,
        relayerOperator,
        buyer,
        orderSalt,
    );
    const sellerTmpTokenAccount = deriveTmpTokenAccountKey(
        programId,
        relayerOperator,
        seller,
        orderSalt,
    );
    const orderAccount = deriveOrderKey(
        programId,
        relayerOperator,
        buyer,
        orderSalt,
    );

    return program.methods
        .confirmTheOrder(orderSalt)
        .accounts({
            mint: mint,
            config: deriveSenderConfigKey(programId),
            orderAccount: orderAccount,
            sellerTmpTokenAccount: sellerTmpTokenAccount,
            tmpTokenAccount: tmpTokenAccount,
            buyer: buyer,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        })
        .instruction();
}
