import { NextRequest, NextResponse } from "next/server";
import { chat, ChatOptions } from "@/lib/deepseek";
import { feedbackPrompt } from "@/lib/prompts";
import type { Category, Difficulty, Message } from "@/lib/types";

export const dynamic = "force-dynamic";

function getChatOptions(category: Category, difficulty: Difficulty, speedMode: boolean): ChatOptions {
  const isDeep = category === "philosophy" || category === "computer_architecture" || category === "parallel_programming" || category === "llm";
  return {
    model: isDeep ? "deepseek-v4-pro" : "deepseek-v4-flash",
    reasoningEffort: difficulty === "hard" ? "max" : "high",
    enableThinking: !speedMode,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { category, difficulty, transcript, speedMode } = (await request.json()) as {
      category: Category;
      difficulty: Difficulty;
      transcript: Message[];
      speedMode?: boolean;
    };

    if (!category || !difficulty || !transcript) {
      return NextResponse.json({ error: "all fields required" }, { status: 400 });
    }

    const systemPrompt = feedbackPrompt(category, difficulty, transcript);
    const { content } = await chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Please analyze this conversation and provide feedback." },
      ],
      getChatOptions(category, difficulty, !!speedMode)
    );

    const feedback = JSON.parse(content);
    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Feedback error:", error);
    return NextResponse.json({ error: "Failed to generate feedback" }, { status: 500 });
  }
}
