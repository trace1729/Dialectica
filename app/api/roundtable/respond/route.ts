import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/deepseek";
import { roundtableRespondPrompt, type RoundtableSubPhase } from "@/lib/prompts";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { philosophers, topic, currentIndex, history, subPhase } = (await request.json()) as {
      philosophers: string[];
      topic: string;
      currentIndex: number;
      history: { philosopherIndex: number; text: string }[];
      subPhase?: RoundtableSubPhase;
    };
    if (!philosophers?.length || !topic || currentIndex === undefined || !history) {
      return NextResponse.json({ error: "all fields required" }, { status: 400 });
    }
    const systemPrompt = roundtableRespondPrompt(philosophers, topic, currentIndex, history, subPhase ?? "freeDebate");
    const { content, reasoningContent } = await chat(
      [{ role: "system", content: systemPrompt }],
      { model: "deepseek-v4-pro", reasoningEffort: "high", enableThinking: true }
    );
    const result = JSON.parse(content);
    result.reasoningContent = reasoningContent;
    return NextResponse.json(result);
  } catch (error) {
    console.error("Roundtable respond error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
