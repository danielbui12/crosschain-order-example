use anchor_lang::prelude::*;
use anchor_spl::{
    token::{Token, TokenAccount, Mint, CloseAccount, close_account},
};
use wormhole_anchor_sdk::{token_bridge};

use crate::{
    utils::{calculate_product, valid_foreign_chain_id},
    state::{Order, SenderConfig, MakerOrTaker},
    GoSwapShopError,
};

#[derive(Accounts)]
#[instruction(_order_salt: Vec<u8>)]
pub struct ConfirmTheOrder<'info> {
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

    // TODO: adding validation to this
    #[account(mut)]
    pub order_account: Account<'info, Order>,

    #[account(mut)]
    pub seller_tmp_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint =
          tmp_token_account.owner == config.key()
          @ GoSwapShopError::Forbidden,
    )]
    pub tmp_token_account: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub buyer: Signer<'info>,

    pub token_program: Program<'info, Token>,

    /// System program.
    pub system_program: Program<'info, System>,
}

pub fn confirm_the_order(
    ctx: Context<ConfirmTheOrder>,
    _order_salt: Vec<u8>,
) -> Result<()> {
    let order_account: &mut Account<Order> =  &mut ctx.accounts.order_account;
    require!(!valid_foreign_chain_id(order_account.chain_id), GoSwapShopError::InvalidChain);
    // transfer taker fee
    let config_seeds = &[
        SenderConfig::SEED_PREFIX.as_ref(),
        &[ctx.accounts.config.bump],
    ];
    let signer = [&config_seeds[..]];

    let truncated_amount = token_bridge::truncate_amount(order_account.amount, ctx.accounts.mint.decimals);
    // transfer to Seller tmp_token_account
    anchor_spl::token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            anchor_spl::token::Transfer {
                from: ctx.accounts.tmp_token_account.to_account_info(),
                to: ctx.accounts.seller_tmp_token_account.to_account_info(),
            
                authority: ctx.accounts.config.to_account_info(),
            },
            &signer,
        ),
        calculate_product(truncated_amount, order_account.fee, MakerOrTaker::Taker)?,
      )?;
      
    // Finish instruction by closing tmp_token_account.
    close_account(CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        CloseAccount {
            account: ctx.accounts.tmp_token_account.to_account_info(),
            destination: ctx.accounts.buyer.to_account_info(),
            authority: ctx.accounts.config.to_account_info(),
        },
        &signer,
    ))?;
    Ok(())
}