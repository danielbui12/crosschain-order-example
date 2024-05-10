/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from "@metaplex-foundation/beet";
/**
 * This type is used to derive the {@link RelayerMessage} type as well as the de/serializer.
 * However don't refer to it in your code but use the {@link RelayerMessage} type instead.
 *
 * @category userTypes
 * @category enums
 * @category generated
 * @private
 */
export type RelayerMessageRecord = {
    Msg: { recipient: number[] /* size: 32 */ };
};

/**
 * Union type respresenting the RelayerMessage data enum defined in Rust.
 *
 * NOTE: that it includes a `__kind` property which allows to narrow types in
 * switch/if statements.
 * Additionally `isRelayerMessage*` type guards are exposed below to narrow to a specific variant.
 *
 * @category userTypes
 * @category enums
 * @category generated
 */
export type RelayerMessage = beet.DataEnumKeyAsKind<RelayerMessageRecord>;

export const isRelayerMessageMsg = (
    x: RelayerMessage,
): x is RelayerMessage & { __kind: "Msg" } => x.__kind === "Msg";

/**
 * @category userTypes
 * @category generated
 */
export const relayerMessageBeet = beet.dataEnum<RelayerMessageRecord>([
    [
        "Msg",
        new beet.BeetArgsStruct<RelayerMessageRecord["Msg"]>(
            [["recipient", beet.uniformFixedSizeArray(beet.u8, 32)]],
            'RelayerMessageRecord["Msg"]',
        ),
    ],
]) as beet.FixableBeet<RelayerMessage, RelayerMessage>;