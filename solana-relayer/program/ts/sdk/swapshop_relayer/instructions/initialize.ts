import { getTokenBridgeDerivedAccounts } from "@certusone/wormhole-sdk/lib/cjs/solana";
import { PublicKey } from "@metaplex-foundation/js";
import { Connection } from "@solana/web3.js";
import { deriveRedeemerConfigKey, deriveSenderConfigKey } from "../accounts";
import { createGoSwapShopRelayerProgramInterface } from "../program";

/**
 * Creates a _Initialize_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category Initialize
 * @category generated
 */
export function createInitializeInstruction(
  connection: Connection,
  programId: PublicKey,
  payer: PublicKey,
  tokenBridgeProgramId: PublicKey | string,
  wormholeProgramId: PublicKey | string,
  relayerFee: number,
  relayerFeePrecision: number,
) {
  const program = createGoSwapShopRelayerProgramInterface(
    connection,
    programId,
  );
  const tokenBridgeAccounts = getTokenBridgeDerivedAccounts(
    program.programId,
    tokenBridgeProgramId,
    wormholeProgramId,
  );
  return program.methods
    .initialize(relayerFee, relayerFeePrecision)
    .accounts({
      owner: payer,
      senderConfig: deriveSenderConfigKey(programId),
      redeemerConfig: deriveRedeemerConfigKey(programId),
      tokenBridgeProgram: new PublicKey(tokenBridgeProgramId),
      wormholeProgram: new PublicKey(wormholeProgramId),
      ...tokenBridgeAccounts,
    })
    .instruction();
}
