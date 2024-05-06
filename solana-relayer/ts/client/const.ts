import { PublicKey } from '@metaplex-foundation/js';
import { Keypair } from '@solana/web3.js';

export const relayer_RELAYER_ID = new PublicKey('AdroeVETVcgC8ckBWCyZDnHeFXVbv1cQ1zkzuZjCe3Kt');
export const DEVNET = 'https://api.devnet.solana.com'
export const PAYER = Keypair.fromSecretKey(Uint8Array.from([/* your keypair here */]));
