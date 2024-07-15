import {
  Connection,
  PublicKey,
  PublicKeyInitData,
  TransactionInstruction,
} from "@solana/web3.js";
import { deriveRedeemerConfigKey } from "../accounts";
import { createGoSwapShopRelayerProgramInterface } from "../program";

export async function createUpdateRelayerFeeInstruction(
  connection: Connection,
  programId: PublicKeyInitData,
  payer: PublicKeyInitData,
  relayerFee: number,
  relayerFeePrecision: number,
): Promise<TransactionInstruction> {
  const program = createGoSwapShopRelayerProgramInterface(
    connection,
    programId,
  );

  return program.methods
    .updateRelayerFee(relayerFee, relayerFeePrecision)
    .accounts({
      owner: new PublicKey(payer),
      config: deriveRedeemerConfigKey(programId),
    })
    .instruction();
}
