import { PublicKey } from "@metaplex-foundation/js";
import { Connection } from "@solana/web3.js";
import { createGoSwapShopRelayerProgramInterface } from "../program";
import { OrderParams } from "../types";

export function deriveOrderKey(
  programId: PublicKey,
  goSwapShopOperator: PublicKey,
  creator: PublicKey,
  orderSalt: Buffer,
) {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("order"),
      goSwapShopOperator.toBuffer(),
      creator.toBuffer(),
      orderSalt,
    ],
    programId,
  )[0];
}

export async function getOrderData(
  connection: Connection,
  programId: PublicKey,
  goSwapShopOperator: PublicKey,
  creator: PublicKey,
  orderSalt: Buffer,
): Promise<OrderParams> {
  return createGoSwapShopRelayerProgramInterface(
    connection,
    programId,
  ).account.order.fetch(
    deriveOrderKey(programId, goSwapShopOperator, creator, orderSalt),
  ) as unknown as Promise<OrderParams>;
}
