"use client";

import { useState, useCallback, useEffect } from "react";
import { saveDebate as saveLocalDebate, saveDebateDraft, getDebateDrafts } from "@/lib/storage";
import { uuid } from "@/lib/uid";
import type { DebateSubPhase } from "@/lib/types";

export interface DebateMessage {
  speaker: "A" | "B";
  text: string;
  mood?: string;
  reasoningContent?: string;
}

export interface DebateState {
  phase: "idle" | "loading" | "playing" | "finished";
  subPhase: DebateSubPhase;
  title: string;
  scene: string;
  philosopherA: { name: string; emoji: string };
  philosopherB: { name: string; emoji: string };
  topicLabel: string;
  messages: DebateMessage[];
  currentSpeaker: "A" | "B";
  round: number;
  maxRounds: number;
  loading: boolean;
  error: string | null;
  draftId: string;
}

const initialState: DebateState = {
  phase: "idle",
  subPhase: "opening",
  title: "",
  scene: "",
  philosopherA: { name: "", emoji: "" },
  philosopherB: { name: "", emoji: "" },
  topicLabel: "",
  messages: [],
  currentSpeaker: "A",
  round: 1,
  maxRounds: 5,
  loading: false,
  error: null,
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

function saveDebateRecord(state: DebateState): void {
  const debate = {
    id: uuid(),
    date: new Date().toISOString(),
    philosopherA: state.philosopherA,
    philosopherB: state.philosopherB,
    topic: state.topicLabel,
    maxRounds: state.maxRounds,
    actualRounds: state.round - 1,
    messages: state.messages.map((m) => ({ speaker: m.speaker, text: m.text, mood: m.mood })),
  };
  saveLocalDebate(debate);
  const userId = getUserId();
  if (userId) {
    fetch("/api/debates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, debate }),
    }).catch(() => {});
  }
}

