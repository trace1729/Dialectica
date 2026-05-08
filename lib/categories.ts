import type { Category, Difficulty, Topic } from "./types";

export const TOPICS: { id: Topic; label: string; emoji: string }[] = [
  { id: "daily", label: "对话练习", emoji: "💬" },
  { id: "philosophy", label: "哲思", emoji: "🗣️" },
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
  { id: "alan_turing", label: "艾伦·图灵", emoji: "💻" },
  { id: "grace_hopper", label: "格蕾丝·赫柏", emoji: "🐛" },
  { id: "von_neumann", label: "冯·诺依曼", emoji: "🧮" },
  { id: "tim_berners_lee", label: "蒂姆·伯纳斯-李", emoji: "🌐" },
  { id: "donald_knuth", label: "高德纳", emoji: "📖" },
  { id: "edsger_dijkstra", label: "艾兹格·迪杰斯特拉", emoji: "📐" },
  { id: "marvin_minsky", label: "马文·明斯基", emoji: "🧠" },
  { id: "linus_torvalds", label: "林纳斯·托瓦兹", emoji: "🐧" },
  { id: "guido_van_rossum", label: "吉多·范罗苏姆", emoji: "🐍" },
  { id: "geoffrey_hinton", label: "杰弗里·辛顿", emoji: "🔮" },
  { id: "yann_lecun", label: "杨立昆", emoji: "👁️" },
  { id: "sam_altman", label: "山姆·奥特曼", emoji: "🚀" },
  { id: "dario_amodei", label: "达里奥·阿莫迪", emoji: "⚛️" },
  { id: "yuval_harari", label: "尤瓦尔·赫拉利", emoji: "📚" },
  { id: "claude_shannon", label: "克劳德·香农", emoji: "📡" },
  { id: "richard_feynman", label: "理查德·费曼", emoji: "🔬" },
  { id: "ada_lovelace", label: "阿达·洛芙莱斯", emoji: "👩‍💻" },
  { id: "dennis_ritchie", label: "丹尼斯·里奇", emoji: "⚙️" },
  { id: "ken_thompson", label: "肯·汤普森", emoji: "🖥️" },
  { id: "ilya_sutskever", label: "伊利亚·苏茨克维", emoji: "🤖" },
  { id: "andrew_ng", label: "吴恩达", emoji: "🎓" },
  { id: "fei_fei_li", label: "李飞飞", emoji: "🖼️" },
  { id: "stephen_hawking", label: "斯蒂芬·霍金", emoji: "🌌" },
  { id: "vint_cerf", label: "温顿·瑟夫", emoji: "📧" },
  { id: "margaret_hamilton", label: "玛格丽特·汉密尔顿", emoji: "🚀" },
];

