import type { Session, Stats, Category, DebateRecord, DraftSession, DraftDebate } from "./types";

const STORAGE_KEY = "conversation-practice";

interface StorageData {
  sessions: Session[];
  debates: DebateRecord[];
  drafts: DraftSession[];
  debateDrafts: DraftDebate[];
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
    return { sessions: [], debates: [], drafts: [], debateDrafts: [], stats: emptyStats() };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { sessions: [], debates: [], drafts: [], debateDrafts: [], stats: emptyStats() };
    const parsed = JSON.parse(raw);
    return {
      sessions: parsed.sessions ?? [],
      debates: parsed.debates ?? [],
      drafts: parsed.drafts ?? [],
      debateDrafts: parsed.debateDrafts ?? [],
      stats: parsed.stats ?? emptyStats(),
    };
  } catch {
    return { sessions: [], debates: [], drafts: [], debateDrafts: [], stats: emptyStats() };
  }
}

function write(data: StorageData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    const trimmedSessions = [...data.sessions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    trimmedSessions.splice(Math.floor(trimmedSessions.length / 2));
    const trimmedDebates = [...data.debates].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    trimmedDebates.splice(Math.floor(trimmedDebates.length / 2));
    data.sessions = trimmedSessions;
    data.debates = trimmedDebates;
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

export function getDebates(): DebateRecord[] {
  return read().debates;
}

export function saveSession(session: Session): void {
  const data = read();
  data.sessions.push(session);

  data.stats.totalXP += session.xpEarned;
  data.stats.sessionsCompleted += 1;
  const currentXP = data.stats.categoryXP[session.category] ?? 0;
  data.stats.categoryXP[session.category] = currentXP + session.xpEarned;

  write(data);
}

export function saveDebate(debate: DebateRecord): void {
  const data = read();
  data.debates.push(debate);
  data.stats.sessionsCompleted += 1;
  write(data);
}

export function getCategoryXP(category: Category): number {
  return read().stats.categoryXP[category] ?? 0;
}

export function saveDraft(draft: DraftSession): void {
  const data = read();
  const existing = data.drafts.findIndex((d) => d.id === draft.id);
  if (existing >= 0) {
    data.drafts[existing] = draft;
  } else {
    data.drafts.push(draft);
  }
  write(data);
}

export function getDrafts(): DraftSession[] {
  return read().drafts;
}

export function deleteDraft(id: string): void {
  const data = read();
  data.drafts = data.drafts.filter((d) => d.id !== id);
  write(data);
}

export function saveDebateDraft(draft: DraftDebate): void {
  const data = read();
  const existing = data.debateDrafts.findIndex((d) => d.id === draft.id);
  if (existing >= 0) {
    data.debateDrafts[existing] = draft;
  } else {
    data.debateDrafts.push(draft);
  }
  write(data);
}

export function getDebateDrafts(): DraftDebate[] {
  return read().debateDrafts;
}

export function deleteDebateDraft(id: string): void {
  const data = read();
  data.debateDrafts = data.debateDrafts.filter((d) => d.id !== id);
  write(data);
}
