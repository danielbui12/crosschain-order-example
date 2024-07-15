// SPDX-License-Identifier: Apache 2
pragma solidity ^0.8.20;

contract GoSwapShopRelayerStructs {
    error InsufficientBalance(uint256 actualAmount, uint256 requiredAmount);
    error NotRelayer(address msgSender);
    error TransferFailed();
    error OrderExisted(bytes32 orderId);
    error OrderUnconfirmed(bytes32 orderId);
    error Forbidden(string message);
    error OrderLocked();

    enum MakerOrTaker {
        Maker,
        Taker
    }

    struct Order {
        uint8 fee; // percentage
        MakerOrTaker orderOwner;
        uint16 chainId;
        uint80 claimDeadline;
        uint256 amount;
    }

    struct GoSwapShopRelayerMessage {
        // unique identifier for this message type
        uint8 payloadID;
        /**
         * The recipient's wallet address on the target chain, in bytes32
         * format (zero-left-padded if less than 20 bytes).
         */
        bytes32 targetRecipient;
    }
    
    event OrderSent(bytes32 orderId, Order order);
    event OrderCreated(bytes32 orderId, Order order);
    event OrderPlaced(bytes32 orderId, Order order);
    event OrderCanceled(bytes32 orderId, Order order);
    event OrderConfirmed(bytes32 orderId, Order order);
    event OrderClaimed(bytes32 orderId, Order order);
}