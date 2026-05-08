import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/deepseek";
import { roundtableScenarioPrompt } from "@/lib/prompts";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { philosophers, topic, maxRounds } = (await request.json()) as {
      philosophers: string[];
      topic: string;
      maxRounds: number;
    };
    if (!philosophers?.length || !topic || !maxRounds) {
      return NextResponse.json({ error: "all fields required" }, { status: 400 });
    }
    const systemPrompt = roundtableScenarioPrompt(philosophers, topic, maxRounds);
    const { content } = await chat(
      [{ role: "system", content: systemPrompt }, { role: "user", content: "开始圆桌讨论" }],
      { model: "deepseek-v4-pro", reasoningEffort: "high", enableThinking: true }
    );
    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    console.error("Roundtable scenario error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
