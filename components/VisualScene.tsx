import type { Category } from "@/lib/types";

const categoryScenes: Record<Category, { bg: string; elements: React.ReactNode }> = {
  small_talk: {
    bg: "bg-amber-50 dark:bg-amber-950",
    elements: (
      <div className="flex items-end justify-center gap-2 h-full pb-4">
        <div className="w-10 h-14 rounded-t-lg bg-amber-300 dark:bg-amber-600" />
        <div className="w-10 h-16 rounded-t-lg bg-amber-400 dark:bg-amber-500" />
        <div className="w-10 h-12 rounded-t-lg bg-amber-200 dark:bg-amber-700" />
      </div>
    ),
  },
  ordering_food: {
    bg: "bg-orange-50 dark:bg-orange-950",
    elements: (
      <div className="flex items-end justify-center h-full pb-2">
        <div className="w-28 h-10 rounded-t-2xl bg-orange-300 dark:bg-orange-600 flex items-center justify-center">
          <div className="w-16 h-2 rounded bg-orange-500 dark:bg-orange-400" />
        </div>
      </div>
    ),
  },
  workplace: {
    bg: "bg-blue-50 dark:bg-blue-950",
    elements: (
      <div className="flex items-end justify-center gap-4 h-full pb-4">
        <div className="w-16 h-10 rounded bg-blue-300 dark:bg-blue-600" />
        <div className="w-24 h-6 rounded bg-blue-200 dark:bg-blue-700" />
      </div>
    ),
  },
  social_event: {
    bg: "bg-purple-50 dark:bg-purple-950",
    elements: (
      <div className="flex items-center justify-center gap-3 h-full">
        <div className="w-6 h-6 rounded-full bg-purple-400 dark:bg-purple-500" />
        <div className="w-4 h-4 rounded-full bg-yellow-400 dark:bg-yellow-500" />
        <div className="w-5 h-5 rounded-full bg-pink-400 dark:bg-pink-500" />
        <div className="w-6 h-6 rounded-full bg-purple-300 dark:bg-purple-600" />
      </div>
    ),
  },
  phone_call: {
    bg: "bg-teal-50 dark:bg-teal-950",
    elements: (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-10 rounded-md bg-teal-400 dark:bg-teal-500 rotate-12" />
      </div>
    ),
  },
  conflict_resolution: {
    bg: "bg-red-50 dark:bg-red-950",
    elements: (
      <div className="flex items-center justify-center gap-6 h-full">
        <div className="w-8 h-14 rounded-full bg-red-300 dark:bg-red-600" />
        <div className="w-1 h-8 rounded bg-red-400 dark:bg-red-500 rotate-45" />
        <div className="w-8 h-14 rounded-full bg-blue-300 dark:bg-blue-600" />
      </div>
    ),
  },
  philosophy: {
    bg: "bg-indigo-50 dark:bg-indigo-950",
    elements: (
      <div className="flex items-center justify-center gap-4 h-full">
        <div className="w-12 h-16 rounded bg-amber-200 dark:bg-amber-700 flex items-center justify-center">
          <div className="w-8 h-1 rounded bg-amber-400 dark:bg-amber-500" />
        </div>
        <div className="w-4 h-4 rounded-full bg-indigo-400 dark:bg-indigo-500 animate-pulse" />
      </div>
    ),
  },
  computer_architecture: {
    bg: "bg-gray-100 dark:bg-gray-900",
    elements: (
      <div className="flex items-center justify-center gap-2 h-full">
        <div className="w-14 h-8 rounded bg-green-300 dark:bg-green-600 flex items-center justify-center gap-1">
          {[0,1,2,3,4].map(i => <div key={i} className="w-1 h-4 rounded bg-green-600 dark:bg-green-300" />)}
        </div>
      </div>
    ),
  },
  parallel_programming: {
    bg: "bg-cyan-50 dark:bg-cyan-950",
    elements: (
      <div className="flex items-center justify-center gap-1 h-full">
        {[0,1,2,3].map(i => <div key={i} className="w-5 h-8 rounded bg-cyan-400 dark:bg-cyan-500 animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />)}
      </div>
    ),
  },
  llm: {
    bg: "bg-violet-50 dark:bg-violet-950",
    elements: (
      <div className="flex items-center justify-center gap-1 h-full">
        <div className="w-10 h-10 rounded-full bg-violet-300 dark:bg-violet-600 flex items-center justify-center">
          <span className="text-[10px] text-violet-700 dark:text-violet-200 font-mono">AI</span>
        </div>
      </div>
    ),
  },
  ai_ml: {
    bg: "bg-rose-50 dark:bg-rose-950",
    elements: (
      <div className="flex items-center justify-center gap-1 h-full">
        <div className="w-8 h-8 rounded-full bg-rose-300 dark:bg-rose-600" />
        <div className="w-6 h-6 rounded-full bg-rose-400 dark:bg-rose-500" />
        <div className="w-4 h-4 rounded-full bg-rose-200 dark:bg-rose-700" />
      </div>
    ),
  },
  quantum: {
    bg: "bg-sky-50 dark:bg-sky-950",
    elements: (
      <div className="flex items-center justify-center gap-2 h-full">
        <div className="w-3 h-3 rounded-full bg-sky-400 dark:bg-sky-500 animate-spin" style={{ animationDuration: "3s" }} />
        <div className="w-5 h-5 rounded-full border-2 border-sky-300 dark:border-sky-600" />
      </div>
    ),
  },
  cs_theory: {
    bg: "bg-slate-100 dark:bg-slate-900",
    elements: (
      <div className="flex items-center justify-center h-full">
        <div className="w-16 h-4 rounded bg-slate-400 dark:bg-slate-500" />
      </div>
    ),
  },
  software_engineering: {
    bg: "bg-emerald-50 dark:bg-emerald-950",
    elements: (
      <div className="flex items-end justify-center gap-1 h-full pb-2">
        <div className="w-6 h-12 rounded-t bg-emerald-300 dark:bg-emerald-600" />
        <div className="w-6 h-8 rounded-t bg-emerald-400 dark:bg-emerald-500" />
        <div className="w-6 h-14 rounded-t bg-emerald-200 dark:bg-emerald-700" />
      </div>
    ),
  },
  crypto_security: {
    bg: "bg-yellow-50 dark:bg-yellow-950",
    elements: (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 rounded bg-yellow-300 dark:bg-yellow-600 flex items-center justify-center">
          <span className="text-xs font-mono font-bold text-yellow-700 dark:text-yellow-200">🔐</span>
        </div>
      </div>
    ),
  },
  networks: {
    bg: "bg-blue-50 dark:bg-blue-950",
    elements: (
      <div className="flex items-center justify-center gap-1 h-full">
        <div className="w-4 h-4 rounded-full bg-blue-400 dark:bg-blue-500" />
        <div className="w-px h-8 bg-blue-300 dark:bg-blue-600" />
        <div className="w-4 h-4 rounded-full bg-blue-400 dark:bg-blue-500" />
        <div className="w-px h-6 bg-blue-300 dark:bg-blue-600" />
        <div className="w-4 h-4 rounded-full bg-blue-400 dark:bg-blue-500" />
      </div>
    ),
  },
  robotics: {
    bg: "bg-stone-100 dark:bg-stone-900",
    elements: (
      <div className="flex items-center justify-center gap-2 h-full">
        <div className="w-8 h-10 rounded bg-stone-400 dark:bg-stone-500 flex items-center justify-center">
          <div className="w-4 h-3 rounded-full bg-stone-600 dark:bg-stone-300" />
        </div>
      </div>
    ),
  },
  systems: {
    bg: "bg-gray-100 dark:bg-gray-900",
    elements: (
      <div className="flex items-center justify-center gap-1 h-full">
        <div className="w-5 h-12 rounded bg-gray-400 dark:bg-gray-500" />
        <div className="w-5 h-8 rounded bg-gray-300 dark:bg-gray-600" />
        <div className="w-5 h-10 rounded bg-gray-500 dark:bg-gray-400" />
      </div>
    ),
  },
  data_science: {
    bg: "bg-fuchsia-50 dark:bg-fuchsia-950",
    elements: (
      <div className="flex items-end justify-center gap-1 h-full pb-2">
        <div className="w-5 h-6 rounded-t bg-fuchsia-300 dark:bg-fuchsia-600" />
        <div className="w-5 h-10 rounded-t bg-fuchsia-400 dark:bg-fuchsia-500" />
        <div className="w-5 h-8 rounded-t bg-fuchsia-200 dark:bg-fuchsia-700" />
      </div>
    ),
  },
};

interface VisualSceneProps {
  category: Category;
}

export default function VisualScene({ category }: VisualSceneProps) {
  const scene = categoryScenes[category];

  return (
    <div className={`w-full h-32 rounded-b-2xl overflow-hidden ${scene.bg} transition-colors`}>
      <div className="w-full h-full relative">{scene.elements}</div>
    </div>
  );
}
