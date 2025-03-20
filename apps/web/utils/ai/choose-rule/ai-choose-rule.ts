import { z } from "zod";
import type { UserAIFields } from "@/utils/llms/types";
import { chatCompletionObject } from "@/utils/llms";
import type { User } from "@prisma/client";
import { stringifyEmail } from "@/utils/stringify-email";
import type { EmailForLLM } from "@/utils/types";
import { createScopedLogger } from "@/utils/logger";
import { Braintrust } from "@/utils/braintrust";

const logger = createScopedLogger("ai-choose-rule");

const braintrust = new Braintrust("choose-rule-1");

type GetAiResponseOptions = {
  email: EmailForLLM;
  user: Pick<User, "email" | "about"> & UserAIFields;
  rules: { instructions: string }[];
};

async function getAiResponse(options: GetAiResponseOptions) {
  const { email, user, rules } = options;

  const specialRuleNumber = rules.length + 1;

  const emailSection = stringifyEmail(email, 500);

  const system = `You are an AI assistant that helps people manage their emails.

<instructions>
IMPORTANT: Follow these instructions carefully when selecting a rule:

<priority>
1. Match the email to a SPECIFIC user-defined rule that addresses the email's exact content or purpose.
2. If the email doesn't match any specific rule but the user has a catch-all rule (like "emails that don't match other criteria"), use that catch-all rule.
3. Only use rule #${specialRuleNumber} (system fallback) if no user-defined rule can reasonably apply.
</priority>

<guidelines>
- If a rule says to exclude certain types of emails, DO NOT select that rule for those excluded emails.
- When multiple rules match, choose the more specific one that best matches the email's content.
- Rules about requiring replies should be prioritized when the email clearly needs a response.
- Rule #${specialRuleNumber} should ONLY be selected when there is absolutely no user-defined rule that could apply.
</guidelines>
</instructions>

<user_rules>
${rules.map((rule, i) => `${i + 1}. ${rule.instructions}`).join("\n")}
</user_rules>

<system_fallback>
${specialRuleNumber}. None of the other rules match or not enough information to make a decision.
</system_fallback>

${
  user.about
    ? `<user_info>
<about>${user.about}</about>
<email>${user.email}</email>
</user_info>`
    : `<user_info>
<email>${user.email}</email>
</user_info>`
}

<outputFormat>
Respond with a JSON object with the following fields:
"reason" - the reason you chose that rule. Keep it concise.
"rule" - the number of the rule you want to apply
</outputFormat>`;

  const prompt = `Select a rule to apply to this email that was sent to me:

<email>
${emailSection}
</email>`;

  logger.trace("Input", { system, prompt });

  const aiResponse = await chatCompletionObject({
    userAi: user,
    messages: [
      {
        role: "system",
        content: system,
        // This will cache if the user has a very long prompt. Although usually won't do anything as it's hard for this prompt to reach 1024 tokens
        // https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching#cache-limitations
        // NOTE: Needs permission from AWS to use this. Otherwise gives error: "You do not have access to explicit prompt caching"
        // Currently only available to select customers: https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-caching.html
        // providerOptions: {
        //   bedrock: { cachePoint: { type: "ephemeral" } },
        //   anthropic: { cacheControl: { type: "ephemeral" } },
        // },
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    schema: z.object({
      reason: z.string(),
      rule: z.number(),
    }),
    userEmail: user.email || "",
    usageLabel: "Choose rule",
  });

  logger.trace("Response", aiResponse.object);

  braintrust.insertToDataset({
    id: email.id,
    input: {
      email: emailSection,
      rules: rules.map((rule, i) => ({
        ruleNumber: i + 1,
        instructions: rule.instructions,
      })),
      hasAbout: !!user.about,
      userAbout: user.about,
      userEmail: user.email,
      specialRuleNumber,
    },
    expected: aiResponse.object.rule,
  });

  return aiResponse.object;
}

export async function aiChooseRule<
  T extends { instructions: string },
>(options: {
  email: EmailForLLM;
  rules: T[];
  user: Pick<User, "email" | "about"> & UserAIFields;
}) {
  const { email, rules, user } = options;

  if (!rules.length) return { reason: "No rules" };

  const aiResponse = await getAiResponse({
    email,
    rules,
    user,
  });

  const ruleNumber = aiResponse ? aiResponse.rule - 1 : undefined;
  if (typeof ruleNumber !== "number") {
    logger.warn("No rule selected");
    return { reason: aiResponse?.reason };
  }

  const selectedRule = rules[ruleNumber];

  return {
    rule: selectedRule,
    reason: aiResponse?.reason,
  };
}
