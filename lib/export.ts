import type { Session, DebateRecord, RoundtableRecord } from "./types";

function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportSession(session: Session): void {
  const lines: string[] = [];
  lines.push("=== 浪潮 对话导出 ===");
  lines.push(`会话ID: ${session.id}`);
  lines.push(`日期: ${session.date}`);
  lines.push(`类别: ${session.category}`);
  lines.push(`难度: ${session.difficulty}`);
  lines.push(`分数: ${session.score}/10`);
  if (session.philosopher) lines.push(`人物: ${session.philosopher}`);
  lines.push(`XP: ${session.xpEarned}`);
  lines.push("---");
  for (const m of session.transcript) {
    const role = m.role === "user" ? "🧑 用户" : "🤖 NPC";
    lines.push(`[${role}]: ${m.text}`);
  }
  lines.push("---");
  lines.push("=== 结束 ===");
  const filename = `浪潮-对话-${session.date.slice(0, 10)}.txt`;
  downloadFile(filename, lines.join("\n"));
}

export function exportDebate(debate: DebateRecord): void {
  const lines: string[] = [];
  lines.push("=== 浪潮 辩论导出 ===");
  lines.push(`辩论ID: ${debate.id}`);
  lines.push(`日期: ${debate.date}`);
  lines.push(`正方: ${debate.philosopherA.name}`);
  lines.push(`反方: ${debate.philosopherB.name}`);
  lines.push(`主题: ${debate.topic}`);
  lines.push(`轮数: ${debate.actualRounds}/${debate.maxRounds}`);
  lines.push("---");
  for (const m of debate.messages) {
    const name = m.speaker === "A" ? debate.philosopherA.name : debate.philosopherB.name;
    const emoji = m.speaker === "A" ? debate.philosopherA.emoji : debate.philosopherB.emoji;
    lines.push(`[${emoji} ${name}]: ${m.text}`);
  }
  lines.push("---");
  lines.push("=== 结束 ===");
  const filename = `浪潮-辩论-${debate.philosopherA.name}vs${debate.philosopherB.name}-${debate.date.slice(0, 10)}.txt`;
  downloadFile(filename, lines.join("\n"));
}

export function exportRoundtable(rt: RoundtableRecord): void {
  const lines: string[] = [];
  lines.push("=== 浪潮 圆桌导出 ===");
  lines.push(`圆桌ID: ${rt.id}`);
  lines.push(`日期: ${rt.date}`);
  lines.push(`参与者: ${rt.philosophers.map((p) => `${p.emoji}${p.name}`).join(" / ")}`);
  lines.push(`主题: ${rt.topic}`);
  lines.push(`轮数: ${rt.actualRounds}/${rt.maxRounds}`);
  if (rt.title) lines.push(`标题: ${rt.title}`);
  lines.push("---");
  for (const m of rt.messages) {
    const p = rt.philosophers.find((ph) => ph.id === m.philosopherId);
    const name = p ? `${p.emoji} ${p.name}` : "未知";
    lines.push(`[${name}]: ${m.text}`);
  }
  lines.push("---");
  lines.push("=== 结束 ===");
  const filename = `浪潮-圆桌-${rt.date.slice(0, 10)}.txt`;
  downloadFile(filename, lines.join("\n"));
}

function parseImportedContent(content: string): {
  type: "session" | "debate" | "roundtable";
  messages: { role?: string; speaker?: string; text: string }[];
  meta: Record<string, string>;
} | null {
  const lines = content.split("\n").map((l) => l.trim());
  const header = lines[0] || "";

  let type: "session" | "debate" | "roundtable";
  if (header.includes("对话导出")) type = "session";
  else if (header.includes("辩论导出")) type = "debate";
  else if (header.includes("圆桌导出")) type = "roundtable";
  else return null;

  const meta: Record<string, string> = {};
  const messages: { role?: string; speaker?: string; text: string }[] = [];
  let inMessages = false;

  for (const line of lines.slice(1)) {
    if (line === "---" && !inMessages) { inMessages = true; continue; }
    if (line === "---" && inMessages) { inMessages = false; continue; }
    if (line === "=== 结束 ===") { break; }

    if (!inMessages) {
      const match = line.match(/^(.+?):\s*(.*)$/);
      if (match) meta[match[1]] = match[2];
      continue;
    }

    // Message line: [Role/Name]: text
    const msgMatch = line.match(/^\[(.+?)\]:\s*(.*)$/);
    if (msgMatch) {
      const label = msgMatch[1];
      const text = msgMatch[2];
      if (type === "session") {
        messages.push({ role: label.includes("用户") ? "user" : "npc", text });
      } else {
        messages.push({ speaker: label, text });
      }
    }
  }

  return { type, messages, meta };
}

export async function importFile(file: File): Promise<{
  type: "session" | "debate" | "roundtable";
  messages: { role?: string; speaker?: string; text: string }[];
  meta: Record<string, string>;
} | null> {
  try {
    const content = await file.text();
    return parseImportedContent(content);
  } catch {
    return null;
  }
}

export function exportAllSessions(sessions: Session[]): void {
  const lines: string[] = [];
  lines.push("=== 浪潮 全部对话导出 ===");
  for (const s of sessions) {
    lines.push("");
    lines.push(`${s.date} | ${s.category} | ${s.difficulty} | ${s.score}/10`);
    for (const m of s.transcript) {
      const role = m.role === "user" ? "🧑" : "🤖";
      lines.push(`  ${role}: ${m.text}`);
    }
  }
  lines.push("");
  lines.push("=== 结束 ===");
  downloadFile(`浪潮-全部对话-${new Date().toISOString().slice(0, 10)}.txt`, lines.join("\n"));
}
