const {
    AIMessage,
    BaseMessage,
    BaseMessageChunk,
    HumanMessage,
    SystemMessage,
} = require("@langchain/core/messages");

const { z } = require("zod");

const {
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
    SystemMessagePromptTemplate,
} = require("@langchain/core/prompts");
const OpenAI = require("openai");
const { zodResponseFormat } = require("openai/helpers/zod");

const { StructuredOutputParser } = require("langchain/output_parsers");

const { RunnableSequence } = require("@langchain/core/runnables");

const { ChatOpenAI } = require("@langchain/openai");
require("dotenv").config();

const openAIApiKey = process.env.OPENAIKEY;

// console.log("openAIApiKey", openAIApiKey);

const { getSystemPrompt } = require("./prompt");

const handleCheck = async (code, toml) => {
    try {
        // console.log("Handle regenerate general start", new Date());

        // const llm = new ChatOpenAI({
        //     modelName: "gpt-4o",
        //     temperature: 0.5,
        //     openAIApiKey: openAIApiKey,
        // });

        const client = new OpenAI({
            apiKey: openAIApiKey,
        });

        const outputFormat = z.object({
            contract: z.object({
                name: z.string(),
                auditDate: z.string(), // This could also be validated with `z.date()` if you convert the date.
                criteria: z.object({
                    Anatomy: z.object({
                        privateMethodsDecorated: z.boolean(),
                        issues: z.array(z.string()),
                        codeFixes: z
                            .array(z.string())
                            .describe(
                                "Recommended rust code to fix the vulnerability"
                            ),
                    }),
                    Environment: z.object({
                        predecessorUsedCorrectly: z.boolean(),
                        signerUsedCorrectly: z.boolean(),
                        issues: z.array(z.string()),
                        codeFixes: z
                            .array(z.string())
                            .describe(
                                "Recommended rust code to fix the vulnerability"
                            ),
                    }),
                    CrossContractCalls: z.object({
                        independentCallsHandled: z.boolean(),
                        callbacksPublic: z.boolean(),
                        contractNotLeftExploitable: z.boolean(),
                        manualRollbackOnFailure: z.boolean(),
                        // privateCallbacksMarked: z.boolean(),
                        issues: z.array(z.string()),
                        codeFixes: z
                            .array(z.string())
                            .describe(
                                "Recommended rust code to fix the vulnerability"
                            ),
                    }),
                    UserMoney: z.object({
                        moneyReturnedOnPanic: z.boolean(),
                        // manualReturnInCallback: z.boolean(),
                        enoughGasProvided: z.boolean(),
                        issues: z.array(z.string()),
                        codeFixes: z
                            .array(z.string())
                            .describe(
                                "Recommended rust code to fix the vulnerability"
                            ),
                    }),
                    Storage: z.object({
                        enoughBalanceForState: z.boolean(),
                        collectionsHaveUniqueId: z.boolean(),
                        overflowUnderflowChecks: z.boolean(),
                        issues: z.array(z.string()),
                        codeFixes: z
                            .array(z.string())
                            .describe(
                                "Recommended rust code to fix the vulnerability"
                            ),
                    }),
                    Actions: z.object({
                        enoughFundsForStorage: z.boolean(),
                        userFundsDeductedBeforeReturn: z.boolean(),
                        issues: z.array(z.string()),
                        codeFixes: z
                            .array(z.string())
                            .describe(
                                "Recommended rust code to fix the vulnerability"
                            ),
                    }),
                    Callbacks: z.object({
                        privateCallbacksMarked: z.boolean(),
                        allCallbacksExist: z.boolean(),
                        callbacksCheckErrors: z.boolean(),
                        stateRollbackOnFailure: z.boolean(),
                        // moneyReturnedOnFailure: z.boolean(),
                        callbacksFreeOfPanic: z.boolean(),
                        enoughGasInCallbacks: z.boolean(),
                        contractSafeBetweenCalls: z.boolean(),
                        issues: z.array(z.string()),
                        codeFixes: z
                            .array(z.string())
                            .describe(
                                "Recommended rust code to fix the vulnerability"
                            ),
                    }),
                    FrontRunning: z.object({
                        protectedAgainstFrontRunning: z.boolean(),
                        issues: z.array(z.string()),
                        codeFixes: z
                            .array(z.string())
                            .describe(
                                "Recommended rust code to fix the vulnerability"
                            ),
                    }),
                    SybilAttacks: z.object({
                        protectedAgainstSybilAttacks: z.boolean(),
                        issues: z.array(z.string()),
                        codeFixes: z
                            .array(z.string())
                            .describe(
                                "Recommended rust code to fix the vulnerability"
                            ),
                    }),
                    ReentrancyAttacks: z.object({
                        protectedAgainstReentrancy: z.boolean(),
                        consistentStateBetweenCalls: z.boolean(),
                        issues: z.array(z.string()),
                        codeFixes: z
                            .array(z.string())
                            .describe(
                                "Recommended rust code to fix the vulnerability"
                            ),
                    }),
                    UserValidation: z.object({
                        ensuresUserAuthenticity: z.boolean(),
                        issues: z.array(z.string()),
                        codeFixes: z
                            .array(z.string())
                            .describe(
                                "Recommended rust code to fix the vulnerability"
                            ),
                    }),
                    RandomNumbers: z.object({
                        secureRandomness: z.boolean(),
                        issues: z.array(z.string()),
                        codeFixes: z
                            .array(z.string())
                            .describe(
                                "Recommended rust code to fix the vulnerability"
                            ),
                    }),
                    MillionSmallDeposits: z.object({
                        adequateStorageHandling: z.boolean(),
                        userPaysForStorage: z.boolean(),
                        issues: z.array(z.string()),
                        codeFixes: z
                            .array(z.string())
                            .describe(
                                "Recommended rust code to fix the vulnerability"
                            ),
                    }),
                }),
            }),
        });

        const messages = [{ role: "system", content: getSystemPrompt() }];

        // const systemMessagePrompt =
        //     SystemMessagePromptTemplate.fromTemplate(systemTemplateString);
        messages.push({
            role: "user",
            content: `contract rust code:\n${code}\n\ncontract toml:\n${toml}`,
        });
        // const humanTemplateString = `contract rust code:\n${code}\n\ncontract toml:\n${toml}`;
        // const humanMessagePrompt =
        //     HumanMessagePromptTemplate.fromTemplate(humanTemplateString);

        //console.log(parser.getFormatInstructions());

        const completion = await client.beta.chat.completions.parse({
            model: "gpt-4o-mini-2024-07-18",
            messages: messages,
            response_format: zodResponseFormat(outputFormat, "outputFormat"),
            temperature: 0,
        });

        const result = completion.choices[0].message.parsed;

        // const chatPrompt = ChatPromptTemplate.fromMessages([
        //     systemMessagePrompt,
        //     humanMessagePrompt,
        // ]);

        // const chain = RunnableSequence.from([chatPrompt, llm, parser]);
        // var result = await chain.invoke({
        //     code: code,
        //     toml: toml,
        //     format_instructions: parser.getFormatInstructions(),
        // });

        // console.log("result", result);

        return result;
    } catch (error) {
        console.log("error", error);
        throw new Error("Error handleLlm");
    }
};

module.exports = {
    handleCheck,
};
