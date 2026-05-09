"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePlayground } from "@/hooks/usePlayground";
import { useRoundtable } from "@/hooks/useRoundtable";
import type { RoundtableParticipant } from "@/hooks/useRoundtable";
import { PHILOSOPHERS, PHILOSOPHY_FIELDS, SCIENTISTS, POLITICIANS, SCIENCE_FIELDS, POLITICS_FIELDS, getRandomField, getRandomScientist, getRandomPhilosopher, getRandomPolitician, getRandomScienceField, getRandomPoliticsField, getScienceFieldLabel, getPoliticsFieldLabel } from "@/lib/categories";
import ProgressBar from "@/components/ProgressBar";

export default function PlaygroundPageWrapper() {
  return (
    <Suspense fallback={
      <div className="flex flex-col flex-1 items-center justify-center p-6 gap-4">
        <ProgressBar label="加载中..." />
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
  const [subMode, setSubMode] = useState<"debate" | "roundtable">("debate");
  const [personType, setPersonType] = useState<"philosophy" | "science" | "politics">("philosophy");
  const [customTopicDebate, setCustomTopicDebate] = useState("");
  const [customTopicRoundtable, setCustomTopicRoundtable] = useState("");

  const draftId = searchParams.get("draft") ?? undefined;
  const { state, startDebate, nextRound, reset, continueDebate } = usePlayground(draftId);

  // Roundtable state
  const rtDraftId = searchParams.get("rtdraft") ?? undefined;
  const rt = useRoundtable(rtDraftId);
  const [rtPhilosophers, setRtPhilosophers] = useState<string[]>(Array(5).fill("random"));
  const [rtTopic, setRtTopic] = useState("random");
  const [rtMaxRounds, setRtMaxRounds] = useState(3);
  const [rtAutoMode, setRtAutoMode] = useState(false);

  // Helper: get the right person list based on subMode
  const personList = personType === "science" ? SCIENTISTS : personType === "politics" ? POLITICIANS : PHILOSOPHERS;
  const getRandomPerson = personType === "science" ? getRandomScientist : personType === "politics" ? getRandomPolitician : getRandomPhilosopher;
  const fieldList = personType === "science" ? SCIENCE_FIELDS : personType === "politics" ? POLITICS_FIELDS : PHILOSOPHY_FIELDS;
  const getRandomTopic = personType === "science" ? getRandomScienceField : personType === "politics" ? getRandomPoliticsField : getRandomField;
  const getFieldLabel = personType === "science" ? getScienceFieldLabel : personType === "politics" ? getPoliticsFieldLabel : (id: string) => PHILOSOPHY_FIELDS.find((f) => f.id === id)?.label ?? id;

  const autoNext = useCallback(() => {
    if (!autoMode || state.phase !== "playing" || state.loading) return;
    const timer = setTimeout(() => nextRound(), 2400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoMode, state.phase, state.loading, state.round, nextRound]);

  useEffect(() => { const cleanup = autoNext(); return cleanup; }, [autoNext]);

  // Roundtable auto-advance
  const rtAutoNext = useCallback(() => {
    if (!rtAutoMode || rt.state.phase !== "playing" || rt.state.loading) return;
    const timer = setTimeout(() => rt.nextMessage(), 2400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rtAutoMode, rt.state.phase, rt.state.loading, rt.state.currentTurn, rt.nextMessage]);

  useEffect(() => { const cleanup = rtAutoNext(); return cleanup; }, [rtAutoNext]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [state.messages, rt.state.messages]);

  function handleStart() {
    const a = mode === "random" ? getRandomPerson() : philosopherA;
    const b = (() => {
      if (mode === "random") {
        let pb = getRandomPerson();
        while (pb === a) pb = getRandomPerson();
        return pb;
      }
      return philosopherB;
    })();
    const t = topic === "random" ? getRandomTopic() : topic;
    const aLabel = personList.find((p) => p.id === a)?.label ?? a;
    const bLabel = personList.find((p) => p.id === b)?.label ?? b;
    const tLabel = t === "__custom__" ? customTopicDebate : getFieldLabel(t);
    startDebate(a, aLabel, b, bLabel, tLabel, maxRounds);
  }

  // ── Selector view ──
  if ((subMode === "debate" && (state.phase === "idle" || state.phase === "loading")) ||
      (subMode === "roundtable" && (rt.state.phase === "idle" || rt.state.phase === "loading"))) {
    return (
      <div className="flex flex-col flex-1 p-6 max-w-lg mx-auto w-full font-sans">
        {(state.phase === "loading" || rt.state.phase === "loading") && (
          <div className="mb-6">
            <ProgressBar label="正在生成场景..." />
          </div>
        )}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">🎪 Playground</h2>
          <button onClick={() => router.push("/")}
            className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 underline underline-offset-4">
            返回首页
          </button>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          {[
            { id: "debate" as const, label: "⚔️ 1v1 辩论" },
            { id: "roundtable" as const, label: "🏛️ 圆桌讨论" },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setSubMode(m.id)}
              className={`flex-1 p-2.5 rounded-lg text-sm font-medium transition-colors ${
                subMode === m.id
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >{m.label}</button>
          ))}
        </div>

        {/* 1v1 Debate mode */}
        {subMode === "debate" && (
        <>
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

        {/* Person type toggle */}
        <div className="mb-4">
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            {[
              { id: "philosophy" as const, label: "🧠 哲学" },
              { id: "science" as const, label: "🔬 科学" },
              { id: "politics" as const, label: "🏛️ 政治" },
            ].map((pt) => (
              <button
                key={pt.id}
                onClick={() => { setPersonType(pt.id); setPhilosopherA("random"); setPhilosopherB("random"); setTopic("random"); setCustomTopicDebate(""); }}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  personType === pt.id
                    ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >{pt.label}</button>
            ))}
          </div>
        </div>

        {mode === "select" && (
          <>
            {[{ label: personType === "science" ? "科学家 A" : personType === "politics" ? "政治家 A" : "哲学家 A", value: philosopherA, set: setPhilosopherA, list: personList },
              { label: personType === "science" ? "科学家 B" : personType === "politics" ? "政治家 B" : "哲学家 B", value: philosopherB, set: setPhilosopherB, list: personList },
            ].map((s) => (
              <div key={s.label} className="mb-4">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{s.label}</label>
                <select value={s.value} onChange={(e) => s.set(e.target.value)}
                  className="w-full p-3 rounded-xl bg-gray-100 text-gray-900 text-sm outline-none dark:bg-gray-800 dark:text-gray-100">
                  {s.list.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </div>
            ))}

            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                {personType === "science" ? "科学领域" : personType === "politics" ? "政治范畴" : "哲学范畴"}（可选）
              </label>
              <select value={topic} onChange={(e) => setTopic(e.target.value)}
                className="w-full p-3 rounded-xl bg-gray-100 text-gray-900 text-sm outline-none dark:bg-gray-800 dark:text-gray-100">
                {fieldList.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                <option value="__custom__">✏️ 自定义输入</option>
              </select>
              {topic === "__custom__" && (
                <input
                  type="text"
                  value={customTopicDebate}
                  onChange={(e) => setCustomTopicDebate(e.target.value)}
                  placeholder="输入自定义辩论主题..."
                  className="w-full mt-2 p-3 rounded-xl bg-gray-100 text-gray-900 text-sm outline-none focus:ring-2 focus:ring-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                />
              )}
            </div>
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
        </>
        )}

        {/* Roundtable mode */}
        {subMode === "roundtable" && (
        <>
          {/* Person type toggle */}
          <div className="mb-4">
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              {[
                { id: "philosophy" as const, label: "🧠 哲学" },
                { id: "science" as const, label: "🔬 科学" },
                { id: "politics" as const, label: "🏛️ 政治" },
              ].map((pt) => (
                <button
                  key={pt.id}
                  onClick={() => { setPersonType(pt.id); setRtPhilosophers(Array(5).fill("random")); setRtTopic("random"); setCustomTopicRoundtable(""); }}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    personType === pt.id
                      ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
              >{pt.label}</button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              选择5位{personType === "science" ? "科学家" : personType === "politics" ? "政治家" : "哲学家"}
            </label>
            <div className="space-y-1.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <select
                  key={i}
                  value={rtPhilosophers[i]}
                  onChange={(e) => {
                    const next = [...rtPhilosophers];
                    next[i] = e.target.value;
                    setRtPhilosophers(next);
                  }}
                  className="w-full p-2 rounded-lg bg-gray-100 text-gray-900 text-xs outline-none dark:bg-gray-800 dark:text-gray-100"
                >
                  {personList.map((p) => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">议题</label>
            <select value={rtTopic} onChange={(e) => setRtTopic(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-100 text-gray-900 text-xs outline-none dark:bg-gray-800 dark:text-gray-100">
              {fieldList.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
              <option value="__custom__">✏️ 自定义输入</option>
            </select>
            {rtTopic === "__custom__" && (
              <input
                type="text"
                value={customTopicRoundtable}
                onChange={(e) => setCustomTopicRoundtable(e.target.value)}
                placeholder="输入自定义议题..."
                className="w-full mt-2 p-2 rounded-lg bg-gray-100 text-gray-900 text-xs outline-none focus:ring-2 focus:ring-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
              />
            )}
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              轮数：{rtMaxRounds}
            </label>
            <input type="range" min={1} max={10} value={rtMaxRounds}
              onChange={(e) => setRtMaxRounds(Number(e.target.value))}
              className="w-full accent-gray-900 dark:accent-gray-100" />
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input type="checkbox" checked={rtAutoMode} onChange={(e) => setRtAutoMode(e.target.checked)} className="sr-only peer" />
                <div className="w-10 h-6 rounded-full bg-gray-300 peer-checked:bg-green-500 transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow peer-checked:translate-x-4 transition-transform" />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">⏩ 自动推进</span>
            </label>
          </div>

          <button
            onClick={() => {
              const picked = new Set<string>();
              const ids: string[] = [];
              for (const raw of rtPhilosophers) {
                let id = raw;
                if (id === "random") {
                  do { id = getRandomPerson(); } while (picked.has(id));
                } else if (picked.has(id)) {
                  do { id = getRandomPerson(); } while (picked.has(id));
                }
                picked.add(id);
                ids.push(id);
              }
              const participants: RoundtableParticipant[] = ids.map((id) => {
                const p = personList.find((ph) => ph.id === id) ?? personList[1];
                return { id: p.id, name: p.label, emoji: p.emoji };
              });
              const t = (rtTopic === "random" ? getRandomTopic() : rtTopic);
              const tLabel = t === "__custom__" ? customTopicRoundtable : getFieldLabel(t);
              rt.startRoundtable(participants, tLabel, rtMaxRounds);
            }}
            disabled={rt.state.phase === "loading"}
            className="w-full p-4 rounded-xl bg-indigo-600 text-white font-semibold text-lg hover:opacity-90 disabled:opacity-30"
          >
            {rt.state.phase === "loading" ? "生成中..." : "开始圆桌讨论"}
          </button>
        </>
        )}
      </div>
    );
  }

  // ── Roundtable viewer ──
  if (subMode === "roundtable" && rt.state.phase !== "idle") {
    const pColors = ["bg-rose-500", "bg-cyan-500", "bg-amber-500", "bg-emerald-500", "bg-violet-500"];
    return (
      <div className="flex flex-col flex-1 max-w-lg mx-auto w-full font-sans">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">圆桌讨论</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{rt.state.title}</p>
          </div>
          <div className="flex gap-1.5">
            <button onClick={() => setShowReasoning(!showReasoning)}
              className={`text-xs px-2 py-1.5 rounded-lg font-medium transition-colors ${
                showReasoning
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
              }`}>💭</button>
            {rt.state.phase !== "finished" && (
              <button onClick={() => setRtAutoMode(!rtAutoMode)}
                className={`text-xs px-2 py-1.5 rounded-lg font-medium transition-colors ${rtAutoMode ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"}`}>
                {rtAutoMode ? "⏸" : "▶"}
              </button>
            )}
            {!rtAutoMode && rt.state.phase !== "finished" && (
              <button onClick={() => rt.nextMessage()} disabled={rt.state.loading}
                className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-medium hover:opacity-90 disabled:opacity-50">
                下一轮
              </button>
            )}
            <button onClick={() => { setRtAutoMode(false); rt.reset(); }}
              className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400">
              结束
            </button>
          </div>
        </div>

        <div className="px-4 py-1 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wide">
            {rtAutoMode ? "⏩ 自动播放 · " : ""}第 {rt.state.round}/{rt.state.maxRounds} 轮
          </p>
        </div>

        {/* Philosopher cards */}
        <div className="flex gap-2 px-4 py-2 overflow-x-auto">
          {rt.state.philosophers.map((p, i) => (
            <div key={p.id} className="flex items-center gap-1 shrink-0 bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-1">
              <div className={`w-2 h-2 rounded-full ${pColors[i % 5]}`} />
              <span className="text-[10px] text-gray-700 dark:text-gray-300">{p.emoji} {p.name}</span>
            </div>
          ))}
        </div>

        <div className="mx-4 mt-1 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">场景</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">{rt.state.scene}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {rt.state.messages.map((msg, i) => {
            const p = rt.state.philosophers.find((ph) => ph.id === msg.philosopherId);
            const idx = rt.state.philosophers.findIndex((ph) => ph.id === msg.philosopherId);
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
                  {showReasoning && msg.reasoningContent && (
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 italic leading-relaxed px-2 py-1 border-l-2 border-purple-300 dark:border-purple-600 bg-purple-50/50 dark:bg-purple-950/30 rounded-r">
                      {msg.reasoningContent}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {rt.state.loading && (
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-300 animate-pulse shrink-0" />
              <div className="flex-1 p-3 rounded-2xl rounded-tl-md bg-gray-100 dark:bg-gray-800">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.1s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]" />
                </div>
              </div>
            </div>
          )}
          {rt.state.phase === "finished" && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-400">讨论结束 · {rt.state.maxRounds} 轮完成</p>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
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
