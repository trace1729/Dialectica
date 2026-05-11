import { NextRequest, NextResponse } from "next/server";
import { chat, ChatOptions } from "@/lib/deepseek";
import { respondPrompt } from "@/lib/prompts";
import type { Category, Difficulty, Message } from "@/lib/types";

export const dynamic = "force-dynamic";

function getChatOptions(category: Category, difficulty: Difficulty, speedMode: boolean): ChatOptions {
  const isDaily = category === "small_talk" || category === "ordering_food" || category === "workplace"
    || category === "social_event" || category === "phone_call" || category === "conflict_resolution";
  const isDeep = !isDaily;
  return {
    model: isDeep ? "deepseek-v4-pro" : "deepseek-v4-flash",
    reasoningEffort: difficulty === "hard" ? "max" : "high",
    enableThinking: !speedMode,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { category, difficulty, scenario, history, userMessage, speedMode, seminarMode } = (await request.json()) as {
      category: Category;
      difficulty: Difficulty;
      scenario: { scene: string; npc: { name: string; role: string; tone: string } };
      history: Message[];
      userMessage: string;
      speedMode?: boolean;
      seminarMode?: boolean;
    };

    if (!category || !difficulty || !scenario || !history || !userMessage) {
      return NextResponse.json({ error: "all fields required" }, { status: 400 });
    }

    const systemPrompt = respondPrompt(category, scenario, history, seminarMode);
    const { content } = await chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      getChatOptions(category, difficulty, !!speedMode)
    );

    let npcResponse;
    try {
      npcResponse = JSON.parse(content.trim());
    } catch {
      // Model returned plain text instead of JSON — use text as response
      npcResponse = { npcResponse: content.trim(), npcMood: "平静" };
    }
    return NextResponse.json(npcResponse);
  } catch (error) {
    console.error("NPC response error:", error);
    return NextResponse.json({ error: "Failed to generate NPC response" }, { status: 500 });
  }
}
