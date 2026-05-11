import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/deepseek";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { material, question, answer, expectedPoints } = (await request.json()) as {
      material: string;
      question: string;
      answer: string;
      expectedPoints: string[];
    };
    if (!material || !question || !answer) {
      return NextResponse.json({ error: "fields required" }, { status: 400 });
    }

    const prompt = `你是一个客观的学习评估助手。根据以下材料、问题和学生的回答，给出客观评估。

学习材料：
${material.slice(0, 4000)}

问题：${question}

预期要点：${expectedPoints.join("、")}

学生回答：${answer}

请评估学生的回答，从以下维度：
- 准确性：是否抓住了核心概念
- 完整性：是否涵盖了关键要点
- 深度：是否有自己的思考和延伸

返回 JSON：
{
  "score": 1-10的评分,
  "accuracy": "准确性评语（1-2句）",
  "completeness": "完整性评语（1-2句）",
  "depth": "深度评语（1-2句）",
  "missing": ["遗漏的要点1", "要点2"],
  "suggestion": "改进建议（1-2句）",
  "modelAnswer": "参考答案（3-5句）"
}

只输出 JSON。`;

    const { content } = await chat(
      [{ role: "system", content: prompt }, { role: "user", content: "请评估" }],
      { model: "deepseek-v4-pro", reasoningEffort: "high", enableThinking: true }
    );

    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    console.error("QA evaluate error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
