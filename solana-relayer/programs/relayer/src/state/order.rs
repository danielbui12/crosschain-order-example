use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Debug, Clone)]
pub enum MakerOrTaker {
    Maker,
    Taker,
}

impl Default for MakerOrTaker {
    fn default() -> Self {
        MakerOrTaker::Maker
    }
}

// impl MakerOrTaker {
//     fn from_bytes(bytes: &[u8]) -> Option<Self> {
//         if let Some(&byte) = bytes.get(0) {
//             match byte {
//                 0 => Some(MakerOrTaker::Maker),
//                 1 => Some(MakerOrTaker::Taker),
//                 _ => None,
//             }
//         } else {
//             None
//         }
//     }
// }

// #[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Debug, Clone)]
// pub enum Claimer {
//     None,
//     Seller,
//     Buyer
// }

// impl Default for Claimer {
//     fn default() -> Self {
//         Claimer::None
//     }
// }

// impl Claimer {
//     fn from_bytes(bytes: &[u8]) -> Option<Self> {
//         if let Some(&byte) = bytes.get(0) {
//             match byte {
//                 0 => Some(Claimer::None),
//                 1 => Some(Claimer::Seller),
//                 2 => Some(Claimer::Buyer),
//                 _ => None,
//             }
//         } else {
//             None
//         }
//     }
// }

#[account]
#[derive(Default)]
/// Order account data.
pub struct Order {
    pub fee: u8, // percentage
    pub order_owner: MakerOrTaker,
    pub chain_id: u16,
    pub claim_deadline: u64,
    pub amount: u64,
}

impl Order {
    pub const LEN: usize = 8 // discriminator
      + 1 // 1 byte for fee
      + 1 // 1 bytes for MakerOrTaker
      + 2 // 2 bytes for chain_id
      + 8 // 8 bytes for claim_deadline
      + 8 // 8 bytes for amount
    ;

    pub const SEED_PREFIX: &'static [u8; 5] = b"order";

    pub fn validate(&self) -> Result<()> {
        // TODO: implement this
        Ok(())
    }

    // pub fn from_bytes(data: &[u8]) -> Option<Order> {
    //     if data.len() != Self::LEN {
    //         return None; // Return None if the data length doesn't match
    //     }

    //     let maker_fee = data[0];
    //     let taker_fee = data[1];
    //     let chain_id = u16::from_le_bytes(data[2..4].try_into().unwrap());
    //     let claim_deadline = u64::from_le_bytes(data[4..12].try_into().unwrap());
    //     let amount = u64::from_le_bytes(data[12..20].try_into().unwrap());
    //     let claimer = Claimer::from_bytes(&data[20..21]).unwrap();
    //     let buyer = Pubkey::new_from_array(<[u8; 32]>::try_from(&data[21..53]).unwrap());
    //     let seller = Pubkey::new_from_array(<[u8; 32]>::try_from(&data[53..85]).unwrap());

    //     Some(Order {
    //         maker_fee,
    //         taker_fee,
    //         chain_id,
    //         claim_deadline,
    //         amount,
    //         claimer,
    //         buyer,
    //         seller,
    //     })
    // }
}

#[cfg(test)]
pub mod test {
    use super::*;

    #[test]
    fn test_config() -> Result<()> {
        assert_eq!(Order::LEN, std::mem::size_of::<Order>());
        Ok(())
    }
}
