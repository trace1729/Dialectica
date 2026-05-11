import type { Category, Difficulty, Message } from "./types";
import { getCategoryLabel, getDifficultyLabel } from "./categories";

const BASE_SCENE_REQ = `返回一个 JSON 对象，包含：
- scene: 生动描述当前情境（2-3句话）。使用第二人称（"你正站在..."）。
- npc: { name, role, tone }，描述你面对的人物。
- opening: NPC 开场的第一句话。
- visual: 场景画面简述（简短几个词）。

只输出有效 JSON，不要其他文字。`;

const SEMINAR_SCENE_NOTE = `
研讨模式已开启。采用正式学术风格：将场景设在正式场合（讲堂、研讨会、书房对谈等），NPC 以正式身份和学术背景自我介绍，使用严谨得体的语言，避免日常寒暄的随意语气。`;

const BASE_RESPOND_RULES = `规则：
- 以 NPC 身份自然回复（1-3句话）。
- 真实反应，展现情感和个性。
- 不要跳出角色或给元评论。不要突然结束对话。

输出格式（严格遵守）：
必须返回一个合法 JSON 对象，字段 npcResponse 为对话内容，npcMood 为情绪标签。
不要输出 JSON 以外的任何文字，不要用代码块包裹，不要加注释。
示例：{"npcResponse":"是啊，这天气真让人措手不及。","npcMood":"感慨"}`;

const RESPOND_STYLES = [
  "简短犀利：一句话直接回应，语气干脆。",
  "温暖关怀：回复中加入同理心或关心细节。",
  "幽默调侃：用轻松幽默的方式回应，可以开个小玩笑。",
  "反问引导：先反问用户以确认信息或推动对话。",
  "分享趣事：在回复中顺带分享一件相关的小事。",
  "情绪外露：展现明显的情绪反应（惊喜、无奈、高兴等）。",
  "拖延犹豫：回复时表现出迟疑或不完全确定。",
];

const SEMINAR_RESPOND_RULES = `
研讨模式：使用正式学术语言，严谨得体。可引用相关概念和理论。保持学术讨论的深度和礼仪，但必须契合说话者的个性和思想特点。避免随意口语和日常寒暄。`;

function randomRespondStyle(): string {
  return RESPOND_STYLES[Math.floor(Math.random() * RESPOND_STYLES.length)];
}

const BASE_FEEDBACK_RULES = `你是一位友善的对话教练。评估用户发言（忽略 NPC 台词），从恰当性、用词礼貌、语气情商、对话流畅度评判。
返回 JSON：{ score(1-10整数), strengths[2-3条], improvements[2-3条], xpEarned(基础简单=20/中等=40/困难=60, 乘以 score/10 取整) }。只输出 JSON。`;

// ─── Category-specific scenario prompts ───

function smallTalkScenario(difficulty: Difficulty, customTopic?: string, seminarMode?: boolean): string {
  const d = getDifficultyLabel(difficulty);
  return `你为对话练习生成场景。类别：闲聊寒暄，难度：${d}。

日常寒暄场景：和邻居、同事、熟人在电梯/楼道/茶水间偶遇，打招呼，聊天气、周末、最近情况。${customTopic ? `\n自定义主题：围绕「${customTopic}」来设计场景和对话内容。` : ""}
${
  difficulty === "easy"
    ? "简单直接，2-3轮即可。"
    : difficulty === "medium"
      ? "4-6轮，略带社交细节。"
      : "7轮以上，可能涉及微妙话题或尴尬沉默。"
}${seminarMode ? SEMINAR_SCENE_NOTE : ""}

${BASE_SCENE_REQ}`;
}

function orderingFoodScenario(difficulty: Difficulty, customTopic?: string, seminarMode?: boolean): string {
  const d = getDifficultyLabel(difficulty);
  return `你为对话练习生成场景。类别：点餐购物，难度：${d}。

场景：餐厅点菜、外卖沟通、商场购物、询问商品信息、退换货等。${customTopic ? `\n自定义主题：围绕「${customTopic}」来设计场景和对话内容。` : ""}
${
  difficulty === "easy"
    ? "简单点餐，无障碍。2-3轮。"
    : difficulty === "medium"
      ? "菜单不熟、口味特殊要求。4-6轮。"
      : "上错菜、算错账、食材过敏等复杂情况。7轮以上。"
}${seminarMode ? SEMINAR_SCENE_NOTE : ""}

${BASE_SCENE_REQ}`;
}

