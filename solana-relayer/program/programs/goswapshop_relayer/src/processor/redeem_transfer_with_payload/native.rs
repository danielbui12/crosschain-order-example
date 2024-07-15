use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Token, TokenAccount, Mint},
};
use wormhole_anchor_sdk::{token_bridge, wormhole};

use crate::{
    constant::SEED_PREFIX_TMP,
    state::{Order, ForeignContract, RedeemerConfig},
    message::{GoSwapShopMessage, PostedGoSwapShopMessage},
    GoSwapShopError,
};

#[derive(Accounts)]
#[instruction(_vaa_hash: [u8; 32])]
pub struct RedeemNativeTransferWithPayload<'info> {
    #[account(mut)]
    /// Payer will pay Wormhole fee to transfer tokens and create temporary
    /// token account.
    pub seller: Signer<'info>,

    // #[account(
    //     mut,
    //     constraint = seller.key() == recipient.key() || payer_token_account.key() == anchor_spl::associated_token::get_associated_token_address(&seller.key(), &mint.key()) @ GoSwapShopError::InvalidPayerAta
    // )]
    // /// CHECK: Payer's token account. If seller != recipient, must be an
    // /// associated token account. Mutable.
    // pub payer_token_account: UncheckedAccount<'info>,

    #[account(
        seeds = [RedeemerConfig::SEED_PREFIX],
        bump
    )]
    /// Redeemer Config account. Acts as the Token Bridge redeemer, which signs
    /// for the complete transfer instruction. Read-only.
    pub config: Box<Account<'info, RedeemerConfig>>,

    #[account(
        seeds = [
            ForeignContract::SEED_PREFIX,
            &vaa.emitter_chain().to_le_bytes()[..]
        ],
        bump,
        constraint = foreign_contract.verify(&vaa) @ GoSwapShopError::InvalidForeignContract
    )]
    /// Foreign Contract account. The registered contract specified in this
    /// account must agree with the target address for the Token Bridge's token
    /// transfer. Read-only.
    pub foreign_contract: Box<Account<'info, ForeignContract>>,

    #[account(
        address = vaa.data().mint()
    )]
    /// Mint info. This is the SPL token that will be bridged over from the
    /// foreign contract. This must match the token address specified in the
    /// signed Wormhole message. Read-only.
    pub mint: Account<'info, Mint>,

    // #[account(
    //     mut,
    //     associated_token::mint = mint,
    //     associated_token::authority = recipient
    // )]
    // /// Recipient associated token account.
    // pub recipient_token_account: Box<Account<'info, TokenAccount>>,

    // #[account(mut)]
    // /// CHECK: Recipient may differ from seller if a relayer paid for this
    // /// transaction.
    // pub recipient: UncheckedAccount<'info>,
    #[account(
        init,
        payer = seller,
        seeds = [
            SEED_PREFIX_TMP,
            mint.key().as_ref(),
        ],
        bump,
        token::mint = mint,
        token::authority = config,
    )]
    /// Program's temporary token account. This account is created before the
    /// instruction is invoked to temporarily take custody of the payer's
    /// tokens. When the tokens are finally bridged out, the token account
    /// will have zero balance and can be closed.
    pub bridge_tmp_token_account: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub tmp_token_account: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub order_account: Account<'info, Order>,

    /// Wormhole program.
    pub wormhole_program: Program<'info, wormhole::program::Wormhole>,

    /// Token Bridge program.
    pub token_bridge_program: Program<'info, token_bridge::program::TokenBridge>,

    #[account(
        address = config.token_bridge.config @ GoSwapShopError::InvalidTokenBridgeConfig
    )]
    /// Token Bridge config. Read-only.
    pub token_bridge_config: Account<'info, token_bridge::Config>,

    #[account(
        seeds = [
            wormhole::SEED_PREFIX_POSTED_VAA,
            &_vaa_hash
        ],
        bump,
        seeds::program = wormhole_program,
        constraint = vaa.data().to() == crate::ID || vaa.data().to() == config.key() @ GoSwapShopError::InvalidTransferToAddress,
        constraint = vaa.data().to_chain() == wormhole::CHAIN_ID_SOLANA @ GoSwapShopError::InvalidTransferToChain,
        constraint = vaa.data().token_chain() == wormhole::CHAIN_ID_SOLANA @ GoSwapShopError::InvalidTransferTokenChain
    )]
    /// Verified Wormhole message account. The Wormhole program verified
    /// signatures and posted the account data here. Read-only.
    pub vaa: Box<Account<'info, PostedGoSwapShopMessage>>,

    #[account(mut)]
    /// CHECK: Token Bridge claim account. It stores a boolean, whose value
    /// is true if the bridged assets have been claimed. If the transfer has
    /// not been redeemed, this account will not exist yet.
    pub token_bridge_claim: UncheckedAccount<'info>,

    #[account(
        address = foreign_contract.token_bridge_foreign_endpoint @ GoSwapShopError::InvalidTokenBridgeForeignEndpoint
    )]
    /// Token Bridge foreign endpoint. This account should really be one
    /// endpoint per chain, but the PDA allows for multiple endpoints for each
    /// chain! We store the proper endpoint for the emitter chain.
    pub token_bridge_foreign_endpoint: Account<'info, token_bridge::EndpointRegistration>,

    #[account(
        mut,
        seeds = [mint.key().as_ref()],
        bump,
        seeds::program = token_bridge_program
    )]
    /// CHECK: Token Bridge custody. This is the Token Bridge program's token
    /// account that holds this mint's balance.
    pub token_bridge_custody: Account<'info, TokenAccount>,

    #[account(
        address = config.token_bridge.custody_signer @ GoSwapShopError::InvalidTokenBridgeCustodySigner
    )]
    /// CHECK: Token Bridge custody signer. Read-only.
    pub token_bridge_custody_signer: UncheckedAccount<'info>,

    /// System program.
    pub system_program: Program<'info, System>,

    /// Token program.
    pub token_program: Program<'info, Token>,

    /// Associated Token program.
    pub associated_token_program: Program<'info, AssociatedToken>,

    /// Rent sysvar.
    pub rent: Sysvar<'info, Rent>,
}

