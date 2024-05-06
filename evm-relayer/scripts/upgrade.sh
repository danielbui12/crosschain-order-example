#!/bin/bash
# shellcheck disable=all

## Upgrade
source .env && forge script --target-contract UpgradeRelayerV2 --rpc-url ${RPC_URL} --broadcast -vvvv scripts/deploy.sol
