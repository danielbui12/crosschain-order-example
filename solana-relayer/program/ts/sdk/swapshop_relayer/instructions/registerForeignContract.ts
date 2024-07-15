import { ChainId } from "@certusone/wormhole-sdk";
import { deriveEndpointKey } from "@certusone/wormhole-sdk/lib/cjs/solana/tokenBridge";
import {
  Connection,
  PublicKey,
  PublicKeyInitData,
  TransactionInstruction,
} from "@solana/web3.js";
import { deriveForeignContractKey, deriveSenderConfigKey } from "../accounts";
import { createGoSwapShopRelayerProgramInterface } from "../program";

export async function createRegisterForeignContractInstruction(
  connection: Connection,
  programId: PublicKeyInitData,
  payer: PublicKeyInitData,
  tokenBridgeProgramId: PublicKeyInitData,
  chain: ChainId,
  contractAddress: Buffer,
  tokenBridgeForeignAddress: string,
): Promise<TransactionInstruction> {
  const program = createGoSwapShopRelayerProgramInterface(
    connection,
    programId,
  );

  return program.methods
    .registerForeignContract(chain, [...contractAddress])
    .accounts({
      owner: new PublicKey(payer),
      config: deriveSenderConfigKey(program.programId),
      foreignContract: deriveForeignContractKey(program.programId, chain),
      tokenBridgeForeignEndpoint: deriveEndpointKey(
        tokenBridgeProgramId,
        chain,
        tokenBridgeForeignAddress,
      ),
      tokenBridgeProgram: new PublicKey(tokenBridgeProgramId),
    })
    .instruction();
}
