import { NextRequest, NextResponse } from "next/server";
import { saveDebate, getDebates, deleteDebate } from "@/lib/server-storage";

export async function POST(request: NextRequest) {
  try {
    const { userId, debate } = (await request.json()) as {
      userId: string;
      debate: { id: string; date: string; philosopherA: { name: string; emoji: string }; philosopherB: { name: string; emoji: string }; topic: string; maxRounds: number; actualRounds: number; messages: { speaker: string; text: string }[] };
    };
    if (!userId || !debate) {
      return NextResponse.json({ error: "userId and debate required" }, { status: 400 });
    }
    saveDebate(userId, debate);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Save debate error:", error);
    return NextResponse.json({ error: "Failed to save debate" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }
  return NextResponse.json(getDebates(userId));
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId, debateId } = (await request.json()) as { userId: string; debateId: string };
    if (!userId || !debateId) {
      return NextResponse.json({ error: "userId and debateId required" }, { status: 400 });
    }
    deleteDebate(userId, debateId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete debate error:", error);
    return NextResponse.json({ error: "Failed to delete debate" }, { status: 500 });
  }
}
