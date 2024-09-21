const fs = require("fs");
const chalk = require("chalk");
const { exec } = require("child_process");
const {
    utils,
    transactions,
    DEFAULT_FUNCTION_CALL_GAS,
} = require("near-api-js");
const { preprocessDataRequest } = require("../../api/report");
const connect = require("../../utils/connect");
const { assertCredentials } = require("../../utils/credentials");
const { askYesNoQuestion } = require("../../utils/readline");
const inspectResponse = require("../../utils/inspect-response");
const { DEFAULT_NETWORK } = require("../../config");
const { handleCheck } = require("../../llm/llm");

const path = require("path");
//  command: "deploy <account-id> <wasm-file>",
module.exports = {
    command: "deploy <account-id>",
    desc: "Deploy a contract to an existing account (optionally initializing it)",
    builder: (yargs) =>
        yargs
            .options("contractCodeFolder", {
                desc: "Code path to deploy",
                type: "string",
                required: true,
            })

            .option("initFunction", {
                desc: "Initialization method",
                type: "string",
            })
            .option("initArgs", {
                desc: "Initialization arguments",
            })
            .option("initGas", {
                desc: "Gas for initialization call (default: 30TGAS)",
                type: "number",
                default: DEFAULT_FUNCTION_CALL_GAS,
            })
            .option("initDeposit", {
                desc: "Deposit in Ⓝ to send for initialization call (default: 0)",
                type: "string",
                default: "0",
            })
            .option("networkId", {
                desc: "Which network to use. Supports: mainnet, testnet, custom",
                type: "string",
                default: DEFAULT_NETWORK,
            })
            .option("force", {
                desc: "Forcefully deploy the contract",
                type: "boolean",
                default: false,
            }),
    handler: deploy,
};

const askOverrideContract = async function (prevCodeHash) {
    if (prevCodeHash !== "11111111111111111111111111111111") {
        return await askYesNoQuestion(
            chalk`{bold.white This account already has a deployed contract [ {bold.blue ${prevCodeHash}} ]. Do you want to proceed? {bold.green (y/n) }}`,
            false
        );
    }
    return true;
};

async function deploy(options) {
    console.log("options.keyStore,", options.keyStore);
    await assertCredentials(
        options.accountId,
        options.networkId,
        options.keyStore,
        options.useLedgerKey
    );
    //if fail

    //save output to db
    var contractName = "";
    if (options.contractCodeFolder) {
        contractName =
            options.contractCodeFolder.split("/")[
                options.contractCodeFolder.split("/").length - 1
            ];
        console.log("contractName", contractName);
        const absolutePathCode = path.resolve(
            options.contractCodeFolder + "/src/lib.rs"
        );
        const absolutePathToml = path.resolve(
            options.contractCodeFolder + "/rust-toolchain.toml"
        );
        //get contract code
        const code = await fs.promises.readFile(absolutePathCode, "utf8");
        const toml = await fs.promises.readFile(absolutePathToml, "utf8");
        console.log("code", code);
        console.log("toml", toml);

        //check contract
        const checkoutput = await handleCheck(code, toml);
        var hasErrors = checkoutput.contract.summary.criticalIssues > 0;

        await preprocessDataRequest(
            options.accountId,
            options.accountId,
            checkoutput,
            hasErrors
        );
        if (hasErrors) {
            console.log(
                `Your contract contains ${checkoutput.contract.summary.criticalIssues} critical issues.`
            );
            process.exit(1);
        }
        await runBuild(options.contractCodeFolder);
    }

    const near = await connect(options);
    const account = await near.account(options.accountId);
    let prevState = await account.state();
    let prevCodeHash = prevState.code_hash;

    if (!options.force && !(await askOverrideContract(prevCodeHash))) return;

    if (options.with_audit) {
        await performAudit();
    }

    console.log(
        `Deploying contract ${options.wasmFile} in ${options.accountId}`
    );

    // Deploy with init function and args
    const txs = [
        transactions.deployContract(
            fs.readFileSync(
                options.contractCodeFolder + `/target/near/${contractName}.wasm`
            )
        ),
    ];

    if (options.initArgs && !options.initFunction) {
        console.error("Must add initialization function.");
        process.exit(1);
    }

    if (options.initFunction) {
        if (!options.initArgs) {
            console.error(
                'Must add initialization arguments.\nExample: near deploy near.testnet ./out/contract.wasm --initFunction "new" --initArgs \'{"key": "value"}\''
            );
            process.exit(1);
        }
        txs.push(
            transactions.functionCall(
                options.initFunction,
                Buffer.from(options.initArgs),
                options.initGas,
                utils.format.parseNearAmount(options.initDeposit)
            )
        );
    }

    const result = await account.signAndSendTransaction({
        receiverId: options.accountId,
        actions: txs,
    });
    console.log(
        `Done deploying ${options.initFunction ? "and initializing" : "to"} ${
            options.accountId
        }`
    );
    inspectResponse.prettyPrintResponse(result, options);
}

// Function to run the build command
const runBuild = async (codePath) => {
    console.log("codepath", codePath);
    const output = await execAsync(
        `cd ${codePath} && cargo near build --no-docker`
    );
    console.log("output", output);
    return output;
};

function execAsync(command) {
    console.log("executing");

    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.log("error");
                reject(`Error executing build: ${error.message}`);
            } else if (stderr) {
                console.log("here stderr");
                resolve(`Build stderr: ${stderr}`);
            } else {
                resolve(stdout);
            }
        });
    });
}
