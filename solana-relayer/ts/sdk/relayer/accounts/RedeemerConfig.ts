import { deriveAddress } from "@certusone/wormhole-sdk/lib/cjs/solana";
import { Connection, PublicKeyInitData } from "@solana/web3.js";
import { createRelayerProgramInterface } from "../program";
import { RedeemerConfigData } from "../types";

export function deriveRedeemerConfigKey(programId: PublicKeyInitData) {
    return deriveAddress([Buffer.from("redeemer")], programId);
}

export async function getRedeemerConfigData(
    connection: Connection,
    programId: PublicKeyInitData,
): Promise<RedeemerConfigData> {
    return createRelayerProgramInterface(
        connection,
        programId,
    ).account.redeemerConfig.fetch(deriveRedeemerConfigKey(programId));
}
