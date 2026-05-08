import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/deepseek";
import { saveDebate } from "@/lib/server-storage";
import { uuid } from "@/lib/uid";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { userId, philosopherA, philosopherB, topic, maxRounds } = (await request.json()) as {
      userId?: string;
      philosopherA: string;
      philosopherB: string;
      topic: string;
      maxRounds: number;
    };

    if (!philosopherA || !philosopherB || !topic || !maxRounds) {
      return NextResponse.json({ error: "all fields required" }, { status: 400 });
    }

    const rounds = Math.min(maxRounds, 50);
    const prompt = `你正在主持一场完整的中文哲学辩论。

正方：${philosopherA}
反方：${philosopherB}
辩题：${topic}
总轮数：${rounds}

你将生成整场辩论的所有发言，从 ${philosopherA} 的开幕发言开始，双方交替发言。

每轮发言的随机风格在以下五种中随机切换（不要每轮都相同）：
1. 严谨论证：引用对方论点 + 逻辑推理 + 原著依据
2. 激情反驳：雄辩有力、直击要害、情感充沛
3. 苏格拉底式追问：以提问为主，诱敌深入
4. 故事隐喻：用寓言或历史事件承载论证
5. 颠覆性反转：挑战前提假设，跳出框架

每轮发言规则：
- 2-4句话，以对应哲学家的口吻和核心思想发言
- 必须回应对方上一轮的具体论点
- 全程中文

返回 JSON：
{
  "title": "辩论标题",
  "scene": "场景描述（2-3句）",
  "philosophers": { "a": { "name": "${philosopherA}", "emoji": "" }, "b": { "name": "${philosopherB}", "emoji": "" } },
  "rounds": [
    { "speaker": "A", "text": "...", "mood": "..." },
    { "speaker": "B", "text": "...", "mood": "..." },
    ...
  ]
}
共 ${rounds * 2} 条发言（${rounds}轮 × 2人）。

只输出有效 JSON，不要其他文字。`;

    const { content } = await chat(
      [{ role: "system", content: prompt }, { role: "user", content: "开始辩论" }],
      { model: "deepseek-v4-pro", reasoningEffort: "high", enableThinking: true }
    );

    const debate = JSON.parse(content);

    // Save to server storage
    if (userId) {
      saveDebate(userId, {
        id: uuid(),
        date: new Date().toISOString(),
        philosopherA: debate.philosophers.a,
        philosopherB: debate.philosophers.b,
        topic,
        maxRounds: rounds,
        actualRounds: rounds,
        messages: debate.rounds,
      });
    }

    return NextResponse.json(debate);
  } catch (error) {
    console.error("Playground generate error:", error);
    return NextResponse.json({ error: "Failed to generate debate" }, { status: 500 });
  }
}
