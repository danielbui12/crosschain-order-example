import { CONTRACTS } from "@certusone/wormhole-sdk";
import { MockGuardians } from "@certusone/wormhole-sdk/lib/cjs/mock";
import { Keypair, PublicKey } from "@solana/web3.js";

export const NETWORK = "MAINNET";

export const WORMHOLE_CONTRACTS = CONTRACTS[NETWORK];
export const CORE_BRIDGE_PID = new PublicKey(WORMHOLE_CONTRACTS.solana.core);
export const TOKEN_BRIDGE_PID = new PublicKey(
    WORMHOLE_CONTRACTS.solana.token_bridge,
);

export const LOCALHOST = "http://localhost:8899";

export const RELAYER_OPERATOR_KEYPAIR = Keypair.fromSecretKey(
    Uint8Array.from([
        53, 71, 215, 99, 245, 135, 6, 58, 55, 69, 34, 181, 119, 14, 206, 86, 132,
        140, 250, 100, 177, 123, 13, 111, 90, 85, 1, 142, 197, 230, 213, 34, 9, 100,
        33, 210, 3, 9, 31, 162, 188, 212, 197, 57, 163, 248, 3, 213, 185, 51, 204,
        30, 97, 235, 37, 60, 234, 224, 103, 150, 83, 16, 136, 113,
    ]),
);
export const OWNER_KEYPAIR = Keypair.fromSecretKey(
    Uint8Array.from([
        254, 235, 184, 105, 233, 46, 195, 139, 100, 228, 250, 168, 189, 240, 52,
        175, 210, 54, 179, 88, 131, 96, 68, 94, 231, 235, 251, 161, 19, 204, 172,
        99, 8, 208, 241, 39, 121, 229, 221, 10, 204, 191, 77, 40, 79, 116, 150, 148,
        65, 191, 106, 222, 167, 91, 235, 217, 175, 118, 43, 122, 137, 160, 239, 142,
    ]),
);
export const BUYER_KEYPAIR = Keypair.fromSecretKey(
    Uint8Array.from([
        232, 33, 124, 16, 208, 115, 111, 65, 155, 7, 36, 225, 29, 33, 239, 179, 255,
        29, 24, 173, 5, 59, 132, 255, 248, 85, 146, 109, 119, 235, 135, 96, 194,
        145, 178, 87, 185, 99, 164, 121, 187, 197, 165, 106, 166, 82, 84, 148, 166,
        215, 8, 230, 40, 255, 42, 214, 28, 134, 121, 201, 157, 42, 252, 165,
    ]),
);
export const SELLER_KEYPAIR = Keypair.fromSecretKey(
    Uint8Array.from([
        198, 148, 134, 52, 231, 16, 85, 236, 40, 98, 237, 158, 138, 14, 74, 11, 180,
        186, 41, 97, 164, 81, 5, 60, 4, 160, 30, 78, 254, 116, 166, 59, 8, 180, 214,
        253, 204, 84, 94, 161, 96, 148, 157, 231, 238, 143, 66, 90, 146, 73, 124,
        137, 198, 108, 82, 152, 134, 121, 183, 2, 133, 197, 196, 7,
    ]),
);
export const RELAYER_KEYPAIR = Keypair.fromSecretKey(
    Uint8Array.from([
        238, 58, 48, 228, 76, 78, 21, 24, 128, 232, 49, 29, 196, 177, 101, 65, 246,
        99, 173, 1, 67, 221, 104, 138, 76, 55, 52, 195, 135, 51, 107, 175, 8, 117,
        253, 121, 246, 219, 141, 241, 241, 217, 133, 76, 12, 127, 212, 58, 0, 151,
        96, 237, 30, 90, 195, 224, 15, 64, 253, 224, 233, 119, 240, 80,
    ]),
);

//this is the WETH mainnet address - but any address will do for local testing
export const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

export const GOVERNANCE_EMITTER_ADDRESS = new PublicKey(
    "11111111111111111111111111111115",
);

export const MOCK_GUARDIANS = new MockGuardians(0, [
    "cfb12303a19cde580bb4dd771639b0d26bc68353645571a8cff516ab2ee113a0",
]);

export const MINTS_WITH_DECIMALS = new Map<
    number,
    { privateKey: Uint8Array; publicKey: PublicKey }
>([
    [
        8,
        {
            privateKey: Uint8Array.from([
                129, 227, 235, 186, 104, 13, 185, 244, 16, 185, 108, 95, 83, 214, 115,
                244, 194, 207, 250, 150, 180, 86, 70, 198, 97, 40, 71, 3, 26, 185, 48,
                222, 226, 136, 99, 75, 72, 182, 148, 76, 211, 140, 155, 55, 62, 44, 71,
                127, 72, 42, 114, 4, 86, 16, 64, 54, 37, 143, 66, 162, 104, 70, 220, 47,
            ]),
            publicKey: new PublicKey("GFHmBkLYsPSiWbqGD54VmmVKDs9shYVdFnHuNRu1QhTL"),
        },
    ],
    [
        9,
        {
            privateKey: Uint8Array.from([
                98, 139, 243, 120, 236, 152, 36, 219, 202, 42, 72, 178, 107, 155, 181,
                134, 120, 36, 55, 108, 253, 218, 96, 139, 80, 99, 85, 54, 116, 145, 94,
                40, 227, 10, 159, 48, 118, 75, 67, 84, 239, 36, 177, 138, 6, 214, 73,
                149, 26, 100, 255, 28, 218, 167, 251, 229, 93, 236, 25, 225, 152, 104,
                223, 54,
            ]),
            publicKey: new PublicKey("GHGwbrTCsynp7yJ9keowy2Roe5DzxFbayAaAwLyAvRKj"),
        },
    ],
]);
