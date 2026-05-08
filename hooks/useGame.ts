"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { Category, Difficulty, Scenario, Message, Feedback, Session } from "@/lib/types";
import { saveSession as saveLocalSession, saveDraft, deleteDraft, getDrafts } from "@/lib/storage";
import { uuid } from "@/lib/uid";

export interface GameState {
  phase: "home" | "setup" | "playing" | "feedback";
  category: Category | null;
  difficulty: Difficulty | null;
  scenario: Scenario | null;
  transcript: Message[];
  feedback: Feedback | null;
  loading: boolean;
  error: string | null;
  philosopher?: string;
  speedMode: boolean;
  draftId: string;
}

const initialState: GameState = {
  phase: "home",
  category: null,
  difficulty: null,
  scenario: null,
  transcript: [],
  feedback: null,
  loading: false,
  error: null,
  speedMode: false,
  draftId: "",
};

function getUserId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("ct_user_id");
  if (!id) {
    id = uuid();
    localStorage.setItem("ct_user_id", id);
  }
  return id;
}

function saveToServer(session: Session): void {
  const userId = getUserId();
  if (!userId) return;
  fetch("/api/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, session }) }).catch(() => {});
}

export function useGame(draftId?: string) {
  const [state, setState] = useState<GameState>(initialState);
  const sendingRef = useRef(false);

  // Load draft from localStorage on mount (client only)
  useEffect(() => {
    if (!draftId || typeof window === "undefined") return;
    const drafts = getDrafts();
    const draft = drafts.find((d) => d.id === draftId);
    if (draft) {
      setState({
        ...initialState,
        phase: "playing",
        category: draft.category,
        difficulty: draft.difficulty,
        transcript: draft.transcript,
        philosopher: draft.philosopher,
        speedMode: draft.speedMode,
        draftId: draft.id,
        scenario: { scene: draft.scene, npc: { name: draft.npcName, role: "", tone: "" }, opening: draft.transcript[0]?.text ?? "", visual: draft.visual },
      });
    }
  }, [draftId]);

  // Auto-save draft on state change during playing phase
  useEffect(() => {
    if (state.phase !== "playing" || !state.category || !state.difficulty || state.transcript.length === 0) return;
    const id = state.draftId || uuid();
    saveDraft({
      id,
      category: state.category,
      difficulty: state.difficulty,
      date: new Date().toISOString(),
      transcript: state.transcript,
      philosopher: state.philosopher,
      speedMode: state.speedMode,
      npcName: state.scenario?.npc.name ?? "",
      scene: state.scenario?.scene ?? "",
      visual: state.scenario?.visual,
    });
    if (!state.draftId) {
      setState((s) => ({ ...s, draftId: id }));
    }
  }, [state.transcript, state.phase, state.category, state.difficulty, state.scenario, state.philosopher, state.speedMode, state.draftId]);

  // Clear draft when session ends
  useEffect(() => {
    if (state.phase === "feedback" && state.draftId) {
      deleteDraft(state.draftId);
    }
  }, [state.phase, state.draftId]);

  const startGame = useCallback(async (category: Category, difficulty: Difficulty, philosopher?: string, speedMode = false) => {
    setState((s) => ({ ...s, loading: true, error: null, category, difficulty, philosopher, speedMode, phase: "setup" }));

    try {
      const res = await fetch("/api/scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, difficulty, philosopher, speedMode }),
      });

      if (!res.ok) throw new Error("Failed to generate scenario");

      const scenario = (await res.json()) as Scenario & { philosopher?: string };
      setState((s) => ({
        ...s,
        loading: false,
        scenario,
        philosopher: scenario.philosopher ?? s.philosopher,
        transcript: [{ role: "npc" as const, text: scenario.opening }],
        phase: "playing",
      }));
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        phase: "home",
        error: err instanceof Error ? err.message : "Unknown error",
      }));
    }
  }, []);

  const sendMessage = useCallback(async (message: string) => {
    if (!state.scenario || state.phase !== "playing" || !state.category || !state.difficulty) return;
    if (sendingRef.current) return;
    sendingRef.current = true;

    const userMessage: Message = { role: "user", text: message };
    const history = [...state.transcript, userMessage];

    setState((s) => ({ ...s, transcript: history, loading: true }));

    try {
      const res = await fetch("/api/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: state.category,
          difficulty: state.difficulty,
          scenario: state.scenario,
          history: state.transcript,
          userMessage: message,
          speedMode: state.speedMode,
        }),
      });

      if (!res.ok) throw new Error("Failed to get NPC response");

      const npcRes = await res.json();
      const npcMessage: Message = { role: "npc", text: npcRes.npcResponse };

      setState((s) => ({
        ...s,
        transcript: [...history, npcMessage],
        loading: false,
      }));
      sendingRef.current = false;
    } catch (err) {
      setState((s) => ({
        ...s,
        transcript: [...history],
        loading: false,
        phase: "playing",
        error: err instanceof Error ? err.message : "Unknown error",
      }));
      sendingRef.current = false;
    }
  }, [state.scenario, state.transcript, state.phase, state.category, state.difficulty, state.speedMode]);

  const endSession = useCallback(async () => {
    if (!state.category || !state.difficulty || state.transcript.length === 0) return;

    setState((s) => ({ ...s, loading: true }));

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: state.category,
          difficulty: state.difficulty,
          transcript: state.transcript,
          speedMode: state.speedMode,
        }),
      });

      if (!res.ok) throw new Error("Failed to get feedback");

      const feedback = (await res.json()) as Feedback;

      const session: Session = {
        id: uuid(),
        category: state.category,
        difficulty: state.difficulty,
        date: new Date().toISOString(),
        transcript: state.transcript,
        philosopher: state.philosopher,
        ...feedback,
      };

      saveLocalSession(session);
      saveToServer(session);

      setState((s) => ({
        ...s,
        loading: false,
        feedback,
        phase: "feedback",
      }));
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        phase: "playing",
        error: err instanceof Error ? err.message : "Unknown error",
      }));
    }
  }, [state.category, state.difficulty, state.transcript, state.philosopher, state.speedMode]);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return { state, startGame, sendMessage, endSession, reset };
}
