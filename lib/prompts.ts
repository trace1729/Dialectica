import type { Category, Difficulty, Message } from "./types";
import { getCategoryLabel, getDifficultyLabel } from "./categories";

const BASE_SCENE_REQ = `返回一个 JSON 对象，包含：
- scene: 生动描述当前情境（2-3句话）。使用第二人称（"你正站在..."）。
- npc: { name, role, tone }，描述你面对的人物。
- opening: NPC 开场的第一句话。
- visual: 场景画面简述（简短几个词）。

只输出有效 JSON，不要其他文字。`;

const BASE_RESPOND_RULES = `规则：
- 以 NPC 身份自然回复（1-3句话），用中文。
- 真实反应，展现情感和个性。
- 不要跳出角色或给元评论。不要突然结束对话。
返回 JSON：{ npcResponse, npcMood }。只输出 JSON。`;

const BASE_FEEDBACK_RULES = `你是一位友善的中文对话教练。评估用户发言（忽略 NPC 台词），从恰当性、用词礼貌、语气情商、对话流畅度评判。
返回 JSON（中文）：{ score(1-10整数), strengths[2-3条], improvements[2-3条], xpEarned(基础简单=20/中等=40/困难=60, 乘以 score/10 取整) }。只输出 JSON。`;

// ─── Category-specific scenario prompts ───

function smallTalkScenario(difficulty: Difficulty): string {
  const d = getDifficultyLabel(difficulty);
  return `你为中文对话练习生成场景。类别：闲聊寒暄，难度：${d}。

日常寒暄场景：和邻居、同事、熟人在电梯/楼道/茶水间偶遇，打招呼，聊天气、周末、最近情况。
${
  difficulty === "easy"
    ? "简单直接，2-3轮即可。"
    : difficulty === "medium"
      ? "4-6轮，略带社交细节。"
      : "7轮以上，可能涉及微妙话题或尴尬沉默。"
}

${BASE_SCENE_REQ}`;
}

function orderingFoodScenario(difficulty: Difficulty): string {
  const d = getDifficultyLabel(difficulty);
  return `你为中文对话练习生成场景。类别：点餐购物，难度：${d}。

场景：餐厅点菜、外卖沟通、商场购物、询问商品信息、退换货等。
${
  difficulty === "easy"
    ? "简单点餐，无障碍。2-3轮。"
    : difficulty === "medium"
      ? "菜单不熟、口味特殊要求。4-6轮。"
      : "上错菜、算错账、食材过敏等复杂情况。7轮以上。"
}

${BASE_SCENE_REQ}`;
}

function workplaceScenario(difficulty: Difficulty): string {
  const d = getDifficultyLabel(difficulty);
  return `你为中文对话练习生成场景。类别：职场沟通，难度：${d}。

场景：向领导汇报、和同事协作、跨部门协调、面试、绩效谈话等。
${
  difficulty === "easy"
    ? "简单汇报或请求。2-3轮。"
    : difficulty === "medium"
      ? "意见分歧、催促进度。4-6轮。"
      : "绩效考核、辞职谈判、办公室冲突。7轮以上。"
}

${BASE_SCENE_REQ}`;
}

function socialEventScenario(difficulty: Difficulty): string {
  const d = getDifficultyLabel(difficulty);
  return `你为中文对话练习生成场景。类别：社交场合，难度：${d}。

场景：聚会结识新朋友、婚礼/宴会交流、公司团建、家长会等社交活动。
${
  difficulty === "easy"
    ? "轻松自我介绍。2-3轮。"
    : difficulty === "medium"
      ? "融入已有小团体、找话题。4-6轮。"
      : "应对尴尬问题、文化差异、多人同时交谈。7轮以上。"
}

${BASE_SCENE_REQ}`;
}

function phoneCallScenario(difficulty: Difficulty): string {
  const d = getDifficultyLabel(difficulty);
  return `你为中文对话练习生成场景。类别：电话沟通，难度：${d}。

场景：订座/预约电话、客服投诉、电话面试、紧急通知、联系陌生人等。
${
  difficulty === "easy"
    ? "简单预约或查询。2-3轮。"
    : difficulty === "medium"
      ? "改期取消、信息确认、转接沟通。4-6轮。"
      : "投诉处理、紧急情况、信号不清楚等挑战。7轮以上。"
}

注意场景中只有电话声音交流，没有视觉线索。

${BASE_SCENE_REQ}`;
}

