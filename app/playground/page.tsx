"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePlayground } from "@/hooks/usePlayground";
import { PHILOSOPHERS, PHILOSOPHY_FIELDS, getRandomPhilosopher, getRandomField } from "@/lib/categories";

export default function PlaygroundPageWrapper() {
  return (
    <Suspense fallback={
      <div className="flex flex-col flex-1 items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-gray-900 dark:border-t-gray-100 rounded-full" />
      </div>
    }>
      <PlaygroundContent />
    </Suspense>
  );
}

function PlaygroundContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"random" | "select">("random");
  const [philosopherA, setPhilosopherA] = useState("random");
  const [philosopherB, setPhilosopherB] = useState("random");
  const [topic, setTopic] = useState("random");
  const [maxRounds, setMaxRounds] = useState(5);
  const [autoMode, setAutoMode] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);

  const draftId = searchParams.get("draft") ?? undefined;
  const { state, startDebate, nextRound, reset, continueDebate } = usePlayground(draftId);

  const autoNext = useCallback(() => {
    if (!autoMode || state.phase !== "playing" || state.loading) return;
    const timer = setTimeout(() => nextRound(), 2400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoMode, state.phase, state.loading, state.round, nextRound]);

  useEffect(() => { const cleanup = autoNext(); return cleanup; }, [autoNext]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [state.messages]);

  function handleStart() {
    const a = mode === "random" ? getRandomPhilosopher() : philosopherA;
    const b = (() => {
      if (mode === "random") {
        let pb = getRandomPhilosopher();
        while (pb === a) pb = getRandomPhilosopher();
        return pb;
      }
      return philosopherB;
    })();
    const t = topic === "random" ? getRandomField() : topic;
    const aLabel = PHILOSOPHERS.find((p) => p.id === a)?.label ?? a;
    const bLabel = PHILOSOPHERS.find((p) => p.id === b)?.label ?? b;
    const tLabel = PHILOSOPHY_FIELDS.find((f) => f.id === t)?.label ?? t;
    startDebate(a, aLabel, b, bLabel, tLabel, maxRounds);
  }

  // ── Selector view ──
  if (state.phase === "idle" || state.phase === "loading") {
    return (
      <div className="flex flex-col flex-1 p-6 max-w-lg mx-auto w-full font-sans">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">辩论 Playground</h2>
          <button onClick={() => router.push("/")}
            className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 underline underline-offset-4">
            返回首页
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">模式</label>
          <div className="flex gap-2">
            {[{ id: "random" as const, label: "🎲 随机模式" }, { id: "select" as const, label: "🎯 指定模式" }].map((m) => (
              <button key={m.id} onClick={() => setMode(m.id)}
                className={`flex-1 p-3 rounded-xl text-sm font-medium transition-colors ${
                  mode === m.id
                    ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                }`}>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {mode === "select" && (
          <>
            {[{ label: "哲学家 A", value: philosopherA, set: setPhilosopherA, list: PHILOSOPHERS },
              { label: "哲学家 B", value: philosopherB, set: setPhilosopherB, list: PHILOSOPHERS },
              { label: "哲学范畴（可选）", value: topic, set: setTopic, list: PHILOSOPHY_FIELDS }
            ].map((s) => (
              <div key={s.label} className="mb-4">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{s.label}</label>
                <select value={s.value} onChange={(e) => s.set(e.target.value)}
                  className="w-full p-3 rounded-xl bg-gray-100 text-gray-900 text-sm outline-none dark:bg-gray-800 dark:text-gray-100">
                  {s.list.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </div>
            ))}
          </>
        )}

        <div className="mb-6">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            最大轮次：{maxRounds}
          </label>
          <input type="range" min={3} max={100} value={maxRounds}
            onChange={(e) => setMaxRounds(Number(e.target.value))}
            className="w-full accent-gray-900 dark:accent-gray-100" />
          <div className="flex justify-between text-[10px] text-gray-400"><span>3</span><span>100</span></div>
        </div>

        <div className="mb-8">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input type="checkbox" checked={autoMode} onChange={(e) => setAutoMode(e.target.checked)} className="sr-only peer" />
              <div className="w-10 h-6 rounded-full bg-gray-300 peer-checked:bg-green-500 transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow peer-checked:translate-x-4 transition-transform" />
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">⏩ 自动推进</span>
              <span className="block text-xs text-gray-400">每轮自动播放</span>
            </div>
          </label>
        </div>

        <button onClick={handleStart} disabled={state.phase === "loading"}
          className="w-full p-4 rounded-xl bg-gray-900 text-white font-semibold text-lg hover:opacity-90 disabled:opacity-30 dark:bg-gray-100 dark:text-gray-900">
          {state.phase === "loading" ? "生成中..." : "开始辩论"}
        </button>
      </div>
    );
  }

  // ── Debate view ──
  return (
    <div className="flex flex-1 font-sans">
      {/* Main column */}
      <div className={`flex flex-col flex-1 max-w-lg mx-auto w-full ${showReasoning ? "" : ""}`}>
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">辩论</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {state.philosopherA.name} vs {state.philosopherB.name}
            </p>
          </div>
          <div className="flex gap-1.5">
            <button onClick={() => setShowReasoning(!showReasoning)}
              className={`text-xs px-2 py-1.5 rounded-lg font-medium transition-colors ${
                showReasoning
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
              }`}>💭</button>
            {state.phase !== "finished" && (
              <button onClick={() => setAutoMode(!autoMode)}
                className={`text-xs px-2 py-1.5 rounded-lg font-medium transition-colors ${
                  autoMode
                    ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
                }`}>{autoMode ? "⏸" : "▶"}</button>
            )}
            {!autoMode && state.phase !== "finished" && (
              <button onClick={nextRound} disabled={state.loading}
                className="text-xs px-3 py-1.5 rounded-lg bg-gray-900 text-white font-medium hover:opacity-90 dark:bg-gray-100 dark:text-gray-900 disabled:opacity-50">
                下一轮
              </button>
            )}
            <button onClick={() => { setAutoMode(false); reset(); }}
              className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400">
              结束
            </button>
          </div>
        </div>

        <div className="px-4 py-1 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wide">
            {autoMode ? "⏩ 自动播放 · " : ""}第 {state.round}/{state.maxRounds} 轮
          </p>
        </div>

        <div className="mx-4 mt-1 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{state.title}</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">{state.scene}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {state.messages.map((msg, i) => {
            const isA = msg.speaker === "A";
            const name = isA ? state.philosopherA : state.philosopherB;
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
                  {showReasoning && msg.reasoningContent && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 italic leading-relaxed px-2 py-1 border-l-2 border-purple-300 dark:border-purple-600 bg-purple-50/50 dark:bg-purple-950/30 rounded-r">
                      {msg.reasoningContent}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {state.loading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-3 rounded-2xl bg-gray-100 dark:bg-gray-800 rounded-bl-md">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.1s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]" />
                </div>
              </div>
            </div>
          )}
          {state.phase === "finished" && (
            <div className="text-center py-4 space-y-3">
              <p className="text-sm text-gray-400">辩论结束 · {state.maxRounds} 轮完成</p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => continueDebate(3)}
                  className="text-xs px-4 py-2 rounded-lg bg-gray-900 text-white font-medium hover:opacity-90 dark:bg-gray-100 dark:text-gray-900"
                >
                  +3 轮继续
                </button>
                <button
                  onClick={() => continueDebate(5)}
                  className="text-xs px-4 py-2 rounded-lg bg-gray-900 text-white font-medium hover:opacity-90 dark:bg-gray-100 dark:text-gray-900"
                >
                  +5 轮继续
                </button>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>
    </div>
  );
}
