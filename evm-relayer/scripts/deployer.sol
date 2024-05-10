// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "forge-std/Script.sol"; // solhint-disable
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import {Relayer} from "../src/relayer/Relayer.sol";

abstract contract DeployScript is Script {
    uint256 public immutable privateKey;
    address public implementation;
    bytes public data;
    address public proxyAddress;

    error InvalidAddress(string reason);

    modifier create() {
        _;
        if (implementation == address(0)) {
            revert InvalidAddress("implementation address can not be zero");
        }
        proxyAddress = address(new ERC1967Proxy(implementation, data));
    }

    modifier upgrade() {
        _;
        if (proxyAddress == address(0)) {
            revert InvalidAddress("proxy address can not be zero");
        }
        if (implementation == address(0)) {
            revert InvalidAddress("implementation address can not be zero");
        }
        UUPSUpgradeable proxy = UUPSUpgradeable(proxyAddress);
        proxy.upgradeToAndCall(address(implementation), data);
    }

    constructor(uint256 pkey) {
        privateKey = pkey;
    }

    function run() external {
        vm.startBroadcast(privateKey);
        _run();
        vm.stopBroadcast();
    }

    function _run() internal virtual;
}

contract DeployRelayer is DeployScript {
    constructor() DeployScript(vm.envUint("PRIVATE_KEY")) {}

    //slither-disable-next-line reentrancy-no-eth
    function _run() internal override create {
        Relayer c = new Relayer();
        implementation = address(c);
        data = bytes.concat(
            abi.encodeWithSelector(
                c.initialize.selector,
                vm.envAddress("OWNER"),
                vm.envAddress("SIGNATURE_VERIFIER"),
                vm.envAddress("WORMHOLE_CORE"),
                vm.envAddress("WORMHOLE_TOKEN_BRIDGE"),
                vm.envUint("WORMHOLE_CHAIN_ID"),
                vm.envUint("WORMHOLE_FINALITY"),
                vm.envUint("FEE_PRECISION"),
                vm.envUint("FEE_PERCENTAGE")
            )
        );
    }
}

contract UpgradeRelayerV2 is DeployScript {
    constructor() DeployScript(vm.envUint("PRIVATE_KEY")) {
        proxyAddress = vm.envAddress("PROXY");
    }

    //slither-disable-next-line reentrancy-no-eth
    function _run() internal override upgrade {
        Relayer c = new Relayer();
        implementation = address(c);
        data = "";
    }
}
