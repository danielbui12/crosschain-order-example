#!/bin/bash
# shellcheck disable=all

## Upgrade
source .env && forge script --target-contract UpgradeGoSwapShopRelayerV2 --rpc-url ${RPC_URL} --broadcast -vvvv scripts/DeployGoSwapShopRelayer.s.sol

# amoy polygon

# sepolia