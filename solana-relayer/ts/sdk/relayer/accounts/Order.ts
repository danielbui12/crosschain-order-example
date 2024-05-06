import { PublicKey } from "@metaplex-foundation/js";
import { Connection } from "@solana/web3.js";
import { createRelayerProgramInterface } from "../program";
import { OrderParams } from "../types";

export function deriveOrderKey(
    programId: PublicKey,
    relayerOperator: PublicKey,
    creator: PublicKey,
    orderSalt: Buffer,
) {
    return PublicKey.findProgramAddressSync(
        [
            Buffer.from("order"),
            relayerOperator.toBuffer(),
            creator.toBuffer(),
            orderSalt,
        ],
        programId,
    )[0];
}

export async function getOrderData(
    connection: Connection,
    programId: PublicKey,
    relayerOperator: PublicKey,
    creator: PublicKey,
    orderSalt: Buffer,
): Promise<OrderParams> {
    return createRelayerProgramInterface(
        connection,
        programId,
    ).account.order.fetch(
        deriveOrderKey(programId, relayerOperator, creator, orderSalt),
    ) as unknown as Promise<OrderParams>;
}
