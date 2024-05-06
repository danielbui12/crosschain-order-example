use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Token, TokenAccount},
};
use wormhole_anchor_sdk::{token_bridge, wormhole};

use crate::{
    constant::SEED_PREFIX_TMP,
    message::{PostedRelayerMessage, RelayerMessage},
    state::{ForeignContract, Order, RedeemerConfig},
    RelayerError,
};

#[derive(Accounts)]
#[instruction(vaa_hash: [u8; 32])]
pub struct RedeemWrappedTransferWithPayload<'info> {
    #[account(mut)]
    /// Payer will pay Wormhole fee to transfer tokens and create temporary
    /// token account.
    pub seller: Signer<'info>,

    // #[account(
    //     mut,
    //     constraint =
    //       seller.key() == recipient.key() ||
    //       payer_token_account.key() ==
    //         anchor_spl::associated_token::get_associated_token_address(
    //           &seller.key(),
    //           &token_bridge_wrapped_mint.key()
    //         )
    //       @ RelayerError::InvalidPayerAta
    // )]
    // /// CHECK: Payer's token account. If seller != recipient, must be an
    // /// associated token account.
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
        constraint = foreign_contract.verify(&vaa) @ RelayerError::InvalidForeignContract
    )]
    /// Foreign Contract account. The registered contract specified in this
    /// account must agree with the target address for the Token Bridge's token
    /// transfer. Read-only.
    pub foreign_contract: Box<Account<'info, ForeignContract>>,

    #[account(
        mut,
        seeds = [
            token_bridge::WrappedMint::SEED_PREFIX,
            &vaa.data().token_chain().to_be_bytes(),
            vaa.data().token_address()
        ],
        bump,
        seeds::program = token_bridge_program
    )]
    /// Token Bridge wrapped mint info. This is the SPL token that will be
    /// bridged from the foreign contract. The wrapped mint PDA must agree
    /// with the native token's metadata in the wormhole message. Mutable.
    pub token_bridge_wrapped_mint: Box<Account<'info, token_bridge::WrappedMint>>,

    // #[account(
    //     mut,
    //     associated_token::mint = token_bridge_wrapped_mint,
    //     associated_token::authority = recipient
    // )]
    // /// Recipient associated token account.
    // pub recipient_token_account: Box<Account<'info, TokenAccount>>,

    // #[account(mut)]
    // /// CHECK: recipient may differ from seller if a relayer paid for this
    // /// transaction.
    // pub recipient: UncheckedAccount<'info>,
    #[account(
        init,
        payer = seller,
        seeds = [
            SEED_PREFIX_TMP,
            token_bridge_wrapped_mint.key().as_ref(),
        ],
        bump,
        token::mint = token_bridge_wrapped_mint,
        token::authority = config
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
        seeds = [
            token_bridge::WrappedMeta::SEED_PREFIX,
            token_bridge_wrapped_mint.key().as_ref()
        ],
        bump,
        seeds::program = token_bridge_program
    )]
    /// Token Bridge program's wrapped metadata, which stores info
    /// about the token from its native chain:
    ///   * Wormhole Chain ID
    ///   * Token's native contract address
    ///   * Token's native decimals
    pub token_bridge_wrapped_meta: Account<'info, token_bridge::WrappedMeta>,

    #[account(
        address = config.token_bridge.config @ RelayerError::InvalidTokenBridgeConfig
    )]
    /// Token Bridge config. Read-only.
    pub token_bridge_config: Account<'info, token_bridge::Config>,

    #[account(
        seeds = [
            wormhole::SEED_PREFIX_POSTED_VAA,
            &vaa_hash
        ],
        bump,
        seeds::program = wormhole_program,
        constraint = vaa.data().to() == crate::ID || vaa.data().to() == config.key() @ RelayerError::InvalidTransferToAddress,
        constraint = vaa.data().to_chain() == wormhole::CHAIN_ID_SOLANA @ RelayerError::InvalidTransferToChain,
        constraint = vaa.data().token_chain() != wormhole::CHAIN_ID_SOLANA @ RelayerError::InvalidTransferTokenChain
    )]
    /// Verified Wormhole message account. The Wormhole program verified
    /// signatures and posted the account data here. Read-only.
    pub vaa: Box<Account<'info, PostedRelayerMessage>>,

    #[account(mut)]
    /// CHECK: Token Bridge claim account. It stores a boolean, whose value
    /// is true if the bridged assets have been claimed. If the transfer has
    /// not been redeemed, this account will not exist yet.
    pub token_bridge_claim: UncheckedAccount<'info>,

    #[account(
        address = foreign_contract.token_bridge_foreign_endpoint @ RelayerError::InvalidTokenBridgeForeignEndpoint
    )]
    /// Token Bridge foreign endpoint. This account should really be one
    /// endpoint per chain, but the PDA allows for multiple endpoints for each
    /// chain! We store the proper endpoint for the emitter chain.
    pub token_bridge_foreign_endpoint: Account<'info, token_bridge::EndpointRegistration>,

    #[account(
        address = config.token_bridge.mint_authority @ RelayerError::InvalidTokenBridgeMintAuthority
    )]
    /// CHECK: Token Bridge custody signer. Read-only.
    pub token_bridge_mint_authority: UncheckedAccount<'info>,

    /// System program.
    pub system_program: Program<'info, System>,

    /// Token program.
    pub token_program: Program<'info, Token>,

    /// Associated Token program.
    pub associated_token_program: Program<'info, AssociatedToken>,

    /// Rent sysvar.
    pub rent: Sysvar<'info, Rent>,
}

