use anchor_lang::prelude::*;
use anchor_spl::token::{
    close_account, transfer, CloseAccount, Mint, Token, TokenAccount, Transfer,
};
use wormhole_anchor_sdk::token_bridge;

use crate::{
    state::{MakerOrTaker, Order, SenderConfig},
    utils::{calculate_fee_rate, calculate_product},
    RelayerError,
};

#[derive(Accounts)]
#[instruction(_order_salt: Vec<u8>)]
pub struct ClaimTheOrder<'info> {
    #[account(mut)]
    /// Mint info. This is the SPL token that will be bridged over to the
    /// foreign contract. Mutable.
    pub mint: Box<Account<'info, Mint>>,

    #[account(
        seeds = [SenderConfig::SEED_PREFIX],
        bump
    )]
    /// Sender Config account. Acts as the Token Bridge sender PDA. Mutable.
    pub config: Box<Account<'info, SenderConfig>>,

    #[account(
        mut,
        constraint =
          tmp_token_account.owner == config.key()
          @ RelayerError::Forbidden,
    )]
    pub tmp_token_account: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub order_account: Account<'info, Order>,

    #[account(mut)]
    pub vault_token_account: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub seller_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub relayer: Signer<'info>,

    #[account(mut)]
    pub seller: Signer<'info>,

    pub token_program: Program<'info, Token>,

    /// System program.
    pub system_program: Program<'info, System>,
}

pub fn claim_the_order(ctx: Context<ClaimTheOrder>, _order_salt: Vec<u8>) -> Result<()> {
    let order_account: &mut Account<Order> = &mut ctx.accounts.order_account;

    require!(
        order_account.claim_deadline <= Clock::get()?.unix_timestamp as u64,
        RelayerError::LockedVault
    );

    let config_seeds = &[
        SenderConfig::SEED_PREFIX.as_ref(),
        &[ctx.accounts.config.bump],
    ];
    let signer = [&config_seeds[..]];
    let truncated_amount =
        token_bridge::truncate_amount(order_account.amount, ctx.accounts.mint.decimals);
    let total_balance = token_bridge::truncate_amount(
        calculate_product(
            truncated_amount,
            calculate_fee_rate(truncated_amount, MakerOrTaker::Taker),
            MakerOrTaker::Taker,
        )?,
        ctx.accounts.mint.decimals,
    );
    let product = calculate_product(
        truncated_amount,
        order_account.fee,
        order_account.order_owner.clone(),
    )?;

    msg!("total_balance {}", total_balance);
    msg!("the rest {}", total_balance - product);
    // transfer token to Seller
    transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.tmp_token_account.to_account_info(),
                to: ctx.accounts.seller_token_account.to_account_info(),
                authority: ctx.accounts.config.to_account_info(),
            },
            &signer,
        ),
        product,
    )?;

    // take the maker & taker fee
    transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.tmp_token_account.to_account_info(),
                to: ctx.accounts.vault_token_account.to_account_info(),
                authority: ctx.accounts.config.to_account_info(),
            },
            &signer,
        ),
        total_balance - product,
    )?;

    // Finish instruction by closing tmp_token_account.
    close_account(CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        CloseAccount {
            account: ctx.accounts.tmp_token_account.to_account_info(),
            destination: ctx.accounts.seller.to_account_info(),
            authority: ctx.accounts.config.to_account_info(),
        },
        &signer,
    ))?;

    Ok(())
}
