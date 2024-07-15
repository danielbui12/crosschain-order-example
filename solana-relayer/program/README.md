# SwapShop Smart contract in Solana

> 💡💡💡 Wormhole TESTNET is on Solana DEVNET

## Installation

### Rust

> Doc: https://www.rust-lang.org/tools/install

```shell
$ curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Solana

> Doc: https://docs.solanalabs.com/cli/install
>
> v1.16.31

```shell
$ sh -c "$(curl -sSfL https://release.solana.com/v1.16.31/install)"

### Depending on your system, the end of the installer messaging may prompt you to
### Please update your PATH environment variable to include the solana programs:
$ export PATH="/home/<this-is-your-user-name>/.local/share/solana/install/active_release/bin:$PATH"
```

### Anchor

```shell
$ cargo install --git https://github.com/project-serum/anchor --tag v0.28.0 anchor-cli --force --locked
```


## Usage

### Build

```shell
$ anchor build
```

### Testing

**1. With Local RPC**

```shell
$ solana program dump -u m wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb  program_modules/wormhold_token_bridge.so

$ solana program dump -u m worm2ZoG2kUd4vFXhvjh93UUH596ayRfgQ2MgjNMTth program_modules/wormhold_core_bridge.so

$ solana program dump -u m metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s program_modules/token_metadata_program.so


$ solana-test-validator --bpf-program metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s program_modules/token_metadata_program.so --bpf-program worm2ZoG2kUd4vFXhvjh93UUH596ayRfgQ2MgjNMTth program_modules/wormhold_core_bridge.so --bpf-program wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb program_modules/wormhold_token_bridge.so --reset

$ anchor test --skip-local-validator --skip-build
```

**2. Direct**

```shell
$ anchor test --skip-build
```

### Clean solana-cli cache if error 
> **error: not a directory: '~/.local/share/solana/install/releases/1.16.31/solana-release/bin/sdk/bpf/dependencies/bpf-tools/rust/lib'**

```shell
rm -rf ~/.cache/solana/*
```

## Deploy

```shell
$ solana program deploy target/deploy/goswapshop_relayer.so -u devnet --program-id target/deploy/goswapshop_relayer-keypair.json
```

or 

```shell
$ anchor deploy --provider.cluster devnet
```