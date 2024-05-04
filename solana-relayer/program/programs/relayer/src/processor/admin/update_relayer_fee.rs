use anchor_lang::prelude::*;

use crate::{state::RedeemerConfig, RelayerError};

#[derive(Accounts)]
pub struct UpdateRelayerFee<'info> {
    #[account(mut)]
    /// CHECK: Owner of the program set in the [`RedeemerConfig`] account.
    pub owner: UncheckedAccount<'info>,

    #[account(
        mut,
        has_one = owner @ RelayerError::OwnerOnly,
        seeds = [RedeemerConfig::SEED_PREFIX],
        bump
    )]
    /// Redeemer Config account. This program requires that the `owner`
    /// specified in the context equals the pubkey specified in this account.
    /// Mutable.
    pub config: Box<Account<'info, RedeemerConfig>>,

    /// System program.
    pub system_program: Program<'info, System>,
}

pub fn update_relayer_fee(
    ctx: Context<UpdateRelayerFee>,
    relayer_fee: u32,
    relayer_fee_precision: u32,
) -> Result<()> {
    require!(
        relayer_fee < relayer_fee_precision,
        RelayerError::InvalidRelayerFee,
    );

    let config = &mut ctx.accounts.config;
    config.relayer_fee = relayer_fee;
    config.relayer_fee_precision = relayer_fee_precision;

    // Done.
    Ok(())
}
