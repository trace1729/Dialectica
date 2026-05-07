# Conversation Trainer — Design Spec

## Overview

A web application that helps users practice everyday conversations. It generates random daily-life scenarios using an LLM, engages the user in multi-turn role-play conversations, then analyzes their responses and provides feedback and scores.

## Requirements

- Generate everyday scenarios with categories and difficulty tiers
- Multi-turn role-play: AI plays the NPC, user converses
- Analyze user's word choice and tone, provide feedback and score (1-10)
- Both text and voice input
- Level/progression system with XP
- Session-only (no auth), progress stored in localStorage
- Optional visual scene rendering (CSS/SVG)

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **LLM**: DeepSeek API (OpenAI-compatible)
- **Voice Input**: Web Speech API (SpeechRecognition)
- **Voice Output**: Web Speech API (SpeechSynthesis)
- **Storage**: localStorage
- **Styling**: Tailwind CSS

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Next.js App                       │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │  Pages   │  │  Hooks   │  │  lib/ (utilities)  │  │
│  │  /       │  │ useGame  │  │  storage.ts        │  │
│  │  /play   │  │ useVoice │  │  prompts.ts        │  │
│  │  /stats  │  │          │  │  categories.ts     │  │
│  └────┬─────┘  └────┬─────┘  └───────────────────┘  │
│       │              │                                │
│  ┌────┴──────────────┴─────┐                         │
│  │     API Routes           │                         │
│  │  /api/scenario           │  → POST (generate)      │
│  │  /api/respond            │  → POST (conversation)  │
│  │  /api/feedback           │  → POST (analysis)      │
│  └──────────┬───────────────┘                         │
└─────────────┼─────────────────────────────────────────┘
              │
         DeepSeek API
```

## Pages

- **`/`** — Home: select category, difficulty. Shows current progress (XP, level).
- **`/play`** — Conversation screen: NPC and user messages, text/voice toggle, end session button.
- **`/stats`** — History: past sessions, scores, progress per category.

## Conversation Flow

1. User selects category + difficulty on Home
2. POST `/api/scenario` → DeepSeek returns scene description, NPC details, opening line
3. User and NPC exchange messages (multi-turn) via POST `/api/respond`
4. User clicks "End Session" → POST `/api/feedback` → DeepSeek analyzes transcript
5. Results displayed, saved to localStorage

## Categories & Difficulty

**Categories**: small talk, ordering food, workplace, social event, phone call, conflict resolution

**Difficulty tiers**:
- Easy: 2-3 turns, straightforward scenarios
- Medium: 4-6 turns, some nuance
- Hard: 7+ turns, complex situations (misunderstandings, conflict)

## API Routes

### POST `/api/scenario`
- **Input**: `{ category, difficulty }`
- **Output**: `{ scene, npc: { name, role, tone }, opening, visual? }`
- **Prompt**: System prompt instructs DeepSeek to generate a scene matching category+difficulty

### POST `/api/respond`
- **Input**: `{ history: Message[], userMessage: string }`
- **Output**: `{ npcResponse: string, npcMood: string }`
- **Prompt**: System prompt instructs DeepSeek to role-play as the NPC within the scene context

### POST `/api/feedback`
- **Input**: `{ category, difficulty, transcript: Message[] }`
- **Output**: `{ score, strengths[], improvements[], xpEarned }`
- **Prompt**: System prompt instructs DeepSeek to evaluate conversation quality

## LLM Prompts

All prompts defined in `lib/prompts.ts` as template functions. DeepSeek API via OpenAI-compatible SDK.

## localStorage Schema

```ts
Key: "conversation-practice"
{
  sessions: Array<{
    id: string,
    category: string,
    difficulty: "easy" | "medium" | "hard",
    date: string,
    transcript: Array<{ role: "user" | "npc", text: string }>,
    score: number,
    strengths: string[],
    improvements: string[],
    xpEarned: number
  }>,
  stats: {
    totalXP: number,
    sessionsCompleted: number,
    categoryXP: Record<string, number>
  }
}
```

## Voice & Visual

- **Voice Input**: Web Speech API SpeechRecognition, toggle button to switch text/voice
- **Voice Output**: Browser TTS SpeechSynthesis to read NPC lines
- **Visual Scene**: CSS/SVG scene rendering based on category and `visual` field from scenario API (optional, MVP can skip)

## Error Handling

- API timeout (>30s): Show retry button
- DeepSeek API errors: Graceful message, log to console
- Voice recognition failure: Fall back to text input with notice
- localStorage full: Trim oldest 50% of sessions

## Scope

- No authentication or server-side user storage
- No database
- No image generation (CSS/SVG only for visual scenes)
- Single user, single device

## Open Questions

- None
