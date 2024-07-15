use anchor_lang::prelude::*;
use anchor_spl::{
    token::{Mint, Token, TokenAccount},
};
use wormhole_anchor_sdk::token_bridge::truncate_amount;

use crate::{
    utils::{calculate_product, calculate_fee_rate},
    constant::*,
    state::{Order, MakerOrTaker, SenderConfig},
};

#[derive(Accounts)]
#[instruction(_order_salt: Vec<u8>)]
pub struct PlaceAnOrder<'info> {
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
        init,
        payer = buyer,
        seeds = [
            SEED_PREFIX_TMP,
            goswapshop.key().as_ref(),
            buyer.key().as_ref(),
            &_order_salt,
        ],
        bump,
        token::mint = mint,
        token::authority = config,
    )]
    /// Program's temporary token account. This account is created before the
    /// instruction is invoked to temporarily take custody of the payer's
    /// tokens. When the tokens are finally bridged out, the token account
    /// will have zero balance and can be closed.
    pub tmp_token_account: Box<Account<'info, TokenAccount>>,

    #[account(
        init,
        seeds = [
            Order::SEED_PREFIX,
            goswapshop.key().as_ref(),
            buyer.key().as_ref(),
            &_order_salt,
        ],
        bump,
        payer = buyer,
        space = Order::LEN
    )]
    pub order_account: Account<'info, Order>,

    // TODO: need to send the seller's `order_account` to validate the `amount`

    #[account(mut)]
    pub buyer_token_account: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(mut)]
    pub goswapshop: Signer<'info>,

    pub token_program: Program<'info, Token>,
    /// System program.
    pub system_program: Program<'info, System>,
}

#[allow(clippy::too_many_arguments)]
pub fn place_an_order(
    ctx: Context<PlaceAnOrder>,
    _order_salt: Vec<u8>,
    amount: u64,
    chain_id: u16,
) -> Result<()> {
    let order_account: &mut Account<Order> =  &mut ctx.accounts.order_account;

    order_account.fee = calculate_fee_rate(amount, MakerOrTaker::Taker);
    order_account.claim_deadline = Clock::get()?.unix_timestamp as u64; // TODO: add lock duration
    order_account.amount = amount;
    order_account.order_owner = MakerOrTaker::Taker;
    order_account.chain_id = chain_id;
    order_account.validate()?;

    let truncated_amount = truncate_amount(order_account.amount, ctx.accounts.mint.decimals);
    anchor_spl::token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            anchor_spl::token::Transfer {
                from: ctx.accounts.buyer_token_account.to_account_info(),
                to: ctx.accounts.tmp_token_account.to_account_info(),
                authority: ctx.accounts.buyer.to_account_info(),
            },
        ),
        calculate_product(truncated_amount, order_account.fee, MakerOrTaker::Taker)?,
    )?;
    
    Ok(())
}