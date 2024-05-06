#!/bin/bash
# shellcheck disable=all

source .env && forge script --target-contract DeployRelayer --rpc-url ${RPC_URL} --broadcast -vvvv scripts/deploy.sol
