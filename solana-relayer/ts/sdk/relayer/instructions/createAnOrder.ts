import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
    Connection,
    PublicKey,
    SystemProgram,
    TransactionInstruction,
} from "@solana/web3.js";
import { BN } from "bn.js";
import {
    deriveOrderKey,
    deriveSenderConfigKey,
    deriveTmpTokenAccountKey,
} from "../accounts";
import { createRelayerProgramInterface } from "../program";
import { OrderParams } from "../types/Param";

export async function createCreateAnOrderInstruction(
    connection: Connection,
    programId: PublicKey,
    seller: PublicKey,
    mint: PublicKey,
    amount: OrderParams["amount"],
    relayerOperator: PublicKey,
    orderSalt: Buffer,
): Promise<TransactionInstruction> {
    const program = createRelayerProgramInterface(
        connection,
        programId,
    );
    const tmpTokenAccount = deriveTmpTokenAccountKey(
        programId,
        relayerOperator,
        seller,
        orderSalt,
    );
    const orderAccount = deriveOrderKey(
        programId,
        relayerOperator,
        seller,
        orderSalt,
    );

    return program.methods
        .createAnOrder(orderSalt, new BN(amount.toString()))
        .accounts({
            mint: mint,
            config: deriveSenderConfigKey(programId),
            tmpTokenAccount: tmpTokenAccount,
            orderAccount: orderAccount,
            seller: seller,
            relayer: relayerOperator,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        })
        .instruction();
}