export function usePlayground(draftId?: string) {
  const [state, setState] = useState<DebateState>(initialState);

  // Resume from draft
  useEffect(() => {
    if (!draftId || typeof window === "undefined") return;
    const drafts = getDebateDrafts();
    const draft = drafts.find((d) => d.id === draftId);
    if (draft) {
      setState({
        ...initialState,
        phase: "playing",
        subPhase: draft.subPhase ?? "opening",
        title: draft.title,
        scene: draft.scene,
        philosopherA: draft.philosopherA,
        philosopherB: draft.philosopherB,
        topicLabel: draft.topic,
        messages: draft.messages as DebateMessage[],
        currentSpeaker: draft.currentSpeaker,
        round: draft.round,
        maxRounds: draft.maxRounds,
        draftId: draft.id,
      });
    }
  }, [draftId]);

  // Auto-save draft on state change
  useEffect(() => {
    if (state.phase !== "playing" || state.messages.length === 0) return;
    const id = state.draftId || uuid();
    saveDebateDraft({
      id,
      date: new Date().toISOString(),
      philosopherA: state.philosopherA,
      philosopherB: state.philosopherB,
      topic: state.topicLabel,
      round: state.round,
      maxRounds: state.maxRounds,
      currentSpeaker: state.currentSpeaker,
      messages: state.messages,
      title: state.title,
      scene: state.scene,
      autoMode: false,
      subPhase: state.subPhase,
    });
    if (!state.draftId) {
      setState((s) => ({ ...s, draftId: id }));
    }
  }, [state.messages, state.phase, state.subPhase, state.round, state.currentSpeaker, state.philosopherA, state.philosopherB, state.topicLabel, state.maxRounds, state.title, state.scene, state.draftId]);

  const startDebate = useCallback(async (
    philosopherAId: string,
    philosopherALabel: string,
    philosopherBId: string,
    philosopherBLabel: string,
    topic: string,
    maxRounds: number
  ) => {
    setState((s) => ({ ...s, loading: true, error: null, phase: "loading" }));

    try {
      const res = await fetch("/api/playground/scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          philosopherA: philosopherALabel,
          philosopherB: philosopherBLabel,
          topic,
          maxRounds,
        }),
      });

      if (!res.ok) throw new Error("Failed to start debate");

      const data = await res.json();
      setState((s) => ({
        ...s,
        loading: false,
        phase: "playing",
        subPhase: "opening",
        title: data.title,
        scene: data.scene,
        philosopherA: data.philosophers.a,
        philosopherB: data.philosophers.b,
        topicLabel: topic,
        messages: [data.opening],
        currentSpeaker: "B",
        round: 1,
        maxRounds,
      }));
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        phase: "idle",
        error: err instanceof Error ? err.message : "Unknown error",
      }));
    }
  }, []);

  const nextRound = useCallback(async () => {
    if (state.phase !== "playing") return;

    // Opening phase: B gives opening, then transition to freeDebate
    if (state.subPhase === "opening") {
      setState((s) => ({ ...s, loading: true }));

      try {
        const res = await fetch("/api/playground/respond", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            philosopherA: state.philosopherA.name,
            philosopherB: state.philosopherB.name,
            topic: state.topicLabel ?? "",
            currentSpeaker: state.currentSpeaker,
            history: state.messages,
            subPhase: "opening",
          }),
        });

        if (!res.ok) throw new Error("Failed to continue debate");

        const data = await res.json();
        data.speaker = "B";
        const newMessages = [...state.messages, data];

        setState((s) => ({
          ...s,
          loading: false,
          messages: newMessages,
          subPhase: "freeDebate",
          currentSpeaker: "A",
          round: 1,
        }));
      } catch (err) {
        setState((s) => ({
          ...s,
          loading: false,
          phase: "playing",
          error: err instanceof Error ? err.message : "Unknown error",
        }));
      }
      return;
    }

    // Free debate phase
    if (state.subPhase === "freeDebate") {
      // Check if free debate is over
      if (state.round >= state.maxRounds && state.currentSpeaker === "A") {
        // Transition to closing phase
        setState((s) => ({
          ...s,
          subPhase: "closing",
          currentSpeaker: "A" as const,
        }));
        return;
      }

      setState((s) => ({ ...s, loading: true }));

      try {
        const res = await fetch("/api/playground/respond", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            philosopherA: state.philosopherA.name,
            philosopherB: state.philosopherB.name,
            topic: state.topicLabel ?? "",
            currentSpeaker: state.currentSpeaker,
            history: state.messages,
            subPhase: "freeDebate",
          }),
        });

        if (!res.ok) throw new Error("Failed to continue debate");

        const data = await res.json();
        data.speaker = state.currentSpeaker;
        const newMessages = [...state.messages, data];
        const isARoundEnd = state.currentSpeaker === "B";
        const newRound = isARoundEnd ? state.round + 1 : state.round;
        const newSpeaker = isARoundEnd ? "A" : "B";
        const freeDebateOver = newRound > state.maxRounds;

        setState((s) => ({
          ...s,
          loading: false,
          messages: newMessages,
          currentSpeaker: newSpeaker as "A" | "B",
          round: newRound,
          subPhase: freeDebateOver ? "closing" : "freeDebate",
        }));
      } catch (err) {
        setState((s) => ({
          ...s,
          loading: false,
          phase: "playing",
          error: err instanceof Error ? err.message : "Unknown error",
        }));
      }
      return;
    }

    // Closing phase: A gives closing, then B gives closing, then finished
    if (state.subPhase === "closing") {
      setState((s) => ({ ...s, loading: true }));

      try {
        const res = await fetch("/api/playground/respond", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            philosopherA: state.philosopherA.name,
            philosopherB: state.philosopherB.name,
            topic: state.topicLabel ?? "",
            currentSpeaker: state.currentSpeaker,
            history: state.messages,
            subPhase: "closing",
          }),
        });

        if (!res.ok) throw new Error("Failed to continue debate");

        const data = await res.json();
        data.speaker = state.currentSpeaker;
        const newMessages = [...state.messages, data];
        const isLastClosing = state.currentSpeaker === "B";

        const newState = {
          ...state,
          loading: false,
          messages: newMessages,
          currentSpeaker: (isLastClosing ? "A" : "B") as "A" | "B",
          phase: isLastClosing ? ("finished" as const) : ("playing" as const),
          subPhase: isLastClosing ? ("closing" as const) : ("closing" as const),
        };

        if (isLastClosing) {
          saveDebateRecord(newState);
        }

        setState(newState);
      } catch (err) {
        setState((s) => ({
          ...s,
          loading: false,
          phase: "playing",
          error: err instanceof Error ? err.message : "Unknown error",
        }));
      }
    }
  }, [state]);

  const reset = useCallback(() => {
    if (state.phase === "finished" && state.messages.length > 0) {
      saveDebateRecord(state);
    }
    setState(initialState);
  }, [state]);

  const continueDebate = useCallback((extraRounds: number) => {
    if (state.phase !== "finished") return;
    setState((s) => ({
      ...s,
      phase: "playing",
      subPhase: "freeDebate",
      maxRounds: s.maxRounds + extraRounds,
      currentSpeaker: "A" as const,
      round: 1,
    }));
  }, [state.phase]);

  return { state, startDebate, nextRound, reset, continueDebate };
}