function workplaceScenario(difficulty: Difficulty, customTopic?: string, seminarMode?: boolean): string {
  const d = getDifficultyLabel(difficulty);
  return `你为对话练习生成场景。类别：职场沟通，难度：${d}。

场景：向领导汇报、和同事协作、跨部门协调、面试、绩效谈话等。${customTopic ? `\n自定义主题：围绕「${customTopic}」来设计场景和对话内容。` : ""}
${
  difficulty === "easy"
    ? "简单汇报或请求。2-3轮。"
    : difficulty === "medium"
      ? "意见分歧、催促进度。4-6轮。"
      : "绩效考核、辞职谈判、办公室冲突。7轮以上。"
}${seminarMode ? SEMINAR_SCENE_NOTE : ""}

${BASE_SCENE_REQ}`;
}

function socialEventScenario(difficulty: Difficulty, customTopic?: string, seminarMode?: boolean): string {
  const d = getDifficultyLabel(difficulty);
  return `你为对话练习生成场景。类别：社交场合，难度：${d}。

场景：聚会结识新朋友、婚礼/宴会交流、公司团建、家长会等社交活动。${customTopic ? `\n自定义主题：围绕「${customTopic}」来设计场景和对话内容。` : ""}
${
  difficulty === "easy"
    ? "轻松自我介绍。2-3轮。"
    : difficulty === "medium"
      ? "融入已有小团体、找话题。4-6轮。"
      : "应对尴尬问题、文化差异、多人同时交谈。7轮以上。"
}${seminarMode ? SEMINAR_SCENE_NOTE : ""}

${BASE_SCENE_REQ}`;
}

function phoneCallScenario(difficulty: Difficulty, customTopic?: string, seminarMode?: boolean): string {
  const d = getDifficultyLabel(difficulty);
  return `你为对话练习生成场景。类别：电话沟通，难度：${d}。

场景：订座/预约电话、客服投诉、电话面试、紧急通知、联系陌生人等。${customTopic ? `\n自定义主题：围绕「${customTopic}」来设计场景和对话内容。` : ""}
${
  difficulty === "easy"
    ? "简单预约或查询。2-3轮。"
    : difficulty === "medium"
      ? "改期取消、信息确认、转接沟通。4-6轮。"
      : "投诉处理、紧急情况、信号不清楚等挑战。7轮以上。"
}${seminarMode ? SEMINAR_SCENE_NOTE : ""}

注意场景中只有电话声音交流，没有视觉线索。

${BASE_SCENE_REQ}`;
}

function conflictResolutionScenario(difficulty: Difficulty, customTopic?: string, seminarMode?: boolean): string {
  const d = getDifficultyLabel(difficulty);
  return `你为对话练习生成场景。类别：化解矛盾，难度：${d}。

场景：邻里纠纷、服务不满、同事争执、朋友误会、家人矛盾等需要化解冲突的情境。${customTopic ? `\n自定义主题：围绕「${customTopic}」来设计场景和对话内容。` : ""}
${
  difficulty === "easy"
    ? "轻微不满，容易和解。2-3轮。"
    : difficulty === "medium"
      ? "情绪激动但可控。4-6轮。"
      : "情绪激烈、立场对立、需要高情商化解。7轮以上。"
}${seminarMode ? SEMINAR_SCENE_NOTE : ""}

${BASE_SCENE_REQ}`;
}

