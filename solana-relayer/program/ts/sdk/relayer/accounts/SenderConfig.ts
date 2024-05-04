import { deriveAddress } from "@certusone/wormhole-sdk/lib/cjs/solana";
import { Connection, PublicKeyInitData } from "@solana/web3.js";
import { createRelayerProgramInterface } from "../program";
import { SenderConfigData } from "../types";

export function deriveSenderConfigKey(programId: PublicKeyInitData) {
    return deriveAddress([Buffer.from("sender")], programId);
}

export async function getSenderConfigData(
    connection: Connection,
    programId: PublicKeyInitData,
): Promise<SenderConfigData> {
    return createRelayerProgramInterface(
        connection,
        programId,
    ).account.senderConfig.fetch(
        deriveSenderConfigKey(programId),
    ) as unknown as Promise<SenderConfigData>;
}
