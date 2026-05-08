import OpenAI from "openai";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY ?? "",
      baseURL: "https://api.deepseek.com",
    });
  }
  return client;
}

export async function chat(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]): Promise<string> {
  const response = await getClient().chat.completions.create({
    model: "deepseek-chat",
    messages,
    temperature: 0.8,
    max_tokens: 1024,
  });

  return response.choices[0]?.message?.content ?? "";
}
