import type { Category, Difficulty, Topic } from "./types";

export const TOPICS: { id: Topic; label: string; emoji: string }[] = [
  { id: "daily", label: "对话练习", emoji: "💬" },
  { id: "philosophy", label: "哲学话题", emoji: "🧠" },
  { id: "tech", label: "技术话题", emoji: "💻" },
];

export const CATEGORIES: { id: Category; label: string; emoji: string; topic: Topic }[] = [
  { id: "small_talk", label: "闲聊寒暄", emoji: "💬", topic: "daily" },
  { id: "ordering_food", label: "点餐购物", emoji: "🍽️", topic: "daily" },
  { id: "workplace", label: "职场沟通", emoji: "💼", topic: "daily" },
  { id: "social_event", label: "社交场合", emoji: "🎉", topic: "daily" },
  { id: "phone_call", label: "电话沟通", emoji: "📞", topic: "daily" },
  { id: "conflict_resolution", label: "化解矛盾", emoji: "🤝", topic: "daily" },
  { id: "philosophy", label: "哲学对话", emoji: "🧠", topic: "philosophy" },
  { id: "computer_architecture", label: "计算机体系结构", emoji: "🖥️", topic: "tech" },
  { id: "parallel_programming", label: "并行编程", emoji: "⚡", topic: "tech" },
  { id: "llm", label: "大模型", emoji: "🤖", topic: "tech" },
];

export const DIFFICULTIES: { id: Difficulty; label: string; color: string }[] = [
  { id: "easy", label: "简单", color: "bg-green-500" },
  { id: "medium", label: "中等", color: "bg-yellow-500" },
  { id: "hard", label: "困难", color: "bg-red-500" },
];

export const PHILOSOPHERS = [
  { id: "random", label: "随机选择", emoji: "🎲" },
  { id: "bacon", label: "弗朗西斯·培根", emoji: "🔬" },
  { id: "nietzsche", label: "尼采", emoji: "⚡" },
  { id: "locke", label: "洛克", emoji: "📜" },
  { id: "machiavelli", label: "马基雅维利", emoji: "🦊" },
  { id: "kant", label: "康德", emoji: "☁️" },
  { id: "descartes", label: "笛卡尔", emoji: "💭" },
  { id: "marx", label: "马克思", emoji: "✊" },
  { id: "hegel", label: "黑格尔", emoji: "🔺" },
  { id: "plato", label: "柏拉图", emoji: "🏛️" },
  { id: "aristotle", label: "亚里士多德", emoji: "📚" },
  { id: "sartre", label: "萨特", emoji: "☕" },
  { id: "zhuangzi", label: "庄子", emoji: "🦋" },
  { id: "rousseau", label: "卢梭", emoji: "🌿" },
  { id: "keynes", label: "凯恩斯", emoji: "📊" },
  { id: "hayek", label: "哈耶克", emoji: "🔗" },
  { id: "friedman", label: "弗里德曼", emoji: "💰" },
  { id: "fukuyama", label: "福山", emoji: "🏁" },
  { id: "tocqueville", label: "托克维尔", emoji: "🗽" },
  { id: "hobbes", label: "霍布斯", emoji: "🐺" },
  { id: "Sigmund Freud", label: "弗洛伊德", emoji: "😀" },
];

export const SCIENTISTS = [
  { id: "random", label: "随机选择", emoji: "🎲" },
  { id: "alan_turing", label: "Alan Turing", emoji: "💻" },
  { id: "grace_hopper", label: "Grace Hopper", emoji: "🐛" },
  { id: "von_neumann", label: "John von Neumann", emoji: "🧮" },
  { id: "tim_berners_lee", label: "Tim Berners-Lee", emoji: "🌐" },
  { id: "donald_knuth", label: "Donald Knuth", emoji: "📖" },
  { id: "edsger_dijkstra", label: "Edsger Dijkstra", emoji: "📐" },
  { id: "marvin_minsky", label: "Marvin Minsky", emoji: "🧠" },
  { id: "linus_torvalds", label: "Linus Torvalds", emoji: "🐧" },
  { id: "guido_van_rossum", label: "Guido van Rossum", emoji: "🐍" },
  { id: "geoffrey_hinton", label: "Geoffrey Hinton", emoji: "🔮" },
  { id: "yann_lecun", label: "Yann LeCun", emoji: "👁️" },
  { id: "sam_altman", label: "Sam Altman", emoji: "🚀" },
  { id: "dario_amodei", label: "Dario Amodei", emoji: "⚛️" },
  { id: "yuval_harari", label: "Yuval Noah Harari", emoji: "📚" },
  { id: "claude_shannon", label: "Claude Shannon", emoji: "📡" },
  { id: "richard_feynman", label: "Richard Feynman", emoji: "🔬" },
  { id: "ada_lovelace", label: "Ada Lovelace", emoji: "👩‍💻" },
  { id: "dennis_ritchie", label: "Dennis Ritchie", emoji: "⚙️" },
  { id: "ken_thompson", label: "Ken Thompson", emoji: "🖥️" },
  { id: "ilya_sutskever", label: "Ilya Sutskever", emoji: "🤖" },
  { id: "andrew_ng", label: "Andrew Ng", emoji: "🎓" },
  { id: "fei_fei_li", label: "Fei-Fei Li", emoji: "🖼️" },
  { id: "stephen_hawking", label: "Stephen Hawking", emoji: "🌌" },
  { id: "vint_cerf", label: "Vint Cerf", emoji: "📧" },
  { id: "margaret_hamilton", label: "Margaret Hamilton", emoji: "🚀" },
];

export const PHILOSOPHY_FIELDS = [
  { id: "random", label: "随机选择", emoji: "🎲" },
  { id: "tech_philosophy", label: "技术哲学", emoji: "⚙️" },
  { id: "ontology", label: "本体论", emoji: "🌌" },
  { id: "analytic", label: "分析哲学", emoji: "🔍" },
  { id: "political", label: "政治哲学", emoji: "🏛️" },
  { id: "ethics", label: "伦理学", emoji: "⚖️" },
  { id: "logic", label: "逻辑学", emoji: "🧮" },
  { id: "aesthetics", label: "美学", emoji: "🎨" },
];

export function getCategoryLabel(id: Category): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function getDifficultyLabel(id: Difficulty): string {
  return DIFFICULTIES.find((d) => d.id === id)?.label ?? id;
}

export function getPhilosopherLabel(id: string): string {
  return PHILOSOPHERS.find((p) => p.id === id)?.label ?? id;
}

export function getRandomPhilosopher(): string {
  const nonRandom = PHILOSOPHERS.filter((p) => p.id !== "random");
  return nonRandom[Math.floor(Math.random() * nonRandom.length)].id;
}

export function getFieldLabel(id: string): string {
  return PHILOSOPHY_FIELDS.find((f) => f.id === id)?.label ?? id;
}

export function getRandomField(): string {
  const nonRandom = PHILOSOPHY_FIELDS.filter((f) => f.id !== "random");
  return nonRandom[Math.floor(Math.random() * nonRandom.length)].id;
}

export function getScientistLabel(id: string): string {
  return SCIENTISTS.find((p) => p.id === id)?.label ?? id;
}

export function getRandomScientist(): string {
  const nonRandom = SCIENTISTS.filter((p) => p.id !== "random");
  return nonRandom[Math.floor(Math.random() * nonRandom.length)].id;
}

export function getCategoriesByTopic(topic: Topic): { id: Category; label: string; emoji: string }[] {
  return CATEGORIES.filter((c) => c.topic === topic);
}
