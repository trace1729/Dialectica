import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/deepseek";
import { feedbackPrompt } from "@/lib/prompts";
import type { Category, Difficulty, Message } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { category, difficulty, transcript } = (await request.json()) as {
      category: Category;
      difficulty: Difficulty;
      transcript: Message[];
    };

    if (!category || !difficulty || !transcript) {
      return NextResponse.json(
        { error: "category, difficulty, and transcript required" },
        { status: 400 }
      );
    }

    const systemPrompt = feedbackPrompt(category, difficulty, transcript);
    const raw = await chat([
      { role: "system", content: systemPrompt },
      { role: "user", content: "Please analyze this conversation and provide feedback." },
    ]);

    const feedback = JSON.parse(raw);
    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Feedback error:", error);
    return NextResponse.json(
      { error: "Failed to generate feedback" },
      { status: 500 }
    );
  }
}
