use wormhole_anchor_sdk::wormhole;

use super::{state::MakerOrTaker, RelayerError};

pub fn valid_foreign_chain_id(chain: u16) -> bool {
    chain != 0 && chain != wormhole::CHAIN_ID_SOLANA
}

pub fn valid_foreign_address(chain: u16, address: &[u8; 32]) -> bool {
    valid_foreign_chain_id(chain) && *address != [0; 32]
}

pub fn calculate_product(
    product: u64,
    fee: u8,
    direction: MakerOrTaker,
) -> Result<u64, RelayerError> {
    let fee_amount = calculate_fee(product, fee)?;
    let result: u64 = match direction {
        MakerOrTaker::Taker => product
            .checked_add(fee_amount)
            .ok_or(RelayerError::ProductOverflow)?,
        MakerOrTaker::Maker => product
            .checked_sub(fee_amount)
            .ok_or(RelayerError::ProductOverflow)?,
    };

    Ok(result)
}

pub fn calculate_fee(product: u64, fee: u8) -> Result<u64, RelayerError> {
    // Range from 0.01% -> 100%
    Ok(product
        .checked_mul(fee as u64)
        .and_then(|result| result.checked_div(10_000))
        .ok_or(RelayerError::FeeOverflow)?)
}

pub fn calculate_fee_rate(_product: u64, _direction: MakerOrTaker) -> u8 {
    // 0.01%
    100
}
