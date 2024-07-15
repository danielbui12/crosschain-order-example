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
import { createGoSwapShopRelayerProgramInterface } from "../program";
import { OrderParams } from "../types/Param";

export async function createCreateAnOrderInstruction(
  connection: Connection,
  programId: PublicKey,
  seller: PublicKey,
  mint: PublicKey,
  amount: OrderParams["amount"],
  goSwapShopOperator: PublicKey,
  orderSalt: Buffer,
): Promise<TransactionInstruction> {
  const program = createGoSwapShopRelayerProgramInterface(
    connection,
    programId,
  );
  const tmpTokenAccount = deriveTmpTokenAccountKey(
    programId,
    goSwapShopOperator,
    seller,
    orderSalt,
  );
  const orderAccount = deriveOrderKey(
    programId,
    goSwapShopOperator,
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
      goswapshop: goSwapShopOperator,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
}
