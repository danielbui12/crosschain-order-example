use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use wormhole_anchor_sdk::wormhole;

use crate::{
    constant::*,
    state::{MakerOrTaker, Order, SenderConfig},
    utils::calculate_fee_rate,
};

#[derive(Accounts)]
#[instruction(_order_salt: Vec<u8>)]
pub struct CreateAnOrder<'info> {
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
        payer = seller,
        seeds = [
            SEED_PREFIX_TMP,
            relayer.key().as_ref(),
            seller.key().as_ref(),
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
            relayer.key().as_ref(),
            seller.key().as_ref(),
            &_order_salt,
        ],
        bump,
        payer = seller,
        space = Order::LEN
    )]
    pub order_account: Account<'info, Order>,

    #[account(mut)]
    pub seller: Signer<'info>,

    #[account(mut)]
    pub relayer: Signer<'info>,

    pub token_program: Program<'info, Token>,

    /// System program.
    pub system_program: Program<'info, System>,
}

pub fn create_an_order(
    ctx: Context<CreateAnOrder>,
    _order_salt: Vec<u8>,
    amount: u64,
) -> Result<()> {
    let order_account: &mut Account<Order> = &mut ctx.accounts.order_account;

    order_account.fee = calculate_fee_rate(amount, MakerOrTaker::Maker);
    order_account.claim_deadline = Clock::get()?.unix_timestamp as u64; // TODO: add lock duration
    order_account.amount = amount;
    order_account.order_owner = MakerOrTaker::Maker;
    order_account.chain_id = wormhole::CHAIN_ID_SOLANA;
    order_account.validate()?;

    Ok(())
}
