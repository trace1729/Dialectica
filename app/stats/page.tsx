"use client";

import Link from "next/link";
import { getSessions, getStats } from "@/lib/storage";
import { getCategoryLabel, getDifficultyLabel } from "@/lib/categories";
import type { Session } from "@/lib/types";

function loadSessions(): Session[] {
  if (typeof window === "undefined") return [];
  return getSessions();
}

function loadStats(): ReturnType<typeof getStats> | null {
  if (typeof window === "undefined") return null;
  return getStats();
}

export default function StatsPage() {
  const sessions = loadSessions();
  const stats = loadStats();

  if (!stats || sessions.length === 0) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-6 font-sans">
        <p className="text-gray-400 text-lg mb-2">还没有练习记录</p>
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-4"
        >
          开始你的第一次练习
        </Link>
      </div>
    );
  }

  const sorted = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="flex flex-col flex-1 p-6 max-w-lg mx-auto w-full font-sans">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">练习记录</h2>
        <Link
          href="/"
          className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 underline underline-offset-4"
        >
          返回首页
        </Link>
      </div>

      <div className="mb-8 p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">总经验值</span>
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {stats.totalXP}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">练习次数</span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {stats.sessionsCompleted}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          最近练习
        </h3>
        {sorted.map((session) => (
          <div
            key={session.id}
            className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {getCategoryLabel(session.category)}
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {session.score}/10
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>
                {getDifficultyLabel(session.difficulty)} · +{session.xpEarned} XP
              </span>
              <span>{new Date(session.date).toLocaleDateString()}</span>
            </div>
            {session.strengths.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-green-600 dark:text-green-400">
                  + {session.strengths[0]}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
