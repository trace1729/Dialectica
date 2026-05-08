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

export interface ChatOptions {
  model?: string;
  reasoningEffort?: "high" | "max";
  enableThinking?: boolean;
}

export interface ChatResult {
  content: string;
  reasoningContent: string;
}

export async function chat(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  options: ChatOptions = {}
): Promise<ChatResult> {
  const { model = "deepseek-v4-flash", reasoningEffort = "high", enableThinking = true } = options;

  const params: Record<string, unknown> = {
    model,
    messages,
    stream: false,
  };

  if (enableThinking) {
    params.thinking = { type: "enabled" };
    params.reasoning_effort = reasoningEffort;
  }

  const response = await getClient().chat.completions.create(
    params as unknown as OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming
  );

  const msg = response.choices[0]?.message;
  const content = msg?.content ?? "";
  const reasoningContent = (msg as unknown as Record<string, unknown>)?.reasoning_content as string ?? "";

  return { content, reasoningContent };
}
