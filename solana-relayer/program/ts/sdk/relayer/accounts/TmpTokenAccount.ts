import { deriveAddress } from "@certusone/wormhole-sdk/lib/cjs/solana";
import { PublicKey } from "@solana/web3.js";

export function deriveTmpTokenAccountKey(
    programId: PublicKey,
    relayerOperator: PublicKey,
    creator: PublicKey,
    orderSalt: Buffer,
) {
    return deriveAddress(
        [
            Buffer.from("tmp"),
            relayerOperator.toBuffer(),
            creator.toBuffer(),
            orderSalt,
        ],
        programId,
    );
}

export function deriveBridgeTmpTokenAccountKey(
    programId: PublicKey,
    mint: PublicKey,
) {
    return deriveAddress([Buffer.from("tmp"), mint.toBuffer()], programId);
}
