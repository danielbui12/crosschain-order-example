import { Program, Provider } from "@coral-xyz/anchor";
import { Connection, PublicKey, PublicKeyInitData } from "@solana/web3.js";

import IDL from "../../../target/idl/goswapshop_relayer.json";
import { GoswapshopRelayer } from "../../../target/types/goswapshop_relayer";

export function createGoSwapShopRelayerProgramInterface(
  connection: Connection,
  programId: PublicKeyInitData,
  payer?: PublicKeyInitData,
): Program<GoswapshopRelayer> {
  const provider: Provider = {
    connection,
    publicKey: payer == undefined ? undefined : new PublicKey(payer),
  };
  return new Program<GoswapshopRelayer>(
    IDL as any,
    new PublicKey(programId),
    provider,
  );
}