pub fn redeem_native_transfer_with_payload(
    ctx: Context<RedeemNativeTransferWithPayload>,
    _vaa_hash: [u8; 32],
) -> Result<()> {
    // The Token Bridge program's claim account is only initialized when
    // a transfer is redeemed (and the boolean value `true` is written as
    // its data).
    //
    // The Token Bridge program will automatically fail if this transfer
    // is redeemed again. But we choose to short-circuit the failure as the
    // first evaluation of this instruction.
    require!(
        ctx.accounts.token_bridge_claim.data_is_empty(),
        GoSwapShopError::AlreadyRedeemed
    );

    // The intended recipient must agree with the recipient.
    let GoSwapShopMessage::Msg { recipient } = ctx.accounts.vaa.message().data();
    require!(
        ctx.accounts.tmp_token_account.key().to_bytes() == *recipient,
        GoSwapShopError::InvalidRecipient
    );

    let config_seeds = &[
        RedeemerConfig::SEED_PREFIX.as_ref(),
        &[ctx.accounts.config.bump],
    ];

    // Redeem the token transfer.
    token_bridge::complete_transfer_native_with_payload(CpiContext::new_with_signer(
        ctx.accounts.token_bridge_program.to_account_info(),
        token_bridge::CompleteTransferNativeWithPayload {
            payer: ctx.accounts.seller.to_account_info(),
            config: ctx.accounts.token_bridge_config.to_account_info(),
            vaa: ctx.accounts.vaa.to_account_info(),
            claim: ctx.accounts.token_bridge_claim.to_account_info(),
            foreign_endpoint: ctx.accounts.token_bridge_foreign_endpoint.to_account_info(),
            to: ctx.accounts.bridge_tmp_token_account.to_account_info(),
            redeemer: ctx.accounts.config.to_account_info(),
            custody: ctx.accounts.token_bridge_custody.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            custody_signer: ctx.accounts.token_bridge_custody_signer.to_account_info(),
            rent: ctx.accounts.rent.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
            token_program: ctx.accounts.token_program.to_account_info(),
            wormhole_program: ctx.accounts.wormhole_program.to_account_info(),
        },
        &[&config_seeds[..]],
    ))?;

    let amount = token_bridge::denormalize_amount(
        ctx.accounts.vaa.data().amount(),
        ctx.accounts.mint.decimals,
    );

    // Transfer tokens from tmp_token_account to recipient.
    anchor_spl::token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            anchor_spl::token::Transfer {
                from: ctx.accounts.bridge_tmp_token_account.to_account_info(),
                to: ctx.accounts.tmp_token_account.to_account_info(),
                authority: ctx.accounts.config.to_account_info(),
            },
            &[&config_seeds[..]],
        ),
        amount,
    )?;

    // TODO: Add Approve token processing logic 
    // to recover when there are cases of complaints about order
    //
    //
    //


    // If this instruction were executed by a relayer, send some of the
    // token amount (determined by the relayer fee) to the seller's token
    // account.
    // if ctx.accounts.seller.key() != ctx.accounts.recipient.key() {
    //     // Does the relayer have an aassociated token account already? If
    //     // not, he needs to create one.
    //     require!(
    //         !ctx.accounts.payer_token_account.data_is_empty(),
    //         GoSwapShopError::NonExistentRelayerAta
    //     );

    //     let relayer_amount = ctx.accounts.config.compute_relayer_amount(amount);

    //     // Pay the relayer if there is anything for him.
    //     if relayer_amount > 0 {
    //         anchor_spl::token::transfer(
    //             CpiContext::new_with_signer(
    //                 ctx.accounts.token_program.to_account_info(),
    //                 anchor_spl::token::Transfer {
    //                     from: ctx.accounts.tmp_token_account.to_account_info(),
    //                     to: ctx.accounts.payer_token_account.to_account_info(),
    //                     authority: ctx.accounts.config.to_account_info(),
    //                 },
    //                 &[&config_seeds[..]],
    //             ),
    //             relayer_amount,
    //         )?;
    //     }

    //     msg!(
    //         "RedeemNativeTransferWithPayload :: relayed by {:?}",
    //         ctx.accounts.seller.key()
    //     );

        // // Transfer tokens from tmp_token_account to recipient.
        // anchor_spl::token::transfer(
        //     CpiContext::new_with_signer(
        //         ctx.accounts.token_program.to_account_info(),
        //         anchor_spl::token::Transfer {
        //             from: ctx.accounts.tmp_token_account.to_account_info(),
        //             to: ctx.accounts.recipient_token_account.to_account_info(),
        //             authority: ctx.accounts.config.to_account_info(),
        //         },
        //         &[&config_seeds[..]],
        //     ),
        //     amount - relayer_amount,
        // )?;
    // } else {
        // // Transfer tokens from tmp_token_account to recipient.
        // anchor_spl::token::transfer(
        //     CpiContext::new_with_signer(
        //         ctx.accounts.token_program.to_account_info(),
        //         anchor_spl::token::Transfer {
        //             from: ctx.accounts.tmp_token_account.to_account_info(),
        //             to: ctx.accounts.recipient_token_account.to_account_info(),
        //             authority: ctx.accounts.config.to_account_info(),
        //         },
        //         &[&config_seeds[..]],
        //     ),
        //     amount,
        // )?;
    // }


    // Finish instruction by closing tmp_token_account.
    anchor_spl::token::close_account(CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        anchor_spl::token::CloseAccount {
            account: ctx.accounts.bridge_tmp_token_account.to_account_info(),
            destination: ctx.accounts.seller.to_account_info(),
            authority: ctx.accounts.config.to_account_info(),
        },
        &[&config_seeds[..]],
    ))?;

    Ok(())
}