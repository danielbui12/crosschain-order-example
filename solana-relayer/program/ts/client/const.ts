import { PublicKey } from '@metaplex-foundation/js';
import { Keypair } from '@solana/web3.js';

export const GOSWAPSHOP_RELAYER_ID = new PublicKey('GSS2BQQYmXSDkB25bwaumRMsaWJNDu18UzUByCWf1NaL');
export const DEVNET = 'https://api.devnet.solana.com'
export const PAYER = Keypair.fromSecretKey(Uint8Array.from([/* your keypair here */]));
