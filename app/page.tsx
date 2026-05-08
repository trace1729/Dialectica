"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, DIFFICULTIES } from "@/lib/categories";
import { getStats, getCategoryXP } from "@/lib/storage";
import type { Category, Difficulty } from "@/lib/types";

export default function Home() {
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);

  const stats = typeof window !== "undefined" ? getStats() : null;

  function handleStart() {
    if (!category || !difficulty) return;
    const params = new URLSearchParams({ category, difficulty });
    router.push(`/play?${params.toString()}`);
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center p-6 font-sans">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            对话练习
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            通过 AI 角色扮演练习日常中文对话
          </p>
        </div>

        {stats && stats.sessionsCompleted > 0 && (
          <div className="mb-8 p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                学习进度
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {stats.totalXP} XP · {stats.sessionsCompleted} 次练习
              </span>
            </div>
            {CATEGORIES.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between py-1">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {cat.emoji} {cat.label}
                </span>
                <span className="text-xs text-gray-400">
                  {getCategoryXP(cat.id)} XP
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            选择场景
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`p-3 rounded-xl text-sm font-medium text-left transition-colors ${
                  category === cat.id
                    ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                <span className="mr-2">{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            选择难度
          </label>
          <div className="flex gap-2">
            {DIFFICULTIES.map((diff) => (
              <button
                key={diff.id}
                onClick={() => setDifficulty(diff.id)}
                className={`flex-1 p-3 rounded-xl text-sm font-medium text-center transition-colors ${
                  difficulty === diff.id
                    ? diff.color + " text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {diff.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleStart}
          disabled={!category || !difficulty}
          className="w-full p-4 rounded-xl bg-gray-900 text-white font-semibold text-lg transition-opacity hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed dark:bg-gray-100 dark:text-gray-900"
        >
          开始练习
        </button>

        <div className="mt-4 text-center">
          <a
            href="/stats"
            className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 underline underline-offset-4"
          >
            查看历史记录
          </a>
        </div>
      </div>
    </div>
  );
}