export const POLITICIANS = [
  { id: "random", label: "随机选择", emoji: "🎲" },
  { id: "alexander", label: "亚历山大大帝", emoji: "⚔️" },
  { id: "caesar", label: "凯撒", emoji: "🏛️" },
  { id: "augustus", label: "奥古斯都", emoji: "👑" },
  { id: "qin_shihuang", label: "秦始皇", emoji: "🐲" },
  { id: "han_wudi", label: "汉武帝", emoji: "🏹" },
  { id: "cao_cao", label: "曹操", emoji: "📜" },
  { id: "charlemagne", label: "查理曼大帝", emoji: "🛡️" },
  { id: "genghis_khan", label: "成吉思汗", emoji: "🏇" },
  { id: "elizabeth_i", label: "伊丽莎白一世", emoji: "👸" },
  { id: "louis_xiv", label: "路易十四", emoji: "☀️" },
  { id: "peter_great", label: "彼得大帝", emoji: "🚢" },
  { id: "frederick_great", label: "腓特烈大帝", emoji: "🎵" },
  { id: "george_washington", label: "乔治·华盛顿", emoji: "🎖️" },
  { id: "napoleon", label: "拿破仑", emoji: "🎩" },
  { id: "bismarck", label: "俾斯麦", emoji: "🦾" },
  { id: "lincoln", label: "林肯", emoji: "🎙️" },
  { id: "victoria", label: "维多利亚女王", emoji: "💎" },
  { id: "sun_yatsen", label: "孙中山", emoji: "🌍" },
  { id: "lenin", label: "列宁", emoji: "✊" },
  { id: "churchill", label: "丘吉尔", emoji: "🎗️" },
  { id: "roosevelt", label: "罗斯福", emoji: "🔥" },
  { id: "mao_zedong", label: "毛泽东", emoji: "⭐" },
  { id: "de_gaulle", label: "戴高乐", emoji: "🇫🇷" },
  { id: "gandhi", label: "甘地", emoji: "🕊️" },
  { id: "mandela", label: "曼德拉", emoji: "🌅" },
  { id: "deng_xiaoping", label: "邓小平", emoji: "🐱" },
  { id: "thatcher", label: "撒切尔夫人", emoji: "👜" },
  { id: "kennedy", label: "肯尼迪", emoji: "🎯" },
  { id: "gorbachev", label: "戈尔巴乔夫", emoji: "🕊️" },
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

export const SCIENCE_FIELDS = [
  { id: "random", label: "随机选择", emoji: "🎲" },
  { id: "ai", label: "人工智能", emoji: "🤖" },
  { id: "quantum", label: "量子计算", emoji: "⚛️" },
  { id: "neuroscience", label: "神经科学", emoji: "🧠" },
  { id: "cs_theory", label: "计算理论", emoji: "🧮" },
  { id: "software", label: "软件工程", emoji: "💻" },
  { id: "crypto", label: "密码学与安全", emoji: "🔐" },
  { id: "robotics", label: "机器人学", emoji: "🦾" },
  { id: "biotech", label: "生物技术", emoji: "🧬" },
  { id: "physics", label: "理论物理", emoji: "🔬" },
  { id: "math", label: "数学", emoji: "📐" },
  { id: "climate", label: "气候科学", emoji: "🌍" },
  { id: "space", label: "太空探索", emoji: "🚀" },
];

export const POLITICS_FIELDS = [
  { id: "random", label: "随机选择", emoji: "🎲" },
  { id: "democracy", label: "民主制度", emoji: "🗳️" },
  { id: "authoritarianism", label: "威权与专制", emoji: "🏰" },
  { id: "revolution", label: "革命与改革", emoji: "🔥" },
  { id: "diplomacy", label: "外交与战争", emoji: "🕊️" },
  { id: "economics", label: "经济政策", emoji: "💰" },
  { id: "ideology", label: "意识形态", emoji: "📜" },
  { id: "governance", label: "治理与法治", emoji: "⚖️" },
  { id: "nationalism", label: "民族主义", emoji: "🏴" },
  { id: "globalization", label: "全球化", emoji: "🌐" },
  { id: "civil_rights", label: "民权与社会运动", emoji: "✊" },
  { id: "cold_war", label: "冷战思维", emoji: "❄️" },
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

export function getScienceFieldLabel(id: string): string {
  return SCIENCE_FIELDS.find((f) => f.id === id)?.label ?? id;
}

export function getRandomScienceField(): string {
  const nonRandom = SCIENCE_FIELDS.filter((f) => f.id !== "random");
  return nonRandom[Math.floor(Math.random() * nonRandom.length)].id;
}

export function getPoliticsFieldLabel(id: string): string {
  return POLITICS_FIELDS.find((f) => f.id === id)?.label ?? id;
}

export function getRandomPoliticsField(): string {
  const nonRandom = POLITICS_FIELDS.filter((f) => f.id !== "random");
  return nonRandom[Math.floor(Math.random() * nonRandom.length)].id;
}

export function getScientistLabel(id: string): string {
  return SCIENTISTS.find((p) => p.id === id)?.label ?? id;
}

export function getRandomScientist(): string {
  const nonRandom = SCIENTISTS.filter((p) => p.id !== "random");
  return nonRandom[Math.floor(Math.random() * nonRandom.length)].id;
}

export function getPoliticianLabel(id: string): string {
  return POLITICIANS.find((p) => p.id === id)?.label ?? id;
}

export function getRandomPolitician(): string {
  const nonRandom = POLITICIANS.filter((p) => p.id !== "random");
  return nonRandom[Math.floor(Math.random() * nonRandom.length)].id;
}

export function getCategoriesByTopic(topic: Topic): { id: Category; label: string; emoji: string }[] {
  return CATEGORIES.filter((c) => c.topic === topic);
}