function philosophyScenario(difficulty: Difficulty, philosopherId: string, philosopherLabel: string, customTopic?: string, seminarMode?: boolean): string {
  const d = getDifficultyLabel(difficulty);
  return `你为对话练习生成场景。类别：哲学思考，交流对象：${philosopherLabel}，难度：${d}。

设置一个适合与这位哲学家/哲学流派进行思想交流的场景。场景要自然——比如书房对话、散步聊天、咖啡馆讨论等。${customTopic ? `\n自定义讨论方向：围绕「${customTopic}」来设计交流的核心话题。` : ""}${seminarMode ? SEMINAR_SCENE_NOTE : ""}

NPC 必须扮演${philosopherLabel}的思想风格和语气：
- 用该哲学家的典型表达方式和口吻
- 展现其核心思想和看问题的角度
- 引导用户深入思考，像苏格拉底一样提问
${
  difficulty === "easy"
    ? "用通俗易懂的方式讨论，2-3轮。"
    : difficulty === "medium"
      ? "适当深入核心概念，4-6轮。"
      : "深入哲学思辨，挑战用户的逻辑和见解，7轮以上。"
}

返回 JSON 对象时：
- scene: 包含与${philosopherLabel}相遇的场景描述。
- npc.name: 哲学家名字，npc.role: 对应身份描述，npc.tone: 思想风格特征。
- opening: 哲学家式的开场提问或陈述。
- visual: 场景氛围简述。

只输出有效 JSON，不要其他文字。`;
}

// ─── Tech scenario prompts ───

// Generic tech scenario prompt for all tech categories
function techScenario(difficulty: Difficulty, category: Category, scientistLabel?: string, customTopic?: string, seminarMode?: boolean): string {
  const catLabel = getCategoryLabel(category);
  const d = getDifficultyLabel(difficulty);
  const isCustom = !!customTopic;
  const scientistNote = scientistLabel
    ? `\nNPC 必须以 ${scientistLabel} 的身份和口吻进行对话，展现其独特的技术视角和思维风格。`
    : "";
  const difficultyNote = isCustom
    ? `\n自定义主题模式：忽略难度级别，以清晰透彻的方式回答问题。用通俗的语言解释复杂概念。如果用户要求详细阐述，可以提供长回复。`
    : (difficulty === "easy"
      ? "基础概念讨论，2-3轮。用通俗的语言解释核心概念。"
      : difficulty === "medium"
        ? "深入技术细节和设计权衡，4-6轮。"
        : "前沿话题和深度技术讨论，7轮以上。挑战用户的深度理解。");

  return `你为对话练习生成场景。类别：${catLabel}，难度：${d}。${scientistNote}${customTopic ? `\n自定义主题：围绕「${customTopic}」来设计对话的核心话题。` : ""}${seminarMode ? SEMINAR_SCENE_NOTE : ""}

设置一个适合技术对话的场景（如实验室讨论、技术分享会、线上会议等）。
NPC 是该领域的专家，既要准确严谨，又要善于将复杂概念讲清楚。${difficultyNote}

返回 JSON 对象时：
- scene: 场景描述。
- npc.name:${scientistLabel ? ` ${scientistLabel}` : " 专家名字"}，npc.role: 对应身份描述，npc.tone: 风格特征。
- opening: 专家的开场发言。
- visual: 场景氛围简述。

只输出有效 JSON，不要其他文字。`;
}

// Generic tech respond prompt
function techRespond(category: Category, scenario: { scene: string; npc: { name: string; role: string; tone: string } }, history: Message[], seminarMode?: boolean): string {
  const hist = historyText(history);
  const catLabel = getCategoryLabel(category);
  return `你是${catLabel}领域的专家 NPC。场景：${scenario.scene}。你是${scenario.npc.name}，${scenario.npc.role}，语气${scenario.npc.tone}。

- 回答要准确、技术性，用通俗的语言解释复杂概念
- 可以引导用户思考技术权衡和设计方案
- 用具体例子或类比帮助理解抽象概念

对话记录：${hist}\n本轮风格：${randomRespondStyle()}${seminarMode ? "\n" + SEMINAR_RESPOND_RULES : ""}

${BASE_RESPOND_RULES}`;
}

// Generic tech feedback prompt
function techFeedback(category: Category, difficulty: Difficulty, transcript: Message[]): string {
  const t = transcriptText(transcript);
  const catLabel = getCategoryLabel(category);
  return `分析本次${catLabel}技术对话练习。用户是否展现了技术理解能力、提出有深度的问题？
${categoryContext(category, difficulty)}
对话记录：${t}\n${BASE_FEEDBACK_RULES}`;
}

