import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/deepseek";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { material } = (await request.json()) as { material: string };
    if (!material) {
      return NextResponse.json({ error: "material required" }, { status: 400 });
    }

    const prompt = `你是一个学习辅助工具。根据以下学习材料，创建 2-3 个领域相关的虚拟角色来提问。

材料内容：
${material.slice(0, 8000)}

请创建 2-3 个角色，每个角色：
- 来自材料相关领域
- 有不同的提问风格（如：理论型、应用型、批判型）
- 用中文

返回 JSON：
{
  "roles": [
    { "name": "角色名", "emoji": "相关emoji", "style": "提问风格描述", "focus": "关注领域" },
    ...
  ],
  "questions": [
    { "roleIndex": 0, "text": "问题内容", "expectedPoints": ["预期回答要点1", "要点2"] },
    ...
  ]
}

生成 5-8 个问题，按难度递进排列。
只输出 JSON。`;

    const { content } = await chat(
      [{ role: "system", content: prompt }, { role: "user", content: "请生成角色和问题" }],
      { model: "deepseek-v4-pro", reasoningEffort: "high", enableThinking: true }
    );

    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    console.error("QA roles error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
