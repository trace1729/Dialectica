import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/deepseek";
import { debateRespondPrompt } from "@/lib/prompts";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { philosopherA, philosopherB, topic, currentSpeaker, history } = (await request.json()) as {
      philosopherA: string;
      philosopherB: string;
      topic: string;
      currentSpeaker: "A" | "B";
      history: { speaker: string; text: string }[];
    };

    if (!philosopherA || !philosopherB || !topic || !currentSpeaker || !history) {
      return NextResponse.json({ error: "all fields required" }, { status: 400 });
    }

    const systemPrompt = debateRespondPrompt(philosopherA, philosopherB, topic, currentSpeaker, history);
    const { content, reasoningContent } = await chat(
      [{ role: "system", content: systemPrompt }],
      { model: "deepseek-v4-pro", reasoningEffort: "high", enableThinking: true }
    );

    const result = JSON.parse(content);
    result.reasoningContent = reasoningContent;
    return NextResponse.json(result);
  } catch (error) {
    console.error("Playground respond error:", error);
    return NextResponse.json({ error: "Failed to continue debate" }, { status: 500 });
  }
}
