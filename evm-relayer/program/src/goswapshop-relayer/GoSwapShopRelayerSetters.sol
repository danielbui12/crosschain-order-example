// SPDX-License-Identifier: Apache 2
pragma solidity ^0.8.20;

import {GoSwapShopRelayerState, GoSwapShopRelayerStructs} from "./GoSwapShopRelayerState.sol";

contract GoSwapShopRelayerSetters is GoSwapShopRelayerState {
    function setOwner(address owner_) internal {
        _state.owner = owner_;
    }

    function setWormhole(address wormhole_) internal {
        _state.wormhole = payable(wormhole_);
    }

    function setTokenBridge(address tokenBridge_) internal {
        _state.tokenBridge = payable(tokenBridge_);
    }

    function setChainId(uint16 chainId_) internal {
        _state.chainId = chainId_;
    }

    function setWormholeFinality(uint8 finality) internal {
        _state.wormholeFinality = finality;
    }

    function setEmitter(uint16 chainId, bytes32 emitter) internal {
        _state.registeredEmitters[chainId] = emitter;
    }

    function setFeePrecision(uint32 feePrecision_) internal {
        _state.feePrecision = feePrecision_;
    }

    function setRelayerFeePercentage(uint32 relayerFeePercentage_) internal {
        _state.relayerFeePercentage = relayerFeePercentage_;
    }

    function setOrder(
        address user_,
        bytes32 orderId_,
        GoSwapShopRelayerStructs.Order memory order_
    ) internal {
        _state.existingOrders[orderId_] = true;
        _state.orders[user_][orderId_] = order_;
    }

    function _setSignatureVerifier(address target_) internal {
        _state.signatureVerifier = target_;
    }
}