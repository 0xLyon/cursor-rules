import { getOpenAI } from "@/utils/openai";

export async function summarise(text: string) {
  const ai = getOpenAI(null);

  return ai.chat.completions.create({
    model: "gpt-3.5-turbo-0125",
    // model: 'gpt-4-turbo-preview',
    stream: true,

    messages: [
      {
        role: "system",
        content: `You are an email assistant. You summarise emails.
Summarise as bullet points.
Aim for max 5 bullet points. But even one line may be enough to summarise it.
Keep bullets short. ~5 words per bullet.
Skip any mention of sponsorships.`,
      },
      {
        role: "user",
        content: `Summarise this:
${text}`,
      },
    ],
  });
}
