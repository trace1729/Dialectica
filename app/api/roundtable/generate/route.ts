import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/deepseek";
import { saveRoundtable } from "@/lib/server-storage";
import { uuid } from "@/lib/uid";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { userId, philosophers, topic, maxRounds } = (await request.json()) as {
      userId?: string;
      philosophers: { id: string; name: string; emoji: string }[];
      topic: string;
      maxRounds: number;
    };
    if (!philosophers?.length || !topic || !maxRounds) {
      return NextResponse.json({ error: "all fields required" }, { status: 400 });
    }
    const names = philosophers.map((p) => p.name);
    const totalMessages = philosophers.length * maxRounds;
    const prompt = `你正在主持一场中文哲学圆桌讨论。参与哲学家：${names.join("、")}。主题：${topic}。共${maxRounds}轮。

生成完整的圆桌讨论记录，${names[0]}先发言。每轮所有哲学家依次发言。
共${totalMessages}条消息（${maxRounds}轮 × ${philosophers.length}人）。

每轮发言风格随机在以下四种中切换：
1. 深化学术观点：基于自己的理论框架，提出原创性见解
2. 回应他人观点：赞同或反驳某位同行的发言
3. 提出全新视角：跳出框架，从意想不到的角度切入
4. 综合与展望：综合各方观点，指出共识与分歧

要求：
- 每位发言人必须用中文，2-4句话，展现核心思想
- 哲学家间可以有互动（引用、赞同、反驳）

返回 JSON：
{
  "title": "...",
  "scene": "...",
  "messages": [
    { "philosopherId": "id1", "text": "...", "mood": "..." },
    { "philosopherId": "id2", "text": "...", "mood": "..." },
    ...
  ]
}
只输出 JSON。`;

    const { content } = await chat(
      [{ role: "system", content: prompt }, { role: "user", content: "开始圆桌讨论" }],
      { model: "deepseek-v4-pro", reasoningEffort: "high", enableThinking: true }
    );

    const result = JSON.parse(content);
    if (userId) {
      saveRoundtable(userId, {
        id: uuid(),
        date: new Date().toISOString(),
        philosophers,
        topic,
        maxRounds,
        actualRounds: maxRounds,
        messages: result.messages,
        title: result.title,
        scene: result.scene,
      });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("Roundtable generate error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
