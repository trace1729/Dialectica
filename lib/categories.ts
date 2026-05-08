import type { Category, Difficulty } from "./types";

export const CATEGORIES: { id: Category; label: string; emoji: string }[] = [
  { id: "small_talk", label: "闲聊寒暄", emoji: "💬" },
  { id: "ordering_food", label: "点餐购物", emoji: "🍽️" },
  { id: "workplace", label: "职场沟通", emoji: "💼" },
  { id: "social_event", label: "社交场合", emoji: "🎉" },
  { id: "phone_call", label: "电话沟通", emoji: "📞" },
  { id: "conflict_resolution", label: "化解矛盾", emoji: "🤝" },
];

export const DIFFICULTIES: { id: Difficulty; label: string; color: string }[] = [
  { id: "easy", label: "简单", color: "bg-green-500" },
  { id: "medium", label: "中等", color: "bg-yellow-500" },
  { id: "hard", label: "困难", color: "bg-red-500" },
];

export function getCategoryLabel(id: Category): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function getDifficultyLabel(id: Difficulty): string {
  return DIFFICULTIES.find((d) => d.id === id)?.label ?? id;
}