// ─── Category-specific respond prompts ───

function smallTalkRespond(scenario: { scene: string; npc: { name: string; role: string; tone: string } }, history: Message[], seminarMode?: boolean): string {
  const hist = historyText(history);
  return `你是闲聊练习中的 NPC。场景：${scenario.scene}。你是${scenario.npc.name}，${scenario.npc.role}，语气${scenario.npc.tone}。

对话记录：${hist}

本轮风格：${randomRespondStyle()}${seminarMode ? "\n" + SEMINAR_RESPOND_RULES : ""}

${BASE_RESPOND_RULES}`;
}

function orderingFoodRespond(scenario: { scene: string; npc: { name: string; role: string; tone: string } }, history: Message[], seminarMode?: boolean): string {
  const hist = historyText(history);
  return `你是点餐/购物场景中的 NPC。场景：${scenario.scene}。你是${scenario.npc.name}，${scenario.npc.role}，语气${scenario.npc.tone}。

记住你是服务方，要处理用户的点单、询问或投诉。

对话记录：${hist}

本轮风格：${randomRespondStyle()}${seminarMode ? "\n" + SEMINAR_RESPOND_RULES : ""}

${BASE_RESPOND_RULES}`;
}

function workplaceRespond(scenario: { scene: string; npc: { name: string; role: string; tone: string } }, history: Message[], seminarMode?: boolean): string {
  const hist = historyText(history);
  return `你是职场场景中的 NPC。场景：${scenario.scene}。你是${scenario.npc.name}，${scenario.npc.role}，语气${scenario.npc.tone}。

保持职场专业度，使用恰当的工作用语。根据角色身份（上司/同事/客户）调整语气和态度。

对话记录：${hist}

本轮风格：${randomRespondStyle()}${seminarMode ? "\n" + SEMINAR_RESPOND_RULES : ""}

${BASE_RESPOND_RULES}`;
}

function socialEventRespond(scenario: { scene: string; npc: { name: string; role: string; tone: string } }, history: Message[], seminarMode?: boolean): string {
  const hist = historyText(history);
  return `你是社交场合中的 NPC。场景：${scenario.scene}。你是${scenario.npc.name}，${scenario.npc.role}，语气${scenario.npc.tone}。

对话应自然轻松，像真实社交互动。可以分享趣事、提问、偶尔幽默。

对话记录：${hist}

本轮风格：${randomRespondStyle()}${seminarMode ? "\n" + SEMINAR_RESPOND_RULES : ""}

${BASE_RESPOND_RULES}`;
}

function phoneCallRespond(scenario: { scene: string; npc: { name: string; role: string; tone: string } }, history: Message[], seminarMode?: boolean): string {
  const hist = historyText(history);
  return `你是电话沟通中的 NPC。场景：${scenario.scene}。你是${scenario.npc.name}，${scenario.npc.role}，语气${scenario.npc.tone}。

重要：这是电话对话，没有视觉线索。说话要清晰，上下文需要靠语言传达。

对话记录：${hist}

本轮风格：${randomRespondStyle()}${seminarMode ? "\n" + SEMINAR_RESPOND_RULES : ""}

${BASE_RESPOND_RULES}`;
}

function conflictResolutionRespond(scenario: { scene: string; npc: { name: string; role: string; tone: string } }, history: Message[], seminarMode?: boolean): string {
  const hist = historyText(history);
  return `你是矛盾场景中的 NPC。场景：${scenario.scene}。你是${scenario.npc.name}，${scenario.npc.role}，语气${scenario.npc.tone}。

你对当前状况有不满或意见。情绪随着对话进展而波动（可愤怒、可不悦、可逐渐缓和），
但给用户化解冲突的空间——态度随用户表现而变化。

对话记录：${hist}

本轮风格：${randomRespondStyle()}${seminarMode ? "\n" + SEMINAR_RESPOND_RULES : ""}

${BASE_RESPOND_RULES}`;
}

