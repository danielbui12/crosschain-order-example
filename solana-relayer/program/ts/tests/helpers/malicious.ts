import {
    ChainId,
    parseTokenBridgeRegisterChainVaa,
    SignedVaa,
    tryNativeToUint8Array,
} from "@certusone/wormhole-sdk";
import { deriveAddress } from "@certusone/wormhole-sdk/lib/cjs/solana";
import {
    createReadOnlyTokenBridgeProgramInterface,
    deriveTokenBridgeConfigKey,
    RegisterChainAccounts,
} from "@certusone/wormhole-sdk/lib/cjs/solana/tokenBridge";
import {
    deriveClaimKey,
    derivePostedVaaKey,
} from "@certusone/wormhole-sdk/lib/cjs/solana/wormhole";
import {
    Keypair,
    PublicKey,
    PublicKeyInitData,
    SystemProgram,
    SYSVAR_RENT_PUBKEY,
    TransactionInstruction,
} from "@solana/web3.js";
import * as bs58 from "bs58";
import { MakerOrTaker } from '../../sdk/relayer/types/MakerOrTaker';

export function createMaliciousRegisterChainInstruction(
    tokenBridgeProgramId: PublicKeyInitData,
    wormholeProgramId: PublicKeyInitData,
    payer: PublicKeyInitData,
    vaa: SignedVaa,
): TransactionInstruction {
    const methods =
        createReadOnlyTokenBridgeProgramInterface(
            tokenBridgeProgramId,
        ).methods.registerChain();

    // @ts-ignore
    return methods._ixFn(...methods._args, {
        accounts: getRegisterChainAccounts(
            tokenBridgeProgramId,
            wormholeProgramId,
            payer,
            vaa,
        ) as any,
        signers: undefined,
        remainingAccounts: undefined,
        preInstructions: undefined,
        postInstructions: undefined,
    });
}

export function getRegisterChainAccounts(
    tokenBridgeProgramId: PublicKeyInitData,
    wormholeProgramId: PublicKeyInitData,
    payer: PublicKeyInitData,
    vaa: SignedVaa,
): RegisterChainAccounts {
    const parsed = parseTokenBridgeRegisterChainVaa(vaa);
    return {
        payer: new PublicKey(payer),
        config: deriveTokenBridgeConfigKey(tokenBridgeProgramId),
        endpoint: deriveMaliciousTokenBridgeEndpointKey(
            tokenBridgeProgramId,
            parsed.foreignChain as ChainId,
            parsed.foreignAddress,
        ),
        vaa: derivePostedVaaKey(wormholeProgramId, parsed.hash),
        claim: deriveClaimKey(
            tokenBridgeProgramId,
            parsed.emitterAddress,
            parsed.emitterChain,
            parsed.sequence,
        ),
        rent: SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
        wormholeProgram: new PublicKey(wormholeProgramId),
    };
}

export function deriveMaliciousTokenBridgeEndpointKey(
    tokenBridgeProgramId: PublicKeyInitData,
    emitterChain: ChainId,
    emitterAddress: Buffer,
): PublicKey {
    if (typeof emitterAddress == "string")
        emitterAddress = Buffer.from(
            tryNativeToUint8Array(emitterAddress, emitterChain),
        );

    return deriveAddress(
        [
            (() => {
                const buf = Buffer.alloc(2);
                buf.writeUInt16BE(emitterChain);
                return buf;
            })(),
            emitterAddress,
        ],
        tokenBridgeProgramId,
    );
}

export const getEpochTimestampFromTime = (time: number | string) => {
    return Math.floor(new Date(time).getTime() / 1000);
};

export const randomIntFromInterval = (
    min: number = 1,
    max: number = 10,
): number => {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

export function decode(stuff: string) {
    return bufferToArray(Buffer.from(bs58.decode(stuff)));
}

function bufferToArray(buffer: Buffer): number[] {
    const nums: number[] = [];
    for (let i = 0; i < buffer.length; i++) {
        nums.push(buffer[i]);
    }
    return nums;
}

export const makeId = (): Buffer => {
    // Generate a new random keypair
    const keypair = Keypair.generate();

    // Get the public key from the keypair
    return keypair.publicKey.toBuffer();
};

export const calculateFee = (product: bigint, fee: bigint) => {
    return (product * fee) / 10_000n;
};

export const calculateProduct = (
    product: bigint,
    fee: bigint,
    side: MakerOrTaker,
) => {
    const _fee = calculateFee(product, fee);
    if (side === MakerOrTaker.Maker) {
        return product - _fee;
    } else {
        return product + _fee;
    }
};

export const calculateFeeRate = (product: bigint, direction: MakerOrTaker) => {
    return 100;
}