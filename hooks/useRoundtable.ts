"use client";

import { useState, useCallback, useEffect } from "react";
import { saveRoundtableRecord, saveRoundtableDraft, getRoundtableDrafts, deleteRoundtableDraft } from "@/lib/storage";
import { uuid } from "@/lib/uid";
import type { RoundtableMessage } from "@/lib/types";

export interface RoundtableParticipant {
  id: string;
  name: string;
  emoji: string;
}

export interface RoundtableState {
  phase: "idle" | "loading" | "playing" | "finished";
  title: string;
  scene: string;
  philosophers: RoundtableParticipant[];
  topic: string;
  messages: RoundtableMessage[];
  speakerOrder: number[];
  currentTurn: number;
  round: number;
  maxRounds: number;
  loading: boolean;
  error: string | null;
  draftId: string;
}

const initialState: RoundtableState = {
  phase: "idle",
  title: "",
  scene: "",
  philosophers: [],
  topic: "",
  messages: [],
  speakerOrder: [],
  currentTurn: 0,
  round: 1,
  maxRounds: 3,
  loading: false,
  error: null,
  draftId: "",
};

function getUserId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("ct_user_id");
  if (!id) { id = uuid(); localStorage.setItem("ct_user_id", id); }
  return id;
}

export function useRoundtable(draftId?: string) {
  const [state, setState] = useState<RoundtableState>(initialState);

  // Resume from draft
  useEffect(() => {
    if (!draftId || typeof window === "undefined") return;
    const drafts = getRoundtableDrafts();
    const draft = drafts.find((d) => d.id === draftId);
    if (draft) {
      setState({
        ...initialState,
        phase: "playing",
        title: draft.title,
        scene: draft.scene,
        philosophers: draft.philosophers,
        topic: draft.topic,
        messages: draft.messages,
        speakerOrder: [],
        currentTurn: draft.messages.length,
        round: draft.round,
        maxRounds: draft.maxRounds,
        draftId: draft.id,
      });
    }
  }, [draftId]);

  // Auto-save draft
  useEffect(() => {
    if (state.phase !== "playing" || state.messages.length === 0) return;
    const id = state.draftId || uuid();
    saveRoundtableDraft({
      id,
      date: new Date().toISOString(),
      philosophers: state.philosophers,
      topic: state.topic,
      round: state.round,
      maxRounds: state.maxRounds,
      nextSpeaker: state.philosophers[state.speakerOrder[state.currentTurn % state.speakerOrder.length]]?.id ?? "",
      messages: state.messages,
      title: state.title,
      scene: state.scene,
    });
    if (!state.draftId) setState((s) => ({ ...s, draftId: id }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.messages, state.phase, state.round]);

  const startRoundtable = useCallback(async (
    philosophers: RoundtableParticipant[],
    topic: string,
    maxRounds: number
  ) => {
    setState((s) => ({ ...s, loading: true, error: null, philosophers, topic, maxRounds, phase: "loading" }));
    try {
      const res = await fetch("/api/roundtable/scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          philosophers: philosophers.map((p) => p.name),
          topic,
          maxRounds,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setState((s) => ({
        ...s,
        loading: false,
        phase: "playing",
        title: data.title,
        scene: data.scene,
        messages: [{ philosopherId: philosophers[data.opening.philosopherIndex]?.id ?? philosophers[0].id, text: data.opening.text, mood: data.opening.mood }],
        speakerOrder: data.speakerOrder ?? Array.from({ length: philosophers.length }, (_, i) => i),
        currentTurn: 1,
        round: 1,
      }));
    } catch (err) {
      setState((s) => ({ ...s, loading: false, phase: "idle", error: err instanceof Error ? err.message : "Error" }));
    }
  }, []);

  const nextMessage = useCallback(async () => {
    if (state.phase !== "playing") return;
    const turn = state.currentTurn;
    const participantCount = state.speakerOrder.length || state.philosophers.length;
    const newRound = Math.floor(turn / participantCount) + 1;
    if (newRound > state.maxRounds) {
      // Save and finish
      saveRoundtableRecord({
        id: uuid(),
        date: new Date().toISOString(),
        philosophers: state.philosophers,
        topic: state.topic,
        maxRounds: state.maxRounds,
        actualRounds: state.maxRounds,
        messages: state.messages,
        title: state.title,
        scene: state.scene,
      });
      if (state.draftId) deleteRoundtableDraft(state.draftId);
      setState((s) => ({ ...s, phase: "finished" as const }));
      return;
    }

    const order = state.speakerOrder.length > 0
      ? state.speakerOrder
      : Array.from({ length: state.philosophers.length }, (_, i) => i);
    const currentIndex = order[turn % order.length];

    setState((s) => ({ ...s, loading: true }));
    try {
      const res = await fetch("/api/roundtable/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          philosophers: state.philosophers.map((p) => p.name),
          topic: state.topic,
          currentIndex,
          history: state.messages.map((m) => {
            const idx = state.philosophers.findIndex((p) => p.id === m.philosopherId);
            return { philosopherIndex: idx >= 0 ? idx : 0, text: m.text };
          }),
          speakerOrder: order,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      const philosopher = state.philosophers[currentIndex];
      const newMessages = [...state.messages, {
        philosopherId: philosopher?.id ?? "",
        text: data.text,
        mood: data.mood,
        reasoningContent: data.reasoningContent,
      }];
      const nextTurn = turn + 1;
      const finished = Math.floor(nextTurn / (state.speakerOrder.length || state.philosophers.length)) + 1 > state.maxRounds;

      if (finished) {
        saveRoundtableRecord({
          id: uuid(),
          date: new Date().toISOString(),
          philosophers: state.philosophers,
          topic: state.topic,
          maxRounds: state.maxRounds,
          actualRounds: state.maxRounds,
          messages: newMessages,
          title: state.title,
          scene: state.scene,
        });
        if (state.draftId) deleteRoundtableDraft(state.draftId);
      }

      setState((s) => ({
        ...s,
        loading: false,
        messages: newMessages,
        currentTurn: nextTurn,
        round: Math.floor(nextTurn / participantCount) + 1,
        phase: finished ? "finished" : "playing",
      }));
    } catch (err) {
      setState((s) => ({ ...s, loading: false, phase: "playing", error: err instanceof Error ? err.message : "Error" }));
    }
  }, [state]);

  const reset = useCallback(() => {
    if (state.messages.length > 0 && state.phase === "finished") {
      saveRoundtableRecord({
        id: uuid(),
        date: new Date().toISOString(),
        philosophers: state.philosophers,
        topic: state.topic,
        maxRounds: state.maxRounds,
        actualRounds: state.maxRounds,
        messages: state.messages,
        title: state.title,
        scene: state.scene,
      });
    }
    setState(initialState);
  }, [state]);

  return { state, startRoundtable, nextMessage, reset };
}