function philosophyRespond(scenario: { scene: string; npc: { name: string; role: string; tone: string } }, history: Message[], seminarMode?: boolean): string {
  const hist = historyText(history);
  return `你正在扮演一位哲学家与用户进行思想交流。场景：${scenario.scene}。你是${scenario.npc.name}，${scenario.npc.role}，思想风格：${scenario.npc.tone}。

- 用哲学家式的语言和思维方式回复
- 既要阐述观点，也要向用户提问以激发思考
- 保持对话深度但不失生动
- 可以引用哲学概念但不要长篇大论

对话记录：${hist}

本轮风格：${randomRespondStyle()}${seminarMode ? "\n" + SEMINAR_RESPOND_RULES : ""}

${BASE_RESPOND_RULES}`;
}

// ─── Tech respond prompts ───

// ─── Category-specific feedback prompts ───

function smallTalkFeedback(category: Category, difficulty: Difficulty, transcript: Message[]): string {
  const t = transcriptText(transcript);
  return `分析本次闲聊寒暄练习。用户是否成功完成自然友好的社交寒暄？
${categoryContext(category, difficulty)}
对话记录：${t}\n${BASE_FEEDBACK_RULES}`;
}

function orderingFoodFeedback(category: Category, difficulty: Difficulty, transcript: Message[]): string {
  const t = transcriptText(transcript);
  return `分析本次点餐购物练习。用户是否清晰表达需求、礼貌沟通？
${categoryContext(category, difficulty)}
对话记录：${t}\n${BASE_FEEDBACK_RULES}`;
}

function workplaceFeedback(category: Category, difficulty: Difficulty, transcript: Message[]): string {
  const t = transcriptText(transcript);
  return `分析本次职场沟通练习。用户是否专业得体、逻辑清晰？
${categoryContext(category, difficulty)}
对话记录：${t}\n${BASE_FEEDBACK_RULES}`;
}

function socialEventFeedback(category: Category, difficulty: Difficulty, transcript: Message[]): string {
  const t = transcriptText(transcript);
  return `分析本次社交场合练习。用户是否自然大方、善于倾听和回应？
${categoryContext(category, difficulty)}
对话记录：${t}\n${BASE_FEEDBACK_RULES}`;
}

function phoneCallFeedback(category: Category, difficulty: Difficulty, transcript: Message[]): string {
  const t = transcriptText(transcript);
  return `分析本次电话沟通练习。用户是否表达清晰、确认关键信息？
${categoryContext(category, difficulty)}
对话记录：${t}\n${BASE_FEEDBACK_RULES}`;
}

function conflictResolutionFeedback(category: Category, difficulty: Difficulty, transcript: Message[]): string {
  const t = transcriptText(transcript);
  return `分析本次化解矛盾练习。用户是否展现同理心、有效化解负面情绪、找到解决方案？
${categoryContext(category, difficulty)}
对话记录：${t}\n${BASE_FEEDBACK_RULES}`;
}

function philosophyFeedback(category: Category, difficulty: Difficulty, transcript: Message[]): string {
  const t = transcriptText(transcript);
  return `分析本次哲学对话练习。用户是否深入思考、提出有见地的观点、跟上哲学讨论的节奏？
${categoryContext(category, difficulty)}
对话记录：${t}\n${BASE_FEEDBACK_RULES}`;
}

function historyText(history: Message[]): string {
  return history.map((m) => `${m.role === "user" ? "用户" : "NPC"}: ${m.text}`).join("\n");
}

function transcriptText(transcript: Message[]): string {
  return transcript.map((m) => `${m.role === "user" ? "用户" : "NPC"}: ${m.text}`).join("\n");
}

function categoryContext(category: Category, difficulty: Difficulty): string {
  return `类别：${getCategoryLabel(category)}，难度：${getDifficultyLabel(difficulty)}。`;
}

// ─── Public API ───

