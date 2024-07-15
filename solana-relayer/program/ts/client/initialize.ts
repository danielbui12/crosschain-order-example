import { CONTRACTS } from '@certusone/wormhole-sdk';
import { PublicKey } from '@metaplex-foundation/js';
import { Connection } from '@solana/web3.js';
import { createInitializeInstruction } from "../sdk/swapshop_relayer";
import { boilerPlateReduction } from '../tests/helpers';
import { DEVNET, GOSWAPSHOP_RELAYER_ID, PAYER } from './const';

async function main() {
  const connection = new Connection(DEVNET, 'processed');
  const { expectIxToSucceed } = boilerPlateReduction(connection, PAYER);

  const ix = createInitializeInstruction(
    connection,
    GOSWAPSHOP_RELAYER_ID,
    PAYER.publicKey,
    new PublicKey(CONTRACTS.TESTNET.solana.token_bridge),
    new PublicKey(CONTRACTS.TESTNET.solana.core),
    0,
    10_000
  );

  console.log(await expectIxToSucceed(ix, PAYER));
}

main()
