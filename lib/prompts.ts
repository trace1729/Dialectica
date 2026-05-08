import type { Category, Difficulty, Message } from "./types";
import { getCategoryLabel, getDifficultyLabel } from "./categories";

export function scenarioPrompt(
  category: Category,
  difficulty: Difficulty
): string {
  const categoryLabel = getCategoryLabel(category);
  const difficultyLabel = getDifficultyLabel(difficulty);

  const turnGuidance =
    difficulty === "easy"
      ? "场景应该简单直接，预计2-3轮对话即可完成。情景友好、直白。"
      : difficulty === "medium"
        ? "场景应允许4-6轮对话，包含一些微妙的社交细节或轻微的尴尬情境。"
        : "创建复杂场景，支持7轮以上对话。可包含误解、微妙的社交张力或文化差异等元素。";

  return `你是一个为中文对话练习应用设计场景的创意设计师。请为用户生成一个真实的中文日常对话场景。

场景类别：${categoryLabel}
难度：${difficultyLabel}
${turnGuidance}

返回一个 JSON 对象，包含以下字段（所有文本必须用中文）：
- scene: 生动描述当前情境（2-3句话）。使用第二人称（"你正站在..."）。包含场景背景、地点以及刚刚发生了什么。
- npc: 一个对象，包含 "name"、"role"、"tone"，描述用户需要与之对话的人物。
- opening: NPC 的开场白——他们说出的第一句话，用来开启对话。
- visual: 场景视觉的简要描述（用于画面渲染）。用几个词描述颜色、物体和氛围。

只输出有效的 JSON，不要包含其他文字。`;
}

export function respondPrompt(
  scenario: { scene: string; npc: { name: string; role: string; tone: string } },
  history: Message[]
): string {
  const historyText = history
    .map((m) => `${m.role === "user" ? "用户" : "你（NPC）"}: ${m.text}`)
    .join("\n");

  return `你正在一个中文对话练习应用中扮演 NPC。请始终保持在角色中，使用中文回复。

场景：${scenario.scene}

你的角色设定：
- 名字：${scenario.npc.name}
- 身份：${scenario.npc.role}
- 语气：${scenario.npc.tone}

对话记录：
${historyText}

规则：
- 以 NPC 的身份自然回复。回复要简洁（1-3句话）。
- 对用户刚才说的话做出真实反应。展现情感和个性。
- 千万不要跳出角色或给出元评论。
- 不要让对话突然结束——自然地延续对话。

返回一个 JSON 对象：
- npcResponse: 你作为 NPC 的下一句对话台词（中文）。
- npcMood: 一个词描述你当前的情绪状态（中文）。

只输出有效的 JSON，不要包含其他文字。`;
}

export function feedbackPrompt(
  category: Category,
  difficulty: Difficulty,
  transcript: Message[]
): string {
  const categoryLabel = getCategoryLabel(category);
  const difficultyLabel = getDifficultyLabel(difficulty);

  const transcriptText = transcript
    .map((m) => `${m.role === "user" ? "用户" : "NPC"}: ${m.text}`)
    .join("\n");

  return `你是一位友善、鼓励型的中文对话教练。请分析用户在这次角色扮演对话中的表现。

场景类别：${categoryLabel}
难度：${difficultyLabel}

对话记录：
${transcriptText}

请评估用户的发言（忽略 NPC 的台词），从以下方面评判：
- 回应的恰当性（是否符合场景情境）
- 用词选择和礼貌程度
- 语气和情商表现
- 推动对话流畅进行的能力

返回一个 JSON 对象（所有文本用中文）：
- score: 1到10的整数，评价整体对话质量。
- strengths: 2-3个字符串，描述用户做得好的地方。
- improvements: 2-3个字符串，给出具体、可操作的改进建议。
- xpEarned: 整数。基础值：简单=20，中等=40，困难=60。根据得分调整（乘以 score/10 后取整）。

只输出有效的 JSON，不要包含其他文字。`;
}
