export type Difficulty = "easy" | "medium" | "hard";

export type Topic = "daily" | "philosophy" | "tech";

export type Category =
  | "small_talk"
  | "ordering_food"
  | "workplace"
  | "social_event"
  | "phone_call"
  | "conflict_resolution"
  | "philosophy"
  | "computer_architecture"
  | "parallel_programming"
  | "llm"
  | "ai_ml"
  | "quantum"
  | "cs_theory"
  | "software_engineering"
  | "crypto_security"
  | "networks"
  | "robotics"
  | "systems"
  | "data_science"
  | "data_structures_algorithms";

export interface NPCDetails {
  name: string;
  role: string;
  tone: string;
}

export interface Scenario {
  scene: string;
  npc: NPCDetails;
  opening: string;
  visual?: string;
  philosopher?: string;
}

export interface Message {
  role: "user" | "npc";
  text: string;
  reasoningContent?: string;
}

export interface NPCResponse {
  npcResponse: string;
  npcMood: string;
}

export interface Feedback {
  score: number;
  strengths: string[];
  improvements: string[];
  xpEarned: number;
}

export interface Session {
  id: string;
  category: Category;
  difficulty: Difficulty;
  date: string;
  transcript: Message[];
  score: number;
  strengths: string[];
  improvements: string[];
  xpEarned: number;
  philosopher?: string;
}

export interface Stats {
  totalXP: number;
  sessionsCompleted: number;
  categoryXP: Partial<Record<Category, number>>;
}

export interface DraftSession {
  id: string;
  category: Category;
  difficulty: Difficulty;
  date: string;
  transcript: Message[];
  philosopher?: string;
  speedMode: boolean;
  seminarMode: boolean;
  npcName: string;
  scene: string;
  visual?: string;
}

export interface DebateRecord {
  id: string;
  date: string;
  philosopherA: { name: string; emoji: string };
  philosopherB: { name: string; emoji: string };
  topic: string;
  maxRounds: number;
  actualRounds: number;
  messages: { speaker: string; text: string; mood?: string }[];
}

export type DebateSubPhase = "opening" | "freeDebate" | "closing";

export interface DraftDebate {
  id: string;
  date: string;
  philosopherA: { name: string; emoji: string };
  philosopherB: { name: string; emoji: string };
  topic: string;
  round: number;
  maxRounds: number;
  currentSpeaker: "A" | "B";
  messages: { speaker: string; text: string; mood?: string; reasoningContent?: string }[];
  title: string;
  scene: string;
  autoMode: boolean;
  subPhase: DebateSubPhase;
}

export interface RoundtableMessage {
  philosopherId: string;
  text: string;
  mood?: string;
  reasoningContent?: string;
}

export interface RoundtableRecord {
  id: string;
  date: string;
  philosophers: { id: string; name: string; emoji: string }[];
  topic: string;
  maxRounds: number;
  actualRounds: number;
  messages: RoundtableMessage[];
  title: string;
  scene: string;
}

export type RoundtableSubPhase = "opening" | "freeDebate" | "closing";

export interface DraftRoundtable {
  id: string;
  date: string;
  philosophers: { id: string; name: string; emoji: string }[];
  topic: string;
  round: number;
  maxRounds: number;
  nextSpeaker: string;
  messages: RoundtableMessage[];
  title: string;
  scene: string;
  subPhase: RoundtableSubPhase;
}

export interface GameState {
  category: Category | null;
  difficulty: Difficulty | null;
  scenario: Scenario | null;
  transcript: Message[];
  feedback: Feedback | null;
  phase: "home" | "setup" | "playing" | "feedback";
  philosopher?: string;
}
