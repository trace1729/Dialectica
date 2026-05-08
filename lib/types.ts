export type Difficulty = "easy" | "medium" | "hard";

export type Category =
  | "small_talk"
  | "ordering_food"
  | "workplace"
  | "social_event"
  | "phone_call"
  | "conflict_resolution";

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
}

export interface Message {
  role: "user" | "npc";
  text: string;
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
}

export interface Stats {
  totalXP: number;
  sessionsCompleted: number;
  categoryXP: Record<Category, number>;
}

export interface GameState {
  category: Category | null;
  difficulty: Difficulty | null;
  scenario: Scenario | null;
  transcript: Message[];
  feedback: Feedback | null;
  phase: "home" | "setup" | "playing" | "feedback";
}
