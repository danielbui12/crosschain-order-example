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

export async function createClaimTheOrderInstruction(
    connection: Connection,
    programId: PublicKey,
    seller: PublicKey,
    mint: PublicKey,
    orderSalt: Buffer,
    relayerOperator: PublicKey,
): Promise<TransactionInstruction> {
    const program = createRelayerProgramInterface(
        connection,
        programId,
    );
    const sellerTokenAccount = getAssociatedTokenAddressSync(mint, seller);
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
    const vaultTokenAccount = getAssociatedTokenAddressSync(
        mint,
        relayerOperator,
    );

    return program.methods
        .claimTheOrder(orderSalt)
        .accounts({
            mint: mint,
            config: deriveSenderConfigKey(programId),
            tmpTokenAccount: tmpTokenAccount,
            orderAccount: orderAccount,
            vaultTokenAccount: vaultTokenAccount,
            sellerTokenAccount: sellerTokenAccount,
            seller: seller,
            relayer: relayerOperator,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        })
        .instruction();
}
