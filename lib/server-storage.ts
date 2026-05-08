import fs from "fs";
import path from "path";
import type { Session, DebateRecord } from "./types";

const DATA_DIR = path.join(process.cwd(), ".data");
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");
const DEBATES_FILE = path.join(DATA_DIR, "debates.json");

function ensureDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJson(filePath: string): Record<string, unknown[]> {
  ensureDir();
  if (!fs.existsSync(filePath)) return {};
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as Record<string, unknown[]>;
  } catch {
    return {};
  }
}

function writeJson(filePath: string, data: Record<string, unknown[]>): void {
  ensureDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export function getSessions(userId: string): Session[] {
  const data = readJson(SESSIONS_FILE);
  return (data[userId] ?? []) as Session[];
}

export function saveSession(userId: string, session: Session): void {
  const data = readJson(SESSIONS_FILE);
  if (!data[userId]) data[userId] = [];
  (data[userId] as Session[]).push(session);
  writeJson(SESSIONS_FILE, data);
}

export function getDebates(userId: string): DebateRecord[] {
  const data = readJson(DEBATES_FILE);
  return (data[userId] ?? []) as DebateRecord[];
}

export function saveDebate(userId: string, debate: DebateRecord): void {
  const data = readJson(DEBATES_FILE);
  if (!data[userId]) data[userId] = [];
  (data[userId] as DebateRecord[]).push(debate);
  writeJson(DEBATES_FILE, data);
}

export function deleteSession(userId: string, sessionId: string): void {
  const data = readJson(SESSIONS_FILE);
  if (data[userId]) {
    data[userId] = (data[userId] as Session[]).filter((s) => s.id !== sessionId);
    writeJson(SESSIONS_FILE, data);
  }
}

export function deleteDebate(userId: string, debateId: string): void {
  const data = readJson(DEBATES_FILE);
  if (data[userId]) {
    data[userId] = (data[userId] as DebateRecord[]).filter((d) => d.id !== debateId);
    writeJson(DEBATES_FILE, data);
  }
}