export function scenarioPrompt(
  category: Category,
  difficulty: Difficulty,
  philosopher?: string,
  philosopherLabel?: string,
  customTopic?: string,
  seminarMode?: boolean
): string {
  switch (category) {
    case "small_talk":        return smallTalkScenario(difficulty, customTopic, seminarMode);
    case "ordering_food":     return orderingFoodScenario(difficulty, customTopic, seminarMode);
    case "workplace":         return workplaceScenario(difficulty, customTopic, seminarMode);
    case "social_event":      return socialEventScenario(difficulty, customTopic, seminarMode);
    case "phone_call":        return phoneCallScenario(difficulty, customTopic, seminarMode);
    case "conflict_resolution": return conflictResolutionScenario(difficulty, customTopic, seminarMode);
    case "philosophy":        return philosophyScenario(difficulty, philosopher ?? "", philosopherLabel ?? "", customTopic, seminarMode);
    case "computer_architecture":
    case "parallel_programming":
    case "llm":
    case "ai_ml":
    case "quantum":
    case "cs_theory":
    case "software_engineering":
    case "crypto_security":
    case "networks":
    case "robotics":
    case "systems":
    case "data_science":
    case "data_structures_algorithms":
      return techScenario(difficulty, category, philosopherLabel, customTopic, seminarMode);
    default:                  return smallTalkScenario(difficulty, customTopic, seminarMode);
  }
}

export function respondPrompt(
  category: Category,
  scenario: { scene: string; npc: { name: string; role: string; tone: string } },
  history: Message[],
  seminarMode?: boolean
): string {
  switch (category) {
    case "small_talk":        return smallTalkRespond(scenario, history, seminarMode);
    case "ordering_food":     return orderingFoodRespond(scenario, history, seminarMode);
    case "workplace":         return workplaceRespond(scenario, history, seminarMode);
    case "social_event":      return socialEventRespond(scenario, history, seminarMode);
    case "phone_call":        return phoneCallRespond(scenario, history, seminarMode);
    case "conflict_resolution": return conflictResolutionRespond(scenario, history, seminarMode);
    case "philosophy":        return philosophyRespond(scenario, history, seminarMode);
    case "computer_architecture":
    case "parallel_programming":
    case "llm":
    case "ai_ml":
    case "quantum":
    case "cs_theory":
    case "software_engineering":
    case "crypto_security":
    case "networks":
    case "robotics":
    case "systems":
    case "data_science":
    case "data_structures_algorithms":
      return techRespond(category, scenario, history, seminarMode);
    default:                  return smallTalkRespond(scenario, history, seminarMode);
  }
}

export function feedbackPrompt(
  category: Category,
  difficulty: Difficulty,
  transcript: Message[]
): string {
  switch (category) {
    case "small_talk":        return smallTalkFeedback(category, difficulty, transcript);
    case "ordering_food":     return orderingFoodFeedback(category, difficulty, transcript);
    case "workplace":         return workplaceFeedback(category, difficulty, transcript);
    case "social_event":      return socialEventFeedback(category, difficulty, transcript);
    case "phone_call":        return phoneCallFeedback(category, difficulty, transcript);
    case "conflict_resolution": return conflictResolutionFeedback(category, difficulty, transcript);
    case "philosophy":        return philosophyFeedback(category, difficulty, transcript);
    case "computer_architecture":
    case "parallel_programming":
    case "llm":
    case "ai_ml":
    case "quantum":
    case "cs_theory":
    case "software_engineering":
    case "crypto_security":
    case "networks":
    case "robotics":
    case "systems":
    case "data_science":
    case "data_structures_algorithms":
      return techFeedback(category, difficulty, transcript);
    default:                  return smallTalkFeedback(category, difficulty, transcript);
  }
}

// ─── Playground debate prompts ───

export function debateScenarioPrompt(
  philosopherA: string,
  philosopherB: string,
  topic: string,
  maxRounds: number
): string {
  return `你正在为一场辩论生成开场场景。

辩论正方：${philosopherA}
辩论反方：${philosopherB}
辩论主题：${topic}
自由辩论轮数：${maxRounds}（此轮数仅用于中间自由辩论环节，不包含开场的立论和结束的总结）

返回 JSON：
- title: 辩论标题
- scene: 场景描述（2-3句），设定辩论发生的氛围
- philosophers: { a: { name, emoji }, b: { name, emoji } }
- opening: { speaker: "A", text: "${philosopherA}的立论发言" } — 这是辩论的立论环节，正方需清楚陈述核心立场和主要论据，3-5句话

只输出 JSON。`;
}

