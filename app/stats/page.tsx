"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getSessions, getDebates, getStats } from "@/lib/storage";
import { getCategoryLabel, getDifficultyLabel, getPhilosopherLabel } from "@/lib/categories";
import type { Session, DebateRecord } from "@/lib/types";

export default function StatsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [debates, setDebates] = useState<DebateRecord[]>([]);
  const [stats, setStats] = useState<ReturnType<typeof getStats> | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSessions(getSessions());
    setDebates(getDebates());
    setStats(getStats());
  }, []);

  const hasRecords = stats && ((sessions?.length ?? 0) > 0 || (debates?.length ?? 0) > 0);

  if (!hasRecords) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-6 font-sans">
        <p className="text-gray-400 text-lg mb-2">还没有练习记录</p>
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-4">
          开始你的第一次练习
        </Link>
      </div>
    );
  }

  const debateCount = debates.length;
  const totalSessions = sessions.length + debateCount;

  return (
    <div className="flex flex-col flex-1 p-6 max-w-lg mx-auto w-full font-sans">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">练习记录</h2>
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 underline underline-offset-4">
          返回首页
        </Link>
      </div>

      <div className="mb-8 p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">总经验值</span>
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{stats?.totalXP ?? 0}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">总次数</span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {totalSessions}（对话 {sessions.length} · 辩论 {debateCount}）
          </span>
        </div>
      </div>

      {/* ── Debates ── */}
      {debates.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-purple-500 dark:text-purple-400 uppercase tracking-wide mb-3">
            🧠 辩论记录
          </h3>
          <div className="space-y-3">
            {[...debates].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((d) => (
              <div key={d.id} className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {d.philosopherA.emoji} {d.philosopherA.name} vs {d.philosopherB.emoji} {d.philosopherB.name}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{d.topic} · {d.actualRounds}/{d.maxRounds} 轮</span>
                  <span>{new Date(d.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Sessions ── */}
      {sessions.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            最近练习
          </h3>
          <div className="space-y-3">
            {[...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((session) => (
              <div key={session.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {session.philosopher
                      ? `${getCategoryLabel(session.category)} · ${getPhilosopherLabel(session.philosopher)}`
                      : getCategoryLabel(session.category)}
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{session.score}/10</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{getDifficultyLabel(session.difficulty)} · +{session.xpEarned} XP</span>
                  <span>{new Date(session.date).toLocaleDateString()}</span>
                </div>
                {session.strengths.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-green-600 dark:text-green-400">+ {session.strengths[0]}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
