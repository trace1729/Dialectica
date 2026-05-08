"use client";

import { useState, useCallback } from "react";
import type { Category, Difficulty, Scenario, Message, Feedback, Session } from "@/lib/types";
import { saveSession } from "@/lib/storage";

export interface GameState {
  phase: "home" | "setup" | "playing" | "feedback";
  category: Category | null;
  difficulty: Difficulty | null;
  scenario: Scenario | null;
  transcript: Message[];
  feedback: Feedback | null;
  loading: boolean;
  error: string | null;
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
};

export function useGame() {
  const [state, setState] = useState<GameState>(initialState);

  const startGame = useCallback(async (category: Category, difficulty: Difficulty) => {
    setState((s) => ({ ...s, loading: true, error: null, category, difficulty, phase: "setup" }));

    try {
      const res = await fetch("/api/scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, difficulty }),
      });

      if (!res.ok) throw new Error("Failed to generate scenario");

      const scenario = (await res.json()) as Scenario;
      setState((s) => ({
        ...s,
        loading: false,
        scenario,
        transcript: [{ role: "npc" as const, text: scenario.opening }],
        phase: "playing",
      }));
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : "Unknown error",
      }));
    }
  }, []);

  const sendMessage = useCallback(async (message: string) => {
    if (!state.scenario || state.phase !== "playing") return;

    const userMessage: Message = { role: "user", text: message };
    const history = [...state.transcript, userMessage];

    setState((s) => ({ ...s, transcript: history, loading: true }));

    try {
      const res = await fetch("/api/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario: state.scenario,
          history: state.transcript,
          userMessage: message,
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
    } catch (err) {
      setState((s) => ({
        ...s,
        transcript: [...history],
        loading: false,
        error: err instanceof Error ? err.message : "Unknown error",
      }));
    }
  }, [state.scenario, state.transcript, state.phase]);

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
        }),
      });

      if (!res.ok) throw new Error("Failed to get feedback");

      const feedback = (await res.json()) as Feedback;

      const session: Session = {
        id: crypto.randomUUID(),
        category: state.category,
        difficulty: state.difficulty,
        date: new Date().toISOString(),
        transcript: state.transcript,
        ...feedback,
      };

      saveSession(session);

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
        error: err instanceof Error ? err.message : "Unknown error",
      }));
    }
  }, [state.category, state.difficulty, state.transcript]);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return { state, startGame, sendMessage, endSession, reset };
}
