import { Program, Provider } from "@coral-xyz/anchor";
import { Connection, PublicKey, PublicKeyInitData } from "@solana/web3.js";

import IDL from "../../../target/idl/relayer.json";
import { Relayer } from "../../../target/types/relayer";

export function createRelayerProgramInterface(
    connection: Connection,
    programId: PublicKeyInitData,
    payer?: PublicKeyInitData,
): Program<Relayer> {
    const provider: Provider = {
        connection,
        publicKey: payer == undefined ? undefined : new PublicKey(payer),
    };
    return new Program<Relayer>(
        IDL as any,
        new PublicKey(programId),
        provider,
    );
}
