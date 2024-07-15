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
import { createGoSwapShopRelayerProgramInterface } from "../program";

export async function createConfirmTheOrderInstruction(
  connection: Connection,
  programId: PublicKey,
  buyer: PublicKey,
  seller: PublicKey,
  mint: PublicKey,
  orderSalt: Buffer,
  goSwapShopOperator: PublicKey,
): Promise<TransactionInstruction> {
  const program = createGoSwapShopRelayerProgramInterface(
    connection,
    programId,
  );
  const tmpTokenAccount = deriveTmpTokenAccountKey(
    programId,
    goSwapShopOperator,
    buyer,
    orderSalt,
  );
  const sellerTmpTokenAccount = deriveTmpTokenAccountKey(
    programId,
    goSwapShopOperator,
    seller,
    orderSalt,
  );
  const orderAccount = deriveOrderKey(
    programId,
    goSwapShopOperator,
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
