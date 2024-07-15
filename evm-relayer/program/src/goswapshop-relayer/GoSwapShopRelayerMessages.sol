// SPDX-License-Identifier: Apache 2
pragma solidity ^0.8.20;

import {BytesLib} from "@modules/utils/BytesLib.sol";
import {GoSwapShopRelayerStructs} from "./GoSwapShopRelayerStructs.sol";

contract GoSwapShopRelayerMessages is GoSwapShopRelayerStructs {
    using BytesLib for bytes;

    /**
     * @notice Encode order info into bytes
     */
    function encodePayload(
        GoSwapShopRelayerMessage memory parsedMessage
    ) public pure returns (bytes memory encodedMessage) {
        encodedMessage = abi.encodePacked(
            parsedMessage.payloadID, // payloadID = 1
            parsedMessage.targetRecipient
        );
    }

    /**
     * @notice Decodes bytes into SwapShopVaultMessage struct
     */
    function decodePayload(
        bytes memory encodedMessage
    ) public pure returns (GoSwapShopRelayerMessage memory parsedMessage) {
        uint256 index = 0;

        // parse payloadId
        parsedMessage.payloadID = encodedMessage.toUint8(index);
        require(parsedMessage.payloadID == 1, "invalid payloadID");
        index += 1;
        
        // target wallet recipient
        parsedMessage.targetRecipient = encodedMessage.toBytes32(index);
        index += 32;

        // confirm that the payload was the expected size
        require(index == encodedMessage.length, "invalid payload length");
    }
}