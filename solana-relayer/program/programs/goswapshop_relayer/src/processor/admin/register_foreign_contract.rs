use anchor_lang::prelude::*;
use wormhole_anchor_sdk::{token_bridge, wormhole};

use crate::{
    state::{ForeignContract, SenderConfig},
    GoSwapShopError,
};

#[derive(Accounts)]
#[instruction(chain: u16)]
pub struct RegisterForeignContract<'info> {
    #[account(mut)]
    /// Owner of the program set in the [`SenderConfig`] account. Signer for
    /// creating [`ForeignContract`] account.
    pub owner: Signer<'info>,

    #[account(
        has_one = owner @ GoSwapShopError::OwnerOnly,
        seeds = [SenderConfig::SEED_PREFIX],
        bump
    )]
    /// Sender Config account. This program requires that the `owner` specified
    /// in the context equals the pubkey specified in this account. Read-only.
    pub config: Box<Account<'info, SenderConfig>>,

    #[account(
        init_if_needed,
        payer = owner,
        seeds = [
            ForeignContract::SEED_PREFIX,
            &chain.to_le_bytes()[..]
        ],
        bump,
        space = ForeignContract::LEN
    )]
    /// Foreign Contract account. Create this account if an emitter has not been
    /// registered yet for this Wormhole chain ID. If there already is a
    /// contract address saved in this account, overwrite it.
    pub foreign_contract: Box<Account<'info, ForeignContract>>,

    #[account(
        seeds = [
            &chain.to_be_bytes(),
            token_bridge_foreign_endpoint.emitter_address.as_ref()
        ],
        bump,
        seeds::program = token_bridge_program
    )]
    /// Token Bridge foreign endpoint. This account should really be one
    /// endpoint per chain, but Token Bridge's PDA allows for multiple
    /// endpoints for each chain. We store the proper endpoint for the
    /// emitter chain.
    pub token_bridge_foreign_endpoint: Account<'info, token_bridge::EndpointRegistration>,

    /// Token Bridge program.
    pub token_bridge_program: Program<'info, token_bridge::program::TokenBridge>,

    /// System program.
    pub system_program: Program<'info, System>,
}

pub fn register_foreign_contract(
    ctx: Context<RegisterForeignContract>,
    chain: u16,
    address: [u8; 32],
) -> Result<()> {
    // Foreign emitter cannot share the same Wormhole Chain ID as the
    // Solana Wormhole program's. And cannot register a zero address.
    require!(
        chain > 0 && chain != wormhole::CHAIN_ID_SOLANA && !address.iter().all(|&x| x == 0),
        GoSwapShopError::InvalidForeignContract,
    );

    // Save the emitter info into the ForeignEmitter account.
    let emitter = &mut ctx.accounts.foreign_contract;
    emitter.chain = chain;
    emitter.address = address;
    emitter.token_bridge_foreign_endpoint = ctx.accounts.token_bridge_foreign_endpoint.key();

    // Done.
    Ok(())
}