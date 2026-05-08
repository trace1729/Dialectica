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
