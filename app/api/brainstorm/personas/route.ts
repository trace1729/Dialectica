import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/deepseek";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { idea, count, preference } = (await request.json()) as {
      idea: string;
      count: number;
      preference?: "philosophy" | "engineering";
    };
    if (!idea || !count) {
      return NextResponse.json({ error: "idea and count required" }, { status: 400 });
    }
    const n = Math.min(Math.max(count, 2), 6);
    const isEngineering = preference === "engineering";

    const preferenceGuide = isEngineering
      ? `聚焦工程落地视角。创建的角色应来自：
- 工程架构（系统设计、技术选型）
- 产品落地（用户体验、商业化）
- 数据与运营（指标、增长）
- 质量与安全（测试、可靠性、隐私）
- 项目管理（资源、时间线、风险）
- 前沿技术（可行性、技术债务）

每个角色应关注：怎么实现？需要什么资源？风险在哪里？如何衡量成功？`
      : `聚焦设计哲学视角。创建的角色应来自：
- 人文哲学（伦理、价值观、社会影响）
- 设计思维（用户体验、交互设计、美学）
- 战略思考（长期愿景、范式转变）
- 学术研究（理论基础、文献综述）
- 跨学科融合（多领域交叉、创新思维）
- 批判视角（挑战假设、寻找盲点）

每个角色应关注：为什么这么做？对用户/社会意味着什么？有哪些未被探索的可能性？`;

    const prompt = `你正在为一场创意头脑风暴创建参与者。

核心想法/议题：${idea}

${preferenceGuide}

请创建 ${n} 个与该想法相关的人物角色。每个角色应该：
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
