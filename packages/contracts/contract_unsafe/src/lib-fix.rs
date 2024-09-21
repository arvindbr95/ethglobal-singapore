use near_sdk::{env, near_bindgen, Promise, Gas, PromiseResult, AccountId, NearToken};
use near_sdk::json_types::U128;
use near_sdk::serde_json;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};

#[near_bindgen]
#[derive(Default, BorshDeserialize, BorshSerialize)]
pub struct Contract {
    pub price: u128,
}

#[near_bindgen]
impl Contract {
    pub fn update_price_from_oracle(&mut self, asset: String) -> Promise {
        Promise::new("oracle.near".parse::<AccountId>().unwrap()).function_call(
            "get_price".to_string(),
            serde_json::to_vec(&asset).unwrap(), 
            NearToken::from_yoctonear(0), // Using NearToken::from_yoctonear for zero deposit
            Gas::from_tgas(5),                   
        )
        .then(
            Promise::new(env::current_account_id()).function_call(
                "on_price_update".to_string(),   
                serde_json::to_vec(&asset).unwrap(),
                NearToken::from_yoctonear(0), // Using NearToken::from_yoctonear for zero deposit
                Gas::from_tgas(5),                 
            )
        )
    }

    pub fn on_price_update(&mut self, _asset: String) {
        match env::promise_result(0) {
            PromiseResult::Successful(result) => {
                let price: U128 = near_sdk::serde_json::from_slice(&result).unwrap();
                self.price = price.0;
                env::log_str(&format!("Successfully updated price to: {}", self.price));
            },
            _ => {
                env::log_str("Failed to update the price from the oracle.");
            }
        }
    }
}