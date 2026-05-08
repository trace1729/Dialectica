"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TOPICS, DIFFICULTIES, PHILOSOPHERS, getCategoriesByTopic, getCategoryLabel, getDifficultyLabel } from "@/lib/categories";
import { getStats, getDrafts, deleteDraft, getSessions, getDebates, getDebateDrafts, deleteDebateDraft, deleteSession, deleteDebate } from "@/lib/storage";
import ConfirmDialog from "@/components/ConfirmDialog";
import type { Category, Difficulty, Topic, DraftSession, DebateRecord, DraftDebate } from "@/lib/types";

export default function Home() {
  const router = useRouter();
  const [topic, setTopic] = useState<Topic>("daily");
  const [category, setCategory] = useState<Category | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [philosopher, setPhilosopher] = useState("random");
  const [speedMode, setSpeedMode] = useState(false);
  const [stats, setStats] = useState<ReturnType<typeof getStats> | null>(null);
  const [drafts, setDrafts] = useState<DraftSession[]>([]);
  const [sessions, setSessions] = useState<ReturnType<typeof getSessions>>([]);
  const [debates, setDebates] = useState<DebateRecord[]>([]);
  const [debateDrafts, setDebateDrafts] = useState<DraftDebate[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<{ type: "session" | "debate"; id: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStats(getStats());
    setDrafts(getDrafts());
    setSessions(getSessions());
    setDebates(getDebates());
    setDebateDrafts(getDebateDrafts());
  }, []);

  const topicCategories = getCategoriesByTopic(topic);

  function handleStart() {
    if (!category || !difficulty) return;
    const params = new URLSearchParams({ category, difficulty });
    if (category === "philosophy") params.set("philosopher", philosopher);
    if (speedMode) params.set("speed", "1");
    router.push(`/play?${params.toString()}`);
  }

  function handleDeleteDraft(id: string) {
    deleteDraft(id);
    setDrafts(getDrafts());
    setSessions(getSessions());
    setDebates(getDebates());
  }

  function toggleExpand(id: string) {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpanded(next);
  }

  function handleDeleteSession(id: string) {
    setDeletingId(id);
    setTimeout(() => {
      deleteSession(id);
      setSessions(getSessions());
      setStats(getStats());
      setDeletingId(null);
      setConfirmDelete(null);
    }, 300);
  }

  function handleDeleteDebate(id: string) {
    setDeletingId(id);
    setTimeout(() => {
      deleteDebate(id);
      setDebates(getDebates());
      setDeletingId(null);
      setConfirmDelete(null);
    }, 300);
  }

  return (
    <div className="flex flex-row flex-1 font-sans overflow-hidden">
      {/* ── Left Sidebar ── */}
      <aside className="w-72 min-w-72 border-r border-gray-100 dark:border-gray-800 flex flex-col bg-gray-50/50 dark:bg-gray-900/50">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">会话列表</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Draft sessions */}
          {drafts.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-2 px-1">
                进行中 · {drafts.length}
              </p>
              {drafts.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((d) => (
                <div
                  key={d.id}
                  onClick={() => {
                    const params = new URLSearchParams({ category: d.category, difficulty: d.difficulty, draft: d.id });
                    router.push(`/play?${params.toString()}`);
                  }}
                  className="mb-1.5 p-2.5 rounded-lg bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-800 cursor-pointer hover:border-amber-400 dark:hover:border-amber-600 transition-colors"
                >
                  <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                    {getCategoryLabel(d.category)}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate mt-0.5">
                    {d.npcName || "NPC"} · {d.transcript.length} 条
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {getDifficultyLabel(d.difficulty)} · {new Date(d.date).toLocaleString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteDraft(d.id); }}
                    className="mt-1 text-[10px] text-red-400 hover:text-red-600"
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Debate drafts in progress */}
          {debateDrafts.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-purple-500 uppercase tracking-wide mb-2 px-1">
                🧠 辩论进行中 · {debateDrafts.length}
              </p>
              {debateDrafts.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((dd) => (
                <div
                  key={dd.id}
                  onClick={() => router.push(`/playground?draft=${dd.id}`)}
                  className="mb-1.5 p-2.5 rounded-lg bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-800 cursor-pointer hover:border-purple-400 dark:hover:border-purple-600 transition-colors"
                >
                  <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                    {dd.philosopherA.name} vs {dd.philosopherB.name}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate mt-0.5">
                    {dd.topic} · {dd.messages.length} 条 · 第{dd.round}轮
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {new Date(dd.date).toLocaleString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteDebateDraft(dd.id); setDebateDrafts(getDebateDrafts()); }}
                    className="mt-1 text-[10px] text-red-400 hover:text-red-600"
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Recent completed sessions */}
          {sessions.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1 mt-4">
                已完成 · {sessions.length}
              </p>
              {sessions.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20).map((s) => (
                <div
                  key={s.id}
                  className={`mb-1 rounded-lg bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300 ${
                    deletingId === s.id ? "scale-95 opacity-0" : ""
                  }`}
                >
                  <div
                    onClick={() => toggleExpand(s.id)}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <p className="text-[11px] font-medium text-gray-700 dark:text-gray-300 truncate flex-1">
                      {getCategoryLabel(s.category)}
                    </p>
                    <div className="flex items-center gap-1 shrink-0 ml-1">
                      <span className="text-[11px] font-bold text-gray-900 dark:text-gray-100">{s.score}/10</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDelete({ type: "session", id: s.id }); }}
                        className="text-[10px] text-gray-400 hover:text-red-500 px-1"
                        title="删除"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 px-2 pb-1">
                    {getDifficultyLabel(s.difficulty)} · {new Date(s.date).toLocaleString("zh-CN", { month: "short", day: "numeric" })}
                  </p>
                  {expanded.has(s.id) && (
                    <div className="border-t border-gray-100 dark:border-gray-700 px-2 py-2 text-[11px] max-h-48 overflow-y-auto">
                      {s.transcript.map((m, i) => (
                        <div key={i} className="py-0.5">
                          <span className="text-gray-400">{m.role === "user" ? "🧑" : "🤖"}</span>
                          <span className="text-gray-600 dark:text-gray-300 ml-1">{m.text}</span>
                        </div>
                      ))}
                      {s.strengths.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                          <p className="text-[10px] text-green-600 dark:text-green-400 mb-0.5">+ {s.strengths[0]}</p>
                          {s.improvements.length > 0 && (
                            <p className="text-[10px] text-amber-600 dark:text-amber-400">→ {s.improvements[0]}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Debates */}
          {debates.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-purple-500 uppercase tracking-wide mb-2 px-1 mt-4">
                🧠 辩论 · {debates.length}
              </p>
              {debates.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20).map((d) => (
                <div
                  key={d.id}
                  className={`mb-1 rounded-lg bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900 overflow-hidden transition-all duration-300 ${
                    deletingId === d.id ? "scale-95 opacity-0" : ""
                  }`}
                >
                  <div
                    onClick={() => toggleExpand(d.id)}
                    className="flex items-start justify-between p-2 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-gray-700 dark:text-gray-300 truncate">
                        {d.philosopherA.emoji} {d.philosopherA.name} vs {d.philosopherB.emoji} {d.philosopherB.name}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {d.topic} · {d.actualRounds}/{d.maxRounds} 轮 · {new Date(d.date).toLocaleString("zh-CN", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmDelete({ type: "debate", id: d.id }); }}
                      className="text-[10px] text-gray-400 hover:text-red-500 px-1 shrink-0"
                      title="删除"
                    >
                      🗑
                    </button>
                  </div>
                  {expanded.has(d.id) && (
                    <div className="border-t border-purple-100 dark:border-purple-800 px-2 py-2 text-[11px] max-h-48 overflow-y-auto">
                      {d.messages.map((m, i) => (
                        <div key={i} className="py-0.5">
                          <span className="text-gray-400">{m.speaker === "A" ? d.philosopherA.emoji : d.philosopherB.emoji}</span>
                          <span className={`ml-1 ${m.speaker === "A" ? "text-gray-600 dark:text-gray-300" : "text-gray-700 dark:text-gray-200"}`}>{m.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {drafts.length === 0 && debateDrafts.length === 0 && sessions.length === 0 && debates.length === 0 && (
            <div className="text-center py-8">
              <p className="text-xs text-gray-400">暂无会话记录</p>
              <p className="text-[10px] text-gray-400 mt-1">开始一次对话练习吧</p>
            </div>
          )}

          {/* Stats summary */}
          {stats && stats.sessionsCompleted > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">学习统计</p>
              <p className="text-xs text-gray-700 dark:text-gray-300">{stats.totalXP} XP · {stats.sessionsCompleted} 次</p>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => router.push("/stats")}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 underline underline-offset-4"
          >
            查看全部历史 →
          </button>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <main className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">对话练习</h1>
            <p className="text-sm text-gray-400">AI 角色扮演 · 哲学辩论 · 技术探讨</p>
          </div>

          {/* Playground card */}
          <div
            onClick={() => router.push("/playground")}
            className="mb-5 p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-700 dark:to-purple-800 text-white cursor-pointer hover:opacity-95 transition-opacity shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold">🧠 Playground</h2>
                <p className="text-xs text-indigo-100 mt-0.5">辩论+圆桌讨论</p>
              </div>
              <span className="text-xl">→</span>
            </div>
          </div>

          {/* Topic tabs */}
          <div className="flex gap-1 mb-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            {TOPICS.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTopic(t.id); setCategory(null); }}
                className={`flex-1 p-2 rounded-lg text-xs font-medium transition-colors ${
                  topic === t.id
                    ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <span className="mr-1">{t.emoji}</span>{t.label}
              </button>
            ))}
          </div>

          {/* Categories */}
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-1.5">
              {topicCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`p-2.5 rounded-xl text-xs font-medium text-left transition-colors ${
                    category === cat.id
                      ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className="mr-1.5">{cat.emoji}</span>{cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Philosopher selector */}
          {topic === "philosophy" && (
            <div className="mb-4">
              <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">哲学家（可选）</label>
              <div className="flex flex-wrap gap-1">
                {PHILOSOPHERS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPhilosopher(p.id)}
                    className={`p-1 rounded-md text-[10px] font-medium transition-colors whitespace-nowrap ${
                      philosopher === p.id
                        ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                    }`}
                  >
                    <span className="mr-0.5">{p.emoji}</span>{p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Difficulty */}
          <div className="mb-3">
            <div className="flex gap-1.5">
              {DIFFICULTIES.map((diff) => (
                <button
                  key={diff.id}
                  onClick={() => setDifficulty(diff.id)}
                  className={`flex-1 p-2.5 rounded-xl text-xs font-medium text-center transition-colors ${
                    difficulty === diff.id ? diff.color + " text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >{diff.label}</button>
              ))}
            </div>
          </div>

          {/* Speed mode */}
          <div className="mb-5">
            <label className="flex items-center gap-2 cursor-pointer">
              <div className="relative">
                <input type="checkbox" checked={speedMode} onChange={(e) => setSpeedMode(e.target.checked)} className="sr-only peer" />
                <div className="w-8 h-5 rounded-full bg-gray-300 peer-checked:bg-green-500 transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow peer-checked:translate-x-3 transition-transform" />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">⚡ 极速</span>
            </label>
          </div>

          <button
            onClick={handleStart}
            disabled={!category || !difficulty}
            className="w-full p-3.5 rounded-xl bg-gray-900 text-white font-semibold text-base transition-opacity hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed dark:bg-gray-100 dark:text-gray-900"
          >
            开始练习
          </button>
        </div>
      </main>

      <ConfirmDialog
        open={confirmDelete !== null}
        title={confirmDelete?.type === "session" ? "删除对话记录" : "删除辩论记录"}
        message="删除后无法恢复，确定要删除吗？"
        onConfirm={() => {
          if (!confirmDelete) return;
          if (confirmDelete.type === "session") handleDeleteSession(confirmDelete.id);
          else handleDeleteDebate(confirmDelete.id);
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
