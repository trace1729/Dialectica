"use client";

import { useState, useCallback, useEffect } from "react";
import { saveRoundtableRecord, saveRoundtableDraft, getRoundtableDrafts, deleteRoundtableDraft } from "@/lib/storage";
import { uuid } from "@/lib/uid";
import type { RoundtableMessage, RoundtableSubPhase } from "@/lib/types";

export interface RoundtableParticipant {
  id: string;
  name: string;
  emoji: string;
}

export interface RoundtableState {
  phase: "idle" | "loading" | "playing" | "finished";
  subPhase: RoundtableSubPhase;
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
  userParticipate: boolean;
  waitingForUser: boolean;
}

const initialState: RoundtableState = {
  phase: "idle",
  subPhase: "opening",
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
  userParticipate: false,
  waitingForUser: false,
};

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
        subPhase: draft.subPhase ?? "opening",
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
      subPhase: state.subPhase,
    });
    if (!state.draftId) setState((s) => ({ ...s, draftId: id }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.messages, state.phase, state.subPhase, state.round]);

  const startRoundtable = useCallback(async (
    philosophers: RoundtableParticipant[],
    topic: string,
    maxRounds: number,
    userParticipate = false
  ) => {
    setState((s) => ({ ...s, loading: true, error: null, philosophers, topic, maxRounds, phase: "loading", userParticipate }));
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
        subPhase: "opening",
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
    if (state.waitingForUser) return;
    const participantCount = state.speakerOrder.length || state.philosophers.length;
    const order = state.speakerOrder.length > 0
      ? state.speakerOrder
      : Array.from({ length: state.philosophers.length }, (_, i) => i);

    // ── Opening phase ──
    if (state.subPhase === "opening") {
      // Check if all openings are done — transition to freeDebate
      if (state.currentTurn >= participantCount) {
        setState((s) => ({ ...s, subPhase: "freeDebate" }));
        return;
      }

      const currentIndex = order[state.currentTurn % order.length];
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
            subPhase: "opening",
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
        const nextTurn = state.currentTurn + 1;
        const allOpeningsDone = nextTurn >= participantCount;
        setState((s) => ({
          ...s,
          loading: false,
          messages: newMessages,
          currentTurn: nextTurn,
          subPhase: allOpeningsDone ? "freeDebate" : "opening",
          round: allOpeningsDone ? 1 : s.round,
        }));
      } catch (err) {
        setState((s) => ({ ...s, loading: false, phase: "playing", error: err instanceof Error ? err.message : "Error" }));
      }
      return;
    }

    // ── Free debate phase ──
    if (state.subPhase === "freeDebate") {
      const freeDebateTurn = state.currentTurn - participantCount;
      const newRound = Math.floor(freeDebateTurn / participantCount) + 1;

      if (newRound > state.maxRounds) {
        // Free debate over, transition to closing
        setState((s) => ({ ...s, subPhase: "closing" }));
        return;
      }

      const currentIndex = order[state.currentTurn % order.length];
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
            subPhase: "freeDebate",
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
        const nextTurn = state.currentTurn + 1;
        const freeDebateTurnAfter = nextTurn - participantCount;
        const roundAfter = Math.floor(freeDebateTurnAfter / participantCount) + 1;
        const freeDebateOver = roundAfter > state.maxRounds;
        const pauseForUser = state.userParticipate && roundAfter > state.round && !freeDebateOver;

        setState((s) => ({
          ...s,
          loading: false,
          messages: newMessages,
          currentTurn: nextTurn,
          round: roundAfter,
          subPhase: freeDebateOver ? "closing" : "freeDebate",
          waitingForUser: pauseForUser,
        }));
      } catch (err) {
        setState((s) => ({ ...s, loading: false, phase: "playing", error: err instanceof Error ? err.message : "Error" }));
      }
      return;
    }

    // ── Closing phase ──
    if (state.subPhase === "closing") {
      // When closing started: currentTurn = participantCount * (1 + maxRounds)
      const totalBeforeClosing = participantCount * (1 + state.maxRounds);
      const closingTurn = state.currentTurn - totalBeforeClosing;

      if (closingTurn >= participantCount) {
        // All closings done
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

      const currentIndex = order[state.currentTurn % order.length];
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
            subPhase: "closing",
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
        const nextTurn = state.currentTurn + 1;
        const allClosingsDone = (nextTurn - totalBeforeClosing) >= participantCount;

        if (allClosingsDone) {
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
          phase: allClosingsDone ? "finished" : "playing",
          subPhase: allClosingsDone ? "closing" : "closing",
        }));
      } catch (err) {
        setState((s) => ({ ...s, loading: false, phase: "playing", error: err instanceof Error ? err.message : "Error" }));
      }
    }
  }, [state]);

  const reset = useCallback(() => {
    // If playing (user clicked 结束 mid-discussion), save and delete draft
    if (state.phase === "playing" && state.messages.length > 0) {
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
    if (state.draftId) deleteRoundtableDraft(state.draftId);
    // If already finished, record was already saved during closing phase — just reset
    setState(initialState);
  }, [state]);

  const userSpeak = useCallback((text: string) => {
    if (!state.waitingForUser) return;
    const userMsg: RoundtableMessage = {
      philosopherId: "user",
      text,
      mood: "参与",
    };
    const newMessages = [...state.messages, userMsg];
    setState((s) => ({
      ...s,
      messages: newMessages,
      waitingForUser: false,
    }));
  }, [state]);

  const startFollowUp = useCallback(async (
    philosophers: RoundtableParticipant[],
    topic: string,
    maxRounds: number,
    context: { name: string; text: string }[]
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
          context,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setState((s) => ({
        ...s,
        loading: false,
        phase: "playing",
        subPhase: "opening",
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

  return { state, startRoundtable, nextMessage, reset, startFollowUp, userSpeak };
}
