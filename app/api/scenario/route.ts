import { NextRequest, NextResponse } from "next/server";
import { chat, ChatOptions } from "@/lib/deepseek";
import { scenarioPrompt } from "@/lib/prompts";
import type { Category, Difficulty } from "@/lib/types";
import { getPersonLabel, getRandomPhilosopher } from "@/lib/categories";

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
    const { category, difficulty, philosopher, speedMode, customTopic, seminarMode } = (await request.json()) as {
      category: Category;
      difficulty: Difficulty;
      philosopher?: string;
      speedMode?: boolean;
      customTopic?: string;
      seminarMode?: boolean;
    };

    if (!category || !difficulty) {
      return NextResponse.json({ error: "category and difficulty required" }, { status: 400 });
    }

    let phId = philosopher;
    let phLabel = philosopher ? getPersonLabel(philosopher) : undefined;
    if (category === "philosophy") {
      if (!phId || phId === "random") {
        phId = getRandomPhilosopher();
        phLabel = getPersonLabel(phId);
      }
    }

    const systemPrompt = scenarioPrompt(category, difficulty, phId, phLabel, customTopic, seminarMode);
    const { content } = await chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate a ${difficulty} scenario for category: ${category}` },
      ],
      getChatOptions(category, difficulty, !!speedMode)
    );

    const scenario = JSON.parse(content);
    return NextResponse.json({ ...scenario, philosopher: phId });
  } catch (error) {
    console.error("Scenario generation error:", error);
    return NextResponse.json({ error: "Failed to generate scenario" }, { status: 500 });
  }
}
