import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/deepseek";
import { debateScenarioPrompt } from "@/lib/prompts";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { philosopherA, philosopherB, topic, maxRounds } = (await request.json()) as {
      philosopherA: string;
      philosopherB: string;
      topic: string;
      maxRounds: number;
    };

    if (!philosopherA || !philosopherB || !topic || !maxRounds) {
      return NextResponse.json({ error: "all fields required" }, { status: 400 });
    }

    const systemPrompt = debateScenarioPrompt(philosopherA, philosopherB, topic, maxRounds);
    const { content } = await chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: "开始辩论" },
      ],
      { model: "deepseek-v4-pro", reasoningEffort: "high", enableThinking: true }
    );

    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    console.error("Playground scenario error:", error);
    return NextResponse.json({ error: "Failed to start debate" }, { status: 500 });
  }
}
