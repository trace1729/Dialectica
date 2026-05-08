import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/deepseek";
import { respondPrompt } from "@/lib/prompts";
import type { Message } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { scenario, history, userMessage } = (await request.json()) as {
      scenario: { scene: string; npc: { name: string; role: string; tone: string } };
      history: Message[];
      userMessage: string;
    };

    if (!scenario || !history || !userMessage) {
      return NextResponse.json(
        { error: "scenario, history, and userMessage required" },
        { status: 400 }
      );
    }

    const systemPrompt = respondPrompt(scenario, history);
    const raw = await chat([
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ]);

    const npcResponse = JSON.parse(raw);
    return NextResponse.json(npcResponse);
  } catch (error) {
    console.error("NPC response error:", error);
    return NextResponse.json(
      { error: "Failed to generate NPC response" },
      { status: 500 }
    );
  }
}
