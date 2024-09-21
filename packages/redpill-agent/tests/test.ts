// @ts-nocheck

import * as dotenv from "dotenv";
dotenv.config();
import { execute } from "./testSupport";

async function test() {
  let getResult = await execute({
    method: "POST",
    path: "/ipfs/CID",
    body: {
      toml: `[toolchain]
        channel = "stable"
        components = ["rustfmt"]
        targets = ["wasm32-unknown-unknown"]
    `,
      code: `
        use near_sdk::{log, near};

        // Define the contract structure
        #[near(contract_state)]
        pub struct Contract {
            greeting: String,
            value: u32,
        }

        // Define the default, which automatically initializes the contract
        impl Default for Contract {
            fn default() -> Self {
                Self {
                    greeting: "Hello".to_string(),
                    value: 0,
                }
            }
        }

        // Implement the contract structure
        #[near]
        impl Contract {
        
            pub fn get_greeting(&self) -> String {
                self.greeting.clone()
            }

        
            pub fn set_greeting(&mut self, greeting: String) {
                log!("Saving greeting: {greeting}");
                self.greeting = greeting;
            }


            pub fn update_value(&mut self, new_value: u32) {
                log!("Updating  value: {new_value}");
            
                self.value = new_value;
            }

            pub fn showvalue(&self) -> u32 {
                log!("showing value");
                self.value
            }
        }
        `,
    },
    queries: { chatQuery: [] },
    secret: { openaiApiKey: process.env.OPENAI_API_KEY },
    headers: {},
  });
  console.log("POST RESULT:", JSON.parse(getResult));

  console.log(
    `Now you are ready to publish your agent, add secrets, and interact with your agent in the following steps:\n- Execute: 'npm run publish-agent'\n- Set secrets: 'npm run set-secrets'\n- Go to the url produced by setting the secrets (e.g. https://wapo-testnet.phala.network/ipfs/QmPQJD5zv3cYDRM25uGAVjLvXGNyQf9Vonz7rqkQB52Jae?key=b092532592cbd0cf)`
  );
}

test()
  .then(() => {})
  .catch((err) => console.error(err))
  .finally(() => process.exit());
