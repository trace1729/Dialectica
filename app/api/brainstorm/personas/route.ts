import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/deepseek";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { idea, count } = (await request.json()) as {
      idea: string;
      count: number;
    };
    if (!idea || !count) {
      return NextResponse.json({ error: "idea and count required" }, { status: 400 });
    }
    const n = Math.min(Math.max(count, 2), 6);

    const prompt = `你正在为一场创意头脑风暴创建参与者。

核心想法/议题：${idea}

请创建 ${n} 个与该想法相关的人物角色。每个角色应该：
- 来自不同的相关领域（如技术、商业、设计、学术、用户、监管等角度）
- 有明确的核心观点和独特视角
- 名字要真实可信

返回 JSON：
{
  "personas": [
    { "name": "姓名", "emoji": "相关emoji", "role": "角色/领域简短描述", "perspective": "该角色对想法的核心观点（1句话）" },
    ...
  ],
  "title": "头脑风暴标题",
  "scene": "场景描述（1-2句）"
}

只输出 JSON。`;

    const { content } = await chat(
      [{ role: "system", content: prompt }, { role: "user", content: `为「${idea}」创建${n}位头脑风暴参与者` }],
      { model: "deepseek-v4-pro", reasoningEffort: "high", enableThinking: true }
    );

    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    console.error("Brainstorm personas error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
