import { ChainId } from "@certusone/wormhole-sdk";
import { PublicKey } from "@metaplex-foundation/js";
import { Claimer } from "./Claimer";
import { InboundTokenBridgeAddresses } from "./InboundTokenBridgeAddresses";
import { OutboundTokenBridgeAddresses } from "./OutboundTokenBridgeAddresses";

export interface SendTokensParams {
  batchId: number;
  recipientAddress: Buffer;
}

export type OrderParams = {
  makerFee: bigint;
  takerFee: bigint;
  chainId: ChainId;
  claimDeadline: bigint;
  amount: bigint;
  claimer: Claimer;
  buyer: PublicKey;
  seller: PublicKey;
};

export interface SenderConfigData {
  owner: PublicKey;
  bump: number;
  tokenBridge: OutboundTokenBridgeAddresses;
  finality: number;
  relayerFee: number;
}

export interface RedeemerConfigData {
  owner: PublicKey;
  bump: number;
  tokenBridge: InboundTokenBridgeAddresses;
  relayerFee: number;
  relayerFeePrecision: number;
}

export interface ForeignEmitter {
  chain: ChainId;
  address: Buffer;
}
