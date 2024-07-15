#!/bin/bash
# shellcheck disable=all

# moonbase-alphanet
source .env && forge script --target-contract DeployGoSwapShopRelayer --rpc-url ${RPC_URL} --broadcast -vvvv scripts/DeployGoSwapShopRelayer.s.sol

# amoy polygon

# sepolia




# private_key=$1
# rpc_url=$2
# contract_file=$3
# etherscan_api_key=$4
# shift 4
# constructor_args=("$@")

# if [ -z "$private_key" ] || [ -z "$rpc_url" ] || [ -z "$contract_file" ]; then
#     echo "Usage: $0 <private_key> <rpc_url> <contract_file> [etherscan_api_key] [constructor_args...]"
#     exit 1
# fi

# etherscan_option=""
# verify_option=""

# if [ -n "$etherscan_api_key" ]; then
#     etherscan_option="--etherscan-api-key $etherscan_api_key"
#     verify_option="--verify"
# fi

# forge create --rpc-url "$rpc_url" \
#     --constructor-args "${constructor_args[@]}" \
#     --private-key "$private_key" \
#     $etherscan_option \
#     $verify_option \
#     "$contract_file"

