import {
    ChainId,
    isBytes,
    ParsedTokenTransferVaa,
    parseTokenTransferVaa,
    SignedVaa,
} from "@certusone/wormhole-sdk";
import { CompleteTransferNativeWithPayloadCpiAccounts } from "@certusone/wormhole-sdk/lib/cjs/solana";
import {
    deriveCustodyKey,
    deriveCustodySignerKey,
    deriveEndpointKey,
    deriveRedeemerAccountKey,
    deriveTokenBridgeConfigKey,
} from "@certusone/wormhole-sdk/lib/cjs/solana/tokenBridge";
import {
    deriveClaimKey,
    derivePostedVaaKey,
} from "@certusone/wormhole-sdk/lib/cjs/solana/wormhole";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
    Connection,
    PublicKey,
    PublicKeyInitData,
    SystemProgram,
    SYSVAR_RENT_PUBKEY,
    TransactionInstruction,
} from "@solana/web3.js";
import {
    deriveBridgeTmpTokenAccountKey,
    deriveForeignContractKey,
    deriveOrderKey,
    deriveRedeemerConfigKey,
    deriveTmpTokenAccountKey,
} from "../accounts";
import { createRelayerProgramInterface } from "../program";

export async function createRedeemNativeTransferWithPayloadInstruction(
    connection: Connection,
    programId: PublicKey,
    seller: PublicKey,
    relayerOperator: PublicKey,
    tokenBridgeProgramId: PublicKey,
    wormholeProgramId: PublicKey,
    wormholeMessage: SignedVaa | ParsedTokenTransferVaa,
    orderSalt: Buffer,
): Promise<TransactionInstruction> {
    const program = createRelayerProgramInterface(
        connection,
        programId,
    );

    const parsed = isBytes(wormholeMessage)
        ? parseTokenTransferVaa(wormholeMessage)
        : wormholeMessage;

    const orderAccount = deriveOrderKey(
        programId,
        relayerOperator,
        seller,
        orderSalt,
    );
    const tmpTokenAccount = deriveTmpTokenAccountKey(
        programId,
        relayerOperator,
        seller,
        orderSalt,
    );
    const bridgeTmpTokenAccount = deriveBridgeTmpTokenAccountKey(
        programId,
        new PublicKey(parsed.tokenAddress),
    );
    const tokenBridgeAccounts = getCompleteTransferNativeWithPayloadCpiAccounts(
        tokenBridgeProgramId,
        wormholeProgramId,
        seller,
        parsed,
        bridgeTmpTokenAccount,
    );

    return program.methods
        .redeemNativeTransferWithPayload([...parsed.hash])
        .accounts({
            seller: seller,
            bridgeTmpTokenAccount: bridgeTmpTokenAccount,
            config: deriveRedeemerConfigKey(programId),
            foreignContract: deriveForeignContractKey(
                programId,
                parsed.emitterChain as ChainId,
            ),
            tmpTokenAccount,
            orderAccount,
            tokenBridgeProgram: new PublicKey(tokenBridgeProgramId),
            ...tokenBridgeAccounts,
        })
        .instruction();
}

// Temporary
export function getCompleteTransferNativeWithPayloadCpiAccounts(
    tokenBridgeProgramId: PublicKeyInitData,
    wormholeProgramId: PublicKeyInitData,
    payer: PublicKeyInitData,
    vaa: SignedVaa | ParsedTokenTransferVaa,
    toTokenAccount: PublicKeyInitData,
): CompleteTransferNativeWithPayloadCpiAccounts {
    const parsed = isBytes(vaa) ? parseTokenTransferVaa(vaa) : vaa;
    const mint = new PublicKey(parsed.tokenAddress);
    const cpiProgramId = new PublicKey(parsed.to);

    return {
        payer: new PublicKey(payer),
        tokenBridgeConfig: deriveTokenBridgeConfigKey(tokenBridgeProgramId),
        vaa: derivePostedVaaKey(wormholeProgramId, parsed.hash),
        tokenBridgeClaim: deriveClaimKey(
            tokenBridgeProgramId,
            parsed.emitterAddress,
            parsed.emitterChain,
            parsed.sequence,
        ),
        tokenBridgeForeignEndpoint: deriveEndpointKey(
            tokenBridgeProgramId,
            parsed.emitterChain,
            parsed.emitterAddress,
        ),
        toTokenAccount: new PublicKey(toTokenAccount),
        tokenBridgeRedeemer: deriveRedeemerAccountKey(cpiProgramId),
        toFeesTokenAccount: new PublicKey(toTokenAccount),
        tokenBridgeCustody: deriveCustodyKey(tokenBridgeProgramId, mint),
        mint,
        tokenBridgeCustodySigner: deriveCustodySignerKey(tokenBridgeProgramId),
        rent: SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        wormholeProgram: new PublicKey(wormholeProgramId),
    };
}
