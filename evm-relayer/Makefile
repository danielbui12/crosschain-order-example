include testing.env

.DEFAULT_GOAL = build
.PHONY: test unit-test forge-test unit-test-only integration-test build dependencies clean

test: unit-test integration-test

unit-test: forge-test

forge-test: build
	forge test --fork-url ${TESTING_AVAX_FORK_RPC} -vv

unit-test-only: 
	forge test --fork-url ${TESTING_AVAX_FORK_RPC} -vv

integration-test: build
	bash shell-scripts/run_integration_tests.sh

build: dependencies
	forge build
	yarn typechain --target=ethers-v5 --out-dir=ethers-contracts out/*/*.json

dependencies: node_modules \
    lib/forge-std lib/openzeppelin-contracts-upgradeable lib/openzeppelin-foundry-upgrades

clean:
	forge clean
	rm -rf node_modules anvil*.log lib ethers-contracts broadcast cache

node_modules:
	yarn

lib:
	forge install foundry-rs/forge-std@v1.8.1 --no-git --no-commit
	forge install openZeppelin/openzeppelin-foundry-upgrades@v0.2.1 --no-git --no-commit
	forge install openZeppelin/openzeppelin-contracts-upgradeable@v5.0.2 --no-git --no-commit
