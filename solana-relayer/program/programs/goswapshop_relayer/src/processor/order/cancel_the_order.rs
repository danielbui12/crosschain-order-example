use anchor_lang::prelude::*;
use anchor_spl::{
    token::{Token, TokenAccount, Mint, Transfer, CloseAccount, transfer, close_account},
    // associated_token::{get_associated_token_address}
};
use wormhole_anchor_sdk::{token_bridge};

use crate::{
    utils::{calculate_product},
    state::{Order, SenderConfig},
    GoSwapShopError,
};

#[derive(Accounts)]
#[instruction(_order_salt: Vec<u8>)]
pub struct CancelTheOrder<'info> {
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
          @ GoSwapShopError::Forbidden,
    )]
    pub tmp_token_account: Box<Account<'info, TokenAccount>>,

    // TODO: adding validation to this
    ///
    // let (expected_pda, bump_seed) = Pubkey::find_program_address(&[b"vault"], &program_id);
    // let actual_pda = Pubkey::create_program_address(&[b"vault", &[bump_seed]], &program_id)?;
    // assert_eq!(expected_pda, actual_pda);
    ///
    #[account(mut)]
    pub order_account: Account<'info, Order>,

    #[account(
        mut,
        // constraint = 
        //   buyer_token_account.key() == order_account.buyer.key() &&  
        //   buyer.key() == get_associated_token_address(&mint.key(), &buyer.key())
        //   @ GoSwapShopError::Forbidden
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub buyer: Signer<'info>,

    pub token_program: Program<'info, Token>,
    
    /// System program.
    pub system_program: Program<'info, System>,
}

pub fn cancel_the_order(
    ctx: Context<CancelTheOrder>,
    _order_salt: Vec<u8>,
) -> Result<()> {
    let order_account: &mut Account<Order> =  &mut ctx.accounts.order_account;
    require!(
        order_account.claim_deadline <= Clock::get()?.unix_timestamp as u64,
        GoSwapShopError::LockedVault
    );

    // Transfer tokens from taker to initializer
    let config_seeds = &[
        SenderConfig::SEED_PREFIX.as_ref(),
        &[ctx.accounts.config.bump],
    ];
    let signer = [&config_seeds[..]];

    let truncated_amount = token_bridge::truncate_amount(order_account.amount, ctx.accounts.mint.decimals);
    transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.tmp_token_account.to_account_info(),
                to: ctx.accounts.buyer_token_account.to_account_info(),
                authority: ctx.accounts.config.to_account_info(),
            },
            &signer,
        ),
        calculate_product(truncated_amount, order_account.fee, order_account.order_owner.clone())?,
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