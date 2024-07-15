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
import { createGoSwapShopRelayerProgramInterface } from "../program";

export async function createClaimTheOrderInstruction(
  connection: Connection,
  programId: PublicKey,
  seller: PublicKey,
  mint: PublicKey,
  orderSalt: Buffer,
  goSwapShopOperator: PublicKey,
): Promise<TransactionInstruction> {
  const program = createGoSwapShopRelayerProgramInterface(
    connection,
    programId,
  );
  const sellerTokenAccount = getAssociatedTokenAddressSync(mint, seller);
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
  const vaultTokenAccount = getAssociatedTokenAddressSync(
    mint,
    goSwapShopOperator,
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
      goswapshop: goSwapShopOperator,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
}
