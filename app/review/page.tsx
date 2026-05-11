"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSessions, getDebates, getRoundtables } from "@/lib/storage";
import ProgressBar from "@/components/ProgressBar";
import type { Session, DebateRecord, RoundtableRecord } from "@/lib/types";

export default function ReviewPageWrapper() {
  return (
    <Suspense fallback={
      <div className="flex flex-col flex-1 items-center justify-center p-6 gap-4">
        <ProgressBar label="加载中..." />
      </div>
    }>
      <ReviewContent />
    </Suspense>
  );
}

function ReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") as "session" | "debate" | "roundtable" | null;
  const id = searchParams.get("id");

  const [session, setSession] = useState<Session | null>(null);
  const [debate, setDebate] = useState<DebateRecord | null>(null);
  const [roundtable, setRoundtable] = useState<RoundtableRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!type || !id) { setLoading(false); return; }
    if (type === "session") {
      const sessions = getSessions();
      setSession(sessions.find((s) => s.id === id) ?? null);
    } else if (type === "debate") {
      const debates = getDebates();
      setDebate(debates.find((d) => d.id === id) ?? null);
    } else if (type === "roundtable") {
      const roundtables = getRoundtables();
      setRoundtable(roundtables.find((r) => r.id === id) ?? null);
    }
    setLoading(false);
  }, [type, id]);

  if (loading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-6 gap-4">
        <ProgressBar label="加载中..." />
      </div>
    );
  }

  if (!type || !id || (!session && !debate && !roundtable)) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-6 gap-4 font-sans">
        <p className="text-gray-400 text-sm">未找到记录</p>
        <button onClick={() => router.push("/")} className="text-sm text-blue-500 underline">返回首页</button>
      </div>
    );
  }

  // ── Session review ──
  if (session) {
    return (
      <div className="flex flex-col flex-1 max-w-lg mx-auto w-full font-sans">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">对话回顾</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {session.category} · {session.difficulty}
            </p>
          </div>
          <button onClick={() => router.push("/")} className="text-xs text-gray-400 hover:text-gray-600 underline">返回</button>
        </div>
        <div className="px-4 py-2 text-center">
          <p className="text-xs text-gray-400">评分 {session.score}/10 · {new Date(session.date).toLocaleString("zh-CN")}</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {session.transcript.map((msg, i) => {
            const isUser = msg.role === "user";
            return (
              <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[80%] space-y-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400">{isUser ? "🧑 你" : "🤖 NPC"}</span>
                  </div>
                  <div className={`p-3 rounded-2xl text-sm ${
                    isUser
                      ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 rounded-br-md"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 rounded-bl-md"
                  }`}>{msg.text}</div>
                </div>
              </div>
            );
          })}
          {session.strengths.length > 0 && (
            <div className="mt-4 p-4 rounded-2xl bg-green-50 dark:bg-green-950/20">
              <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">优点</p>
              {session.strengths.map((s, i) => <p key={i} className="text-xs text-green-600 dark:text-green-300">{s}</p>)}
            </div>
          )}
          {session.improvements.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">改进</p>
              {session.improvements.map((s, i) => <p key={i} className="text-xs text-amber-600 dark:text-amber-300">{s}</p>)}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Debate review ──
  if (debate) {
    return (
      <div className="flex flex-col flex-1 max-w-lg mx-auto w-full font-sans">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">辩论回顾</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {debate.philosopherA.emoji} {debate.philosopherA.name} vs {debate.philosopherB.emoji} {debate.philosopherB.name}
            </p>
          </div>
          <button onClick={() => router.push("/")} className="text-xs text-gray-400 hover:text-gray-600 underline">返回</button>
        </div>
        <div className="px-4 py-2 text-center">
          <p className="text-xs text-gray-400">{debate.topic} · {debate.actualRounds}/{debate.maxRounds} 轮 · {new Date(debate.date).toLocaleString("zh-CN")}</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {debate.messages.map((msg, i) => {
            const isA = msg.speaker === "A";
            const name = isA ? debate.philosopherA : debate.philosopherB;
            return (
              <div key={i} className={`flex ${isA ? "justify-start" : "justify-end"}`}>
                <div className="max-w-[80%] space-y-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400">{name.emoji}</span>
                    <span className="text-xs font-medium text-gray-500">{name.name}</span>
                    {msg.mood && <span className="text-[10px] text-gray-400">· {msg.mood}</span>}
                  </div>
                  <div className={`p-3 rounded-2xl text-sm ${
                    isA
                      ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 rounded-bl-md"
                      : "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 rounded-br-md"
                  }`}>{msg.text}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Roundtable review ──
  if (roundtable) {
    const pColors = ["bg-rose-500", "bg-cyan-500", "bg-amber-500", "bg-emerald-500", "bg-violet-500"];
    return (
      <div className="flex flex-col flex-1 max-w-lg mx-auto w-full font-sans">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">圆桌回顾</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{roundtable.title || "圆桌讨论"}</p>
          </div>
          <button onClick={() => router.push("/")} className="text-xs text-gray-400 hover:text-gray-600 underline">返回</button>
        </div>
        <div className="px-4 py-2 text-center">
          <p className="text-xs text-gray-400">{roundtable.topic} · {roundtable.actualRounds}/{roundtable.maxRounds} 轮 · {new Date(roundtable.date).toLocaleString("zh-CN")}</p>
        </div>
        <div className="flex gap-2 px-4 py-2 overflow-x-auto">
          {roundtable.philosophers.map((p, i) => (
            <div key={p.id} className="flex items-center gap-1 shrink-0 bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-1">
              <div className={`w-2 h-2 rounded-full ${pColors[i % 5]}`} />
              <span className="text-[10px] text-gray-700 dark:text-gray-300">{p.emoji} {p.name}</span>
            </div>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {roundtable.messages.map((msg, i) => {
            const p = roundtable.philosophers.find((ph) => ph.id === msg.philosopherId);
            const idx = roundtable.philosophers.findIndex((ph) => ph.id === msg.philosopherId);
            const color = pColors[idx % 5];
            if (!p) return null;
            return (
              <div key={i} className="flex items-start gap-2">
                <div className={`w-6 h-6 rounded-full ${color} shrink-0 flex items-center justify-center text-white text-[10px] font-bold mt-0.5`}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{p.emoji} {p.name}</span>
                    {msg.mood && <span className="text-[10px] text-gray-400">· {msg.mood}</span>}
                  </div>
                  <div className="text-sm text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-md p-3">
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}