export type DebateSubPhase = "opening" | "freeDebate" | "closing";

export function debateRespondPrompt(
  philosopherA: string,
  philosopherB: string,
  topic: string,
  currentSpeaker: "A" | "B",
  history: { speaker: string; text: string }[],
  subPhase: DebateSubPhase
): string {
  const speaker = currentSpeaker === "A" ? philosopherA : philosopherB;
  const opponent = currentSpeaker === "A" ? philosopherB : philosopherA;

  const historyText = history
    .map((m) => `${m.speaker === "A" ? philosopherA : philosopherB}: ${m.text}`)
    .join("\n");

  if (subPhase === "opening") {
    return `你是 ${speaker}，正在与 ${opponent} 进行关于「${topic}」的辩论。当前处于【立论环节】。

辩论历史：
${historyText}

现在轮到 ${speaker} 进行立论发言。${speaker} 需要：
- 清楚陈述自己的核心立场和主要论据
- 可以简要回应对方立论中的关键点
- 3-5句话，以 ${speaker} 的口吻和核心思想发言
- 正式而有说服力，为接下来的自由辩论奠定基础

返回 JSON：{ speaker: "${currentSpeaker}", text: "发言内容", mood: "情绪" }
只输出 JSON。`;
  }

  if (subPhase === "closing") {
    return `你是 ${speaker}，正在与 ${opponent} 进行关于「${topic}」的辩论。当前处于【总结环节】。

辩论历史：
${historyText}

现在轮到 ${speaker} 进行总结陈词。${speaker} 需要：
- 总结自己在辩论中的核心论点
- 指出对方论证中的主要弱点
- 升华主题，给出有力的结论
- 3-5句话，以 ${speaker} 的口吻和核心思想发言

返回 JSON：{ speaker: "${currentSpeaker}", text: "发言内容", mood: "情绪" }
只输出 JSON。`;
  }

  // freeDebate
  const styles = [
    {
      name: "严谨论证",
      rules: `- 必须引用 ${opponent} 上一轮的具体论点，再作回应
- 使用演绎推理、归纳推理或归谬法进行论证
- 引用原著、名言或思想实验作为论据
- 结构：承认合理处 → 指出逻辑漏洞 → 提出替代论证`,
    },
    {
      name: "激情反驳",
      rules: `- 以强烈的情感和信念回应，展现思想家的热忱
- 可以使用有力的比喻、反问句、感叹来强化观点
- 不需要逐条引用对方论点，但核心回应不能偏离主题
- 风格：雄辩、有力、直击要害`,
    },
    {
      name: "苏格拉底式追问",
      rules: `- 以提问为主，用问题引导对方暴露思维漏洞
- 先假装同意对方某一点，再通过追问迫使其进入矛盾
- 不直接陈述观点，而是让对方自己意识到问题
- 风格：谦逊而犀利，以退为进`,
    },
    {
      name: "故事隐喻",
      rules: `- 用一个生动的故事、寓言或历史事件来表达观点
- 不需要直接反驳，让故事本身承载论证
- 故事可以是历史上真实发生的，也可以是思想实验
- 风格：叙事化、画面感强、意味深长`,
    },
    {
      name: "颠覆性反转",
      rules: `- 挑战辩论的前提假设本身，质疑讨论框架是否合理
- 可以完全跳出当前辩论轨道，提出一个全新的视角
- 用反常识的观点或悖论来震撼对方
- 风格：大胆、不拘一格、令人意想不到`,
    },
  ];

  const style = styles[Math.floor(Math.random() * styles.length)];

   return `你是 ${speaker}，正在与 ${opponent} 进行关于「${topic}」的辩论。当前处于【自由辩论环节】。

辩论历史：
${historyText}

现在轮到 ${speaker} 发言。本轮辩论风格：${style.name}

要求：
${style.rules}
- 2-5句话，以 ${speaker} 的口吻和核心思想发言

返回 JSON：{ speaker: "${currentSpeaker}", text: "发言内容", mood: "情绪" }
只输出 JSON。`;
}

// ─── Roundtable prompts ───

