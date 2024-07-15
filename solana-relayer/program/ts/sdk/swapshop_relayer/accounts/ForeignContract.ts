import { ChainId } from "@certusone/wormhole-sdk";
import { deriveAddress } from "@certusone/wormhole-sdk/lib/cjs/solana";
import { Connection, PublicKeyInitData } from "@solana/web3.js";
import { createGoSwapShopRelayerProgramInterface } from "../program";
import { ForeignEmitter } from "../types";

export function deriveForeignContractKey(
  programId: PublicKeyInitData,
  chain: ChainId,
) {
  return deriveAddress(
    [
      Buffer.from("foreign_contract"),
      (() => {
        const buf = Buffer.alloc(2);
        buf.writeUInt16LE(chain);
        return buf;
      })(),
    ],
    programId,
  );
}

export async function getForeignContractData(
  connection: Connection,
  programId: PublicKeyInitData,
  chain: ChainId,
): Promise<ForeignEmitter> {
  const { address } = await createGoSwapShopRelayerProgramInterface(
    connection,
    programId,
  ).account.foreignContract.fetch(deriveForeignContractKey(programId, chain));

  return {
    chain,
    address: Buffer.from(address),
  };
}
