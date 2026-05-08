import { NextRequest, NextResponse } from "next/server";
import { saveSession as saveServerSession, getSessions, deleteSession } from "@/lib/server-storage";
import type { Session } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const { userId, session } = (await request.json()) as {
      userId: string;
      session: Session;
    };
    if (!userId || !session) {
      return NextResponse.json({ error: "userId and session required" }, { status: 400 });
    }
    saveServerSession(userId, session);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Save session error:", error);
    return NextResponse.json({ error: "Failed to save session" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }
  return NextResponse.json(getSessions(userId));
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId, sessionId } = (await request.json()) as { userId: string; sessionId: string };
    if (!userId || !sessionId) {
      return NextResponse.json({ error: "userId and sessionId required" }, { status: 400 });
    }
    deleteSession(userId, sessionId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete session error:", error);
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }
}
