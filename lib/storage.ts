import type { Session, Stats, Category } from "./types";

const STORAGE_KEY = "conversation-practice";

interface StorageData {
  sessions: Session[];
  stats: Stats;
}

function emptyStats(): Stats {
  return {
    totalXP: 0,
    sessionsCompleted: 0,
    categoryXP: {} as Record<Category, number>,
  };
}

function read(): StorageData {
  if (typeof window === "undefined") {
    return { sessions: [], stats: emptyStats() };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { sessions: [], stats: emptyStats() };
    return JSON.parse(raw) as StorageData;
  } catch {
    return { sessions: [], stats: emptyStats() };
  }
}

function write(data: StorageData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full — trim oldest 50% of sessions
    const trimmed = [...data.sessions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    trimmed.splice(Math.floor(trimmed.length / 2));
    data.sessions = trimmed;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // give up
    }
  }
}

export function getStats(): Stats {
  return read().stats;
}

export function getSessions(): Session[] {
  return read().sessions;
}

export function saveSession(session: Session): void {
  const data = read();
  data.sessions.push(session);

  data.stats.totalXP += session.xpEarned;
  data.stats.sessionsCompleted += 1;
  if (!data.stats.categoryXP[session.category]) {
    data.stats.categoryXP[session.category] = 0;
  }
  data.stats.categoryXP[session.category] += session.xpEarned;

  write(data);
}

export function getCategoryXP(category: Category): number {
  return read().stats.categoryXP[category] ?? 0;
}