pub fn redeem_wrapped_transfer_with_payload(
    ctx: Context<RedeemWrappedTransferWithPayload>,
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
        RelayerError::AlreadyRedeemed
    );

    // The intended recipient must agree with the recipient.
    let RelayerMessage::Msg { recipient } = ctx.accounts.vaa.message().data();
    require!(
        ctx.accounts.tmp_token_account.key().to_bytes() == *recipient,
        RelayerError::InvalidRecipient
    );

    let config_seeds = &[
        RedeemerConfig::SEED_PREFIX.as_ref(),
        &[ctx.accounts.config.bump],
    ];

    // Redeem the token transfer.
    token_bridge::complete_transfer_wrapped_with_payload(CpiContext::new_with_signer(
        ctx.accounts.token_bridge_program.to_account_info(),
        token_bridge::CompleteTransferWrappedWithPayload {
            payer: ctx.accounts.seller.to_account_info(),
            config: ctx.accounts.token_bridge_config.to_account_info(),
            vaa: ctx.accounts.vaa.to_account_info(),
            claim: ctx.accounts.token_bridge_claim.to_account_info(),
            foreign_endpoint: ctx.accounts.token_bridge_foreign_endpoint.to_account_info(),
            to: ctx.accounts.bridge_tmp_token_account.to_account_info(),
            redeemer: ctx.accounts.config.to_account_info(),
            wrapped_mint: ctx.accounts.token_bridge_wrapped_mint.to_account_info(),
            wrapped_metadata: ctx.accounts.token_bridge_wrapped_meta.to_account_info(),
            mint_authority: ctx.accounts.token_bridge_mint_authority.to_account_info(),
            rent: ctx.accounts.rent.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
            token_program: ctx.accounts.token_program.to_account_info(),
            wormhole_program: ctx.accounts.wormhole_program.to_account_info(),
        },
        &[&config_seeds[..]],
    ))?;

    let amount = ctx.accounts.vaa.data().amount();

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
    //     // Does the relayer have an a associated token account already? If
    //     // not, he needs to create one.
    //     require!(
    //         !ctx.accounts.payer_token_account.data_is_empty(),
    //         RelayerError::NonExistentRelayerAta
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
    //         "RedeemWrappedTransferWithPayload :: relayed by {:?}",
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