function conflictResolutionScenario(difficulty: Difficulty): string {
  const d = getDifficultyLabel(difficulty);
  return `你为中文对话练习生成场景。类别：化解矛盾，难度：${d}。

场景：邻里纠纷、服务不满、同事争执、朋友误会、家人矛盾等需要化解冲突的情境。
${
  difficulty === "easy"
    ? "轻微不满，容易和解。2-3轮。"
    : difficulty === "medium"
      ? "情绪激动但可控。4-6轮。"
      : "情绪激烈、立场对立、需要高情商化解。7轮以上。"
}

${BASE_SCENE_REQ}`;
}

function philosophyScenario(difficulty: Difficulty, philosopherId: string, philosopherLabel: string): string {
  const d = getDifficultyLabel(difficulty);
  return `你为中文对话练习生成场景。类别：哲学思考，交流对象：${philosopherLabel}，难度：${d}。

设置一个适合与这位哲学家/哲学流派进行思想交流的场景。场景要自然——比如书房对话、散步聊天、咖啡馆讨论等。

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

function compArchScenario(difficulty: Difficulty): string {
  const d = getDifficultyLabel(difficulty);
  return `你为中文对话练习生成场景。类别：计算机体系结构，难度：${d}。

设置与一位计算机体系结构专家对话的场景（如实验室讨论、技术分享会后交流等）。
NPC 是体系结构专家，讨论 CPU 设计、缓存层次、流水线、内存模型、指令集等。
${
  difficulty === "easy"
    ? "基础概念讨论，如 CPU 组成、缓存原理。2-3轮。"
    : difficulty === "medium"
      ? "具体设计权衡，如超标量、分支预测、Cache一致性。4-6轮。"
      : "前沿深入，如异构计算、量子体系结构、内存计算。7轮以上。"
}
${BASE_SCENE_REQ}`;
}

function parallelProgScenario(difficulty: Difficulty): string {
  const d = getDifficultyLabel(difficulty);
  return `你为中文对话练习生成场景。类别：并行编程，难度：${d}。

设置与一位并行编程专家对话的场景。NPC 讨论并发模型、线程管理、GPU编程、分布式系统、锁机制等。
${
  difficulty === "easy"
    ? "基础并发概念，如线程/进程区别、互斥锁。2-3轮。"
    : difficulty === "medium"
      ? "具体技术，如无锁数据结构、OpenMP、CUDA基础。4-6轮。"
      : "高级主题，如分布式一致性、MPI优化、异构并行调度。7轮以上。"
}
${BASE_SCENE_REQ}`;
}

function llmScenario(difficulty: Difficulty): string {
  const d = getDifficultyLabel(difficulty);
  return `你为中文对话练习生成场景。类别：大模型，难度：${d}。

设置与一位大模型/深度学习专家对话的场景。NPC 讨论 Transformer、注意力机制、训练优化、推理部署、提示工程等。
${
  difficulty === "easy"
    ? "基础概念，如 Transformer 架构、GPT 原理概述。2-3轮。"
    : difficulty === "medium"
      ? "技术细节，如 QKV 注意力、RLHF、LoRA微调。4-6轮。"
      : "前沿话题，如 MoE 架构、长上下文、多模态融合、AGI 探讨。7轮以上。"
}
${BASE_SCENE_REQ}`;
}

// ─── Category-specific respond prompts ───

function smallTalkRespond(scenario: { scene: string; npc: { name: string; role: string; tone: string } }, history: Message[]): string {
  const hist = historyText(history);
  return `你是闲聊练习中的 NPC。场景：${scenario.scene}。你是${scenario.npc.name}，${scenario.npc.role}，语气${scenario.npc.tone}。

对话记录：${hist}

${BASE_RESPOND_RULES}`;
}

function orderingFoodRespond(scenario: { scene: string; npc: { name: string; role: string; tone: string } }, history: Message[]): string {
  const hist = historyText(history);
  return `你是点餐/购物场景中的 NPC。场景：${scenario.scene}。你是${scenario.npc.name}，${scenario.npc.role}，语气${scenario.npc.tone}。

记住你是服务方，要处理用户的点单、询问或投诉。

对话记录：${hist}

${BASE_RESPOND_RULES}`;
}

function workplaceRespond(scenario: { scene: string; npc: { name: string; role: string; tone: string } }, history: Message[]): string {
  const hist = historyText(history);
  return `你是职场场景中的 NPC。场景：${scenario.scene}。你是${scenario.npc.name}，${scenario.npc.role}，语气${scenario.npc.tone}。

保持职场专业度，使用恰当的工作用语。根据角色身份（上司/同事/客户）调整语气和态度。

对话记录：${hist}

${BASE_RESPOND_RULES}`;
}

function socialEventRespond(scenario: { scene: string; npc: { name: string; role: string; tone: string } }, history: Message[]): string {
  const hist = historyText(history);
  return `你是社交场合中的 NPC。场景：${scenario.scene}。你是${scenario.npc.name}，${scenario.npc.role}，语气${scenario.npc.tone}。

对话应自然轻松，像真实社交互动。可以分享趣事、提问、偶尔幽默。

对话记录：${hist}

${BASE_RESPOND_RULES}`;
}

function phoneCallRespond(scenario: { scene: string; npc: { name: string; role: string; tone: string } }, history: Message[]): string {
  const hist = historyText(history);
  return `你是电话沟通中的 NPC。场景：${scenario.scene}。你是${scenario.npc.name}，${scenario.npc.role}，语气${scenario.npc.tone}。

重要：这是电话对话，没有视觉线索。说话要清晰，上下文需要靠语言传达。

对话记录：${hist}

${BASE_RESPOND_RULES}`;
}

function conflictResolutionRespond(scenario: { scene: string; npc: { name: string; role: string; tone: string } }, history: Message[]): string {
  const hist = historyText(history);
  return `你是矛盾场景中的 NPC。场景：${scenario.scene}。你是${scenario.npc.name}，${scenario.npc.role}，语气${scenario.npc.tone}。

你对当前状况有不满或意见。情绪随着对话进展而波动（可愤怒、可不悦、可逐渐缓和），
但给用户化解冲突的空间——态度随用户表现而变化。

对话记录：${hist}

${BASE_RESPOND_RULES}`;
}

function philosophyRespond(scenario: { scene: string; npc: { name: string; role: string; tone: string } }, history: Message[]): string {
  const hist = historyText(history);
  return `你正在扮演一位哲学家与用户进行思想交流。场景：${scenario.scene}。你是${scenario.npc.name}，${scenario.npc.role}，思想风格：${scenario.npc.tone}。

- 用哲学家式的语言和思维方式回复
- 既要阐述观点，也要向用户提问以激发思考
- 保持对话深度但不失生动
- 可以引用哲学概念但不要长篇大论
- 所有内容用中文表达

对话记录：${hist}

${BASE_RESPOND_RULES}`;
}

// ─── Tech respond prompts ───

function compArchRespond(scenario: { scene: string; npc: { name: string; role: string; tone: string } }, history: Message[]): string {
  const hist = historyText(history);
  return `你是计算机体系结构专家 NPC。场景：${scenario.scene}。你是${scenario.npc.name}，${scenario.npc.role}，语气${scenario.npc.tone}。

- 用中文交流，但专业术语可保留英文（如 "pipeline"、"cache coherence"）
- 回答要准确、技术性，根据难度调整深度
- 可以引导用户思考设计权衡问题
- 用具体例子说明抽象概念

对话记录：${hist}\n${BASE_RESPOND_RULES}`;
}

function parallelProgRespond(scenario: { scene: string; npc: { name: string; role: string; tone: string } }, history: Message[]): string {
  const hist = historyText(history);
  return `你是并行编程专家 NPC。场景：${scenario.scene}。你是${scenario.npc.name}，${scenario.npc.role}，语气${scenario.npc.tone}。

- 中文交流，专业术语可保留英文
- 讨论并发、锁、CUDA、MPI、分布式等
- 用代码示例或伪代码辅助解释

对话记录：${hist}\n${BASE_RESPOND_RULES}`;
}

function llmRespond(scenario: { scene: string; npc: { name: string; role: string; tone: string } }, history: Message[]): string {
  const hist = historyText(history);
  return `你是大模型/深度学习专家 NPC。场景：${scenario.scene}。你是${scenario.npc.name}，${scenario.npc.role}，语气${scenario.npc.tone}。

- 中文交流，专业术语可保留英文
- 讨论 Transformer、RLHF、MoE、推理优化等
- 可以提及最新研究趋势和业界实践

对话记录：${hist}\n${BASE_RESPOND_RULES}`;
}

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

// ─── Tech feedback prompts ───

function compArchFeedback(category: Category, difficulty: Difficulty, transcript: Message[]): string {
  const t = transcriptText(transcript);
  return `分析本次计算机体系结构对话。用户的技术理解是否准确、讨论是否有深度？
${categoryContext(category, difficulty)}
对话记录：${t}\n${BASE_FEEDBACK_RULES}`;
}

function parallelProgFeedback(category: Category, difficulty: Difficulty, transcript: Message[]): string {
  const t = transcriptText(transcript);
  return `分析本次并行编程对话。用户对并发概念的理解、表达是否清晰？
${categoryContext(category, difficulty)}
对话记录：${t}\n${BASE_FEEDBACK_RULES}`;
}

function llmFeedback(category: Category, difficulty: Difficulty, transcript: Message[]): string {
  const t = transcriptText(transcript);
  return `分析本次大模型对话。用户对 AI 技术的理解、讨论是否有启发性？
${categoryContext(category, difficulty)}
对话记录：${t}\n${BASE_FEEDBACK_RULES}`;
}

// ─── Helpers ───

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
  philosopherId?: string,
  philosopherLabel?: string
): string {
  switch (category) {
    case "small_talk":        return smallTalkScenario(difficulty);
    case "ordering_food":     return orderingFoodScenario(difficulty);
    case "workplace":         return workplaceScenario(difficulty);
    case "social_event":      return socialEventScenario(difficulty);
    case "phone_call":        return phoneCallScenario(difficulty);
    case "conflict_resolution": return conflictResolutionScenario(difficulty);
    case "philosophy":        return philosophyScenario(difficulty, philosopherId ?? "random", philosopherLabel ?? "未知");
    case "computer_architecture": return compArchScenario(difficulty);
    case "parallel_programming":  return parallelProgScenario(difficulty);
    case "llm":               return llmScenario(difficulty);
    default:                  return smallTalkScenario(difficulty);
  }
}

export function respondPrompt(
  category: Category,
  scenario: { scene: string; npc: { name: string; role: string; tone: string } },
  history: Message[]
): string {
  switch (category) {
    case "small_talk":        return smallTalkRespond(scenario, history);
    case "ordering_food":     return orderingFoodRespond(scenario, history);
    case "workplace":         return workplaceRespond(scenario, history);
    case "social_event":      return socialEventRespond(scenario, history);
    case "phone_call":        return phoneCallRespond(scenario, history);
    case "conflict_resolution": return conflictResolutionRespond(scenario, history);
    case "philosophy":        return philosophyRespond(scenario, history);
    case "computer_architecture": return compArchRespond(scenario, history);
    case "parallel_programming":  return parallelProgRespond(scenario, history);
    case "llm":               return llmRespond(scenario, history);
    default:                  return smallTalkRespond(scenario, history);
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
    case "computer_architecture": return compArchFeedback(category, difficulty, transcript);
    case "parallel_programming":  return parallelProgFeedback(category, difficulty, transcript);
    case "llm":               return llmFeedback(category, difficulty, transcript);
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
  return `你正在为一场中文哲学辩论生成开场场景。

哲学家A：${philosopherA}
哲学家B：${philosopherB}
辩论主题：${topic}
总轮数：${maxRounds}

返回 JSON：
- title: 辩论标题
- scene: 场景描述（2-3句中文），设定辩论发生的氛围
- philosophers: { a: { name, emoji }, b: { name, emoji } }
- opening: { speaker: "A", text: "${philosopherA}的开幕发言" } — 论点鲜明，2-3句

只输出 JSON。`;
}

export function debateRespondPrompt(
  philosopherA: string,
  philosopherB: string,
  topic: string,
  currentSpeaker: "A" | "B",
  history: { speaker: string; text: string }[]
): string {
  const speaker = currentSpeaker === "A" ? philosopherA : philosopherB;
  const opponent = currentSpeaker === "A" ? philosopherB : philosopherA;

  const historyText = history
    .map((m) => `${m.speaker === "A" ? philosopherA : philosopherB}: ${m.text}`)
    .join("\n");

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

  return `你是 ${speaker}，正在与 ${opponent} 进行关于「${topic}」的中文辩论。

辩论历史：
${historyText}

现在轮到 ${speaker} 发言。本轮辩论风格：${style.name}

要求：
${style.rules}
- 2-5句话，以 ${speaker} 的口吻和核心思想发言
- 全程中文

返回 JSON：{ speaker: "${currentSpeaker}", text: "发言内容", mood: "情绪" }
只输出 JSON。`;
}
