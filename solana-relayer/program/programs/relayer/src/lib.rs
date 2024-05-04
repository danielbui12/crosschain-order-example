use anchor_lang::prelude::*;

pub use constant::*;
pub use error::*;
pub use message::*;
pub use processor::*;
pub use state::*;
pub use utils::*;

pub mod constant;
pub mod error;
pub mod message;
pub mod processor;
pub mod state;
pub mod utils;

declare_id!("GSS2BQQYmXSDkB25bwaumRMsaWJNDu18UzUByCWf1NaL");

#[program]
pub mod relayer {
    use super::*;

    /// This instruction can be used to generate your program's config.
    /// And for convenience, we will store Wormhole-related PDAs in the
    /// config so we can verify these accounts with a simple == constraint.
    pub fn initialize(
        ctx: Context<Initialize>,
        relayer_fee: u32,
        relayer_fee_precision: u32,
    ) -> Result<()> {
        processor::initialize(ctx, relayer_fee, relayer_fee_precision)
    }

    /// This instruction registers a new foreign contract (from another
    /// network) and saves the emitter information in a ForeignEmitter account.
    /// This instruction is owner-only, meaning that only the owner of the
    /// program (defined in the [Config] account) can add and update foreign
    /// contracts.
    ///
    /// # Arguments
    ///
    /// * `ctx`     - `RegisterForeignContract` context
    /// * `chain`   - Wormhole Chain ID
    /// * `address` - Wormhole Emitter Address
    pub fn register_foreign_contract(
        ctx: Context<RegisterForeignContract>,
        chain: u16,
        address: [u8; 32],
    ) -> Result<()> {
        processor::register_foreign_contract(ctx, chain, address)
    }

    pub fn update_relayer_fee(
        ctx: Context<UpdateRelayerFee>,
        relayer_fee: u32,
        relayer_fee_precision: u32,
    ) -> Result<()> {
        processor::update_relayer_fee(ctx, relayer_fee, relayer_fee_precision)
    }

    // seller fn
    pub fn create_an_order(
        ctx: Context<CreateAnOrder>,
        _order_salt: Vec<u8>,
        amount: u64,
    ) -> Result<()> {
        processor::create_an_order(ctx, _order_salt, amount)
    }

    // buyer fn
    pub fn place_an_order(
        ctx: Context<PlaceAnOrder>,
        _order_salt: Vec<u8>,
        amount: u64,
        chain_id: u16,
    ) -> Result<()> {
        processor::place_an_order(ctx, _order_salt, amount, chain_id)
    }

    // buyer fn
    pub fn cancel_the_order(ctx: Context<CancelTheOrder>, _order_salt: Vec<u8>) -> Result<()> {
        processor::cancel_the_order(ctx, _order_salt)
    }

    // buyer fn
    pub fn confirm_the_order(ctx: Context<ConfirmTheOrder>, _order_salt: Vec<u8>) -> Result<()> {
        processor::confirm_the_order(ctx, _order_salt)
    }

    // buyer fn confirm order & native transfer token cross-chain
    pub fn send_native_tokens_with_payload(
        ctx: Context<SendNativeTokensWithPayload>,
        batch_id: u32,
        recipient_address: [u8; 32],
        chain_id: u16,
    ) -> Result<()> {
        processor::send_native_tokens_with_payload(ctx, batch_id, recipient_address, chain_id)
    }

    // buyer fn confirm order & wrapped transfer token cross-chain
    pub fn send_wrapped_tokens_with_payload(
        ctx: Context<SendWrappedTokensWithPayload>,
        batch_id: u32,
        recipient_address: [u8; 32],
        chain_id: u16,
    ) -> Result<()> {
        processor::send_wrapped_tokens_with_payload(ctx, batch_id, recipient_address, chain_id)
    }

    // seller fn
    pub fn claim_the_order(ctx: Context<ClaimTheOrder>, _order_salt: Vec<u8>) -> Result<()> {
        processor::claim_the_order(ctx, _order_salt)
    }

    // seller fn redeem & claim native transfer token cross-chain
    pub fn redeem_native_transfer_with_payload(
        ctx: Context<RedeemNativeTransferWithPayload>,
        _vaa_hash: [u8; 32],
    ) -> Result<()> {
        processor::redeem_native_transfer_with_payload(ctx, _vaa_hash)
    }

    // seller fn redeem & claim wrapped transfer token cross-chain
    pub fn redeem_wrapped_transfer_with_payload(
        ctx: Context<RedeemWrappedTransferWithPayload>,
        _vaa_hash: [u8; 32],
    ) -> Result<()> {
        processor::redeem_wrapped_transfer_with_payload(ctx, _vaa_hash)
    }
}
