// SPDX-License-Identifier: Apache 2
pragma solidity ^0.8.20;

import {IWormhole} from "@modules/wormhole/IWormhole.sol";
import {ITokenBridge} from "@modules/wormhole/ITokenBridge.sol";

import {RelayerSetters, RelayerStructs} from "./RelayerSetters.sol";

contract RelayerGetters is RelayerSetters {
    function owner() public view returns (address) {
        return _state.owner;
    }

    function wormhole() public view returns (IWormhole) {
        return IWormhole(_state.wormhole);
    }

    function tokenBridge() public view returns (ITokenBridge) {
        return ITokenBridge(payable(_state.tokenBridge));
    }

    function chainId() public view returns (uint16) {
        return _state.chainId;
    }

    function wormholeFinality() public view returns (uint8) {
        return _state.wormholeFinality;
    }

    function getRegisteredEmitter(
        uint16 emitterChainId
    ) public view returns (bytes32) {
        return _state.registeredEmitters[emitterChainId];
    }

    function feePrecision() public view returns (uint32) {
        return _state.feePrecision;
    }

    function relayerFeePercentage() public view returns (uint32) {
        return _state.relayerFeePercentage;
    }

    function isOrderExisted(bytes32 orderId_) public view returns (bool) {
        return _state.existingOrders[orderId_];
    }

    function getOrderData(
        address user_,
        bytes32 orderId_
    ) public view returns (RelayerStructs.Order memory) {
        return _state.orders[user_][orderId_];
    }
}
