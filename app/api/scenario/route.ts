import { NextRequest, NextResponse } from "next/server";
import { chat, ChatOptions } from "@/lib/deepseek";
import { scenarioPrompt } from "@/lib/prompts";
import type { Category, Difficulty } from "@/lib/types";
import { getPhilosopherLabel, getRandomPhilosopher } from "@/lib/categories";

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
    const { category, difficulty, philosopher, speedMode } = (await request.json()) as {
      category: Category;
      difficulty: Difficulty;
      philosopher?: string;
      speedMode?: boolean;
    };

    if (!category || !difficulty) {
      return NextResponse.json({ error: "category and difficulty required" }, { status: 400 });
    }

    let phId = philosopher;
    let phLabel = philosopher ? getPhilosopherLabel(philosopher) : undefined;
    if (category === "philosophy") {
      if (!phId || phId === "random") {
        phId = getRandomPhilosopher();
        phLabel = getPhilosopherLabel(phId);
      }
    }

    const systemPrompt = scenarioPrompt(category, difficulty, phId, phLabel);
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