export function roundtableScenarioPrompt(
  philosophers: string[],
  topic: string,
  maxRounds: number,
  context?: { name: string; text: string }[]
): string {
  const list = philosophers.map((p, i) => `${i}: ${p}`).join("\n");

  let contextSection = "";
  if (context && context.length > 0) {
    const contextText = context.map((m) => `${m.name}: ${m.text}`).join("\n");
    contextSection = `
这是继上一轮讨论的追问环节。以下是上一轮讨论的完整记录作为上下文：
${contextText}

`;
  }

  return `你正在为一场圆桌讨论生成开场。

参与讨论的成员（共${philosophers.length}位）：
${list}

讨论主题：${topic}
自由讨论轮数：${maxRounds}（此轮数仅用于中间自由讨论环节，不包含开场的立论和结束的总结）
${contextSection}
返回 JSON：
- title: 讨论标题
- scene: 场景描述（2-3句），设定讨论发生的氛围（如：圆桌会议室、沙龙、花园等）
- opening: { philosopherIndex: 0, text: "第一位成员的立论发言" } — 这是立论环节，需清楚陈述核心观点，3-4句话
- speakerOrder: 发言顺序数组，如 [0, 1, 3, 2, 4] 等（随机排列，第一位是立论环节的首位发言人）

只输出 JSON。`;
}

export type RoundtableSubPhase = "opening" | "freeDebate" | "closing";

export function roundtableRespondPrompt(
  philosophers: string[],
  topic: string,
  currentIndex: number,
  history: { philosopherIndex: number; text: string }[],
  subPhase: RoundtableSubPhase
): string {
  const speaker = philosophers[currentIndex];
  const otherNames = philosophers.filter((_, i) => i !== currentIndex).join("、");

  const historyText = history
    .map((m) => {
      const name = philosophers[m.philosopherIndex] ?? `成员${m.philosopherIndex}`;
      return `${name}: ${m.text}`;
    })
    .join("\n");

  if (subPhase === "opening") {
    return `你正在主持一场圆桌讨论。当前处于【立论环节】，发言人：${speaker}。

讨论主题：${topic}

已有立论发言：
${historyText}

现在轮到 ${speaker} 进行立论发言。要求：
- 清楚陈述自己的核心立场和主要论点
- 3-4句话，以 ${speaker} 的口吻和核心思想发言

返回 JSON：{ philosopherIndex: ${currentIndex}, text: "发言内容", mood: "情绪" }
只输出 JSON。`;
  }

  if (subPhase === "closing") {
    return `你正在主持一场圆桌讨论。当前处于【总结环节】，发言人：${speaker}。

讨论主题：${topic}

讨论记录：
${historyText}

现在轮到 ${speaker} 进行总结陈词。要求：
- 总结自己在讨论中的核心观点
- 回顾讨论中的关键争鸣与共识
- 3-4句话，以 ${speaker} 的口吻和核心思想发言

返回 JSON：{ philosopherIndex: ${currentIndex}, text: "发言内容", mood: "情绪" }
只输出 JSON。`;
  }

  // freeDebate
  const styles = [
    { name: "深化学术观点", rules: "基于自己的理论框架，对主题提出原创性见解，引用自己的核心著作。" },
    { name: "回应他人观点", rules: `从${otherNames}中选一位的发言进行回应——可以赞同并发展，也可以反驳并提出替代论证。使用逻辑推理和事实依据。` },
    { name: "提出全新视角", rules: "跳出已有讨论框架，从一个意想不到的角度切入主题，挑战共识。" },
    { name: "综合与展望", rules: "尝试综合各方观点，找出共性或指明根本分歧所在，展望未来方向。" },
  ];
  const style = styles[Math.floor(Math.random() * styles.length)];

  return `你正在主持一场圆桌讨论。当前处于【自由讨论环节】，发言人：${speaker}。

讨论主题：${topic}

讨论记录：
${historyText}

现在轮到 ${speaker} 发言。本轮风格：${style.name}

要求：
${style.rules}
- 以 ${speaker} 的口吻和核心思想发言，2-4句话

返回 JSON：{ philosopherIndex: ${currentIndex}, text: "发言内容", mood: "情绪" }
只输出 JSON。`;
}
