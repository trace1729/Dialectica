import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/deepseek";
import { scenarioPrompt } from "@/lib/prompts";
import type { Category, Difficulty } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { category, difficulty } = (await request.json()) as {
      category: Category;
      difficulty: Difficulty;
    };

    if (!category || !difficulty) {
      return NextResponse.json(
        { error: "category and difficulty required" },
        { status: 400 }
      );
    }

    const systemPrompt = scenarioPrompt(category, difficulty);
    const raw = await chat([
      { role: "system", content: systemPrompt },
      { role: "user", content: `Generate a ${difficulty} scenario for category: ${category}` },
    ]);

    const scenario = JSON.parse(raw);
    return NextResponse.json(scenario);
  } catch (error) {
    console.error("Scenario generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate scenario" },
      { status: 500 }
    );
  }
}
