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
import { BN } from "bn.js";
import {
    deriveOrderKey,
    deriveSenderConfigKey,
    deriveTmpTokenAccountKey,
} from "../accounts";
import { createRelayerProgramInterface } from "../program";
import { OrderParams } from "../types/Param";

export async function createPlaceAnOrderInstruction(
    connection: Connection,
    programId: PublicKey,
    buyer: PublicKey,
    mint: PublicKey,
    amount: OrderParams["amount"],
    relayerOperator: PublicKey,
    orderSalt: Buffer,
    chainId: number,
): Promise<TransactionInstruction> {
    const program = createRelayerProgramInterface(
        connection,
        programId,
    );
    const buyerTokenAccount = getAssociatedTokenAddressSync(mint, buyer);
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
        .placeAnOrder(orderSalt, new BN(amount.toString()), chainId)
        .accounts({
            mint: mint,
            config: deriveSenderConfigKey(programId),
            tmpTokenAccount: tmpTokenAccount,
            orderAccount: orderAccount,
            buyerTokenAccount: buyerTokenAccount,
            buyer: buyer,
            relayer: relayerOperator,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        })
        .instruction();
}
