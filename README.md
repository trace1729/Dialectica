# 🌊 浪潮 (Dialectica)

[![Deployed on Vercel](https://img.shields.io/badge/deployed%20on-vercel-black?logo=vercel)](https://dialectica-indol.vercel.app/)

An AI-powered conversation practice platform. Role-play everyday scenarios, debate with historical philosophers and scientists, or host roundtable discussions — all powered by DeepSeek V4.

🔗 **Live Demo**: [dialectica-indol.vercel.app](https://dialectica-indol.vercel.app/)

## ✨ Features

- 💬 **Daily Conversation Practice** — 6 scenario categories (small talk, ordering food, workplace, social events, phone calls, conflict resolution) with NPC role-play
- 🧠🔬🏛️ **Philosophy, Science & Politics** — Chat with 22 philosophers, 27 scientists, or 30 political leaders from ancient times to the modern era
- 💻 **Tech Deep-Dives** — Discuss computer architecture, parallel programming, and LLMs with AI experts
- 🎪 **Playground** — 1v1 debates, 5-person roundtable discussions, auto-advance mode
- 🎤 **Voice Input/Output** — Web Speech API for speech recognition and TTS (Chinese)
- 📈 **Progressive Difficulty** — Easy / Medium / Hard tiers controlling response depth and reasoning effort
- ⭐ **XP & Feedback** — Post-session scoring with strengths and improvement suggestions
- 💾 **Session Persistence** — Auto-save drafts; resume unfinished conversations anytime
- ⚡ **Speed Mode** — Toggle off deep reasoning for instant responses

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, webpack) |
| Frontend | React 19, TypeScript 5, Tailwind CSS 4 |
| AI | DeepSeek V4 API (via OpenAI SDK) — `deepseek-v4-pro` / `deepseek-v4-flash` |
| Voice | Web Speech API (SpeechRecognition + SpeechSynthesis) |
| Storage | Browser localStorage (primary) + server-side JSON files (backup) |
| Auth | None — anonymous UUID identifies sessions |

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Configure API key
cp .env.example .env.local
# Edit .env.local and set DEEPSEEK_API_KEY

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 📁 Project Structure

```
├── app/
│   ├── api/                 # 14 API route endpoints
│   │   ├── scenario/        # Generate practice scenarios
│   │   ├── respond/         # NPC response generation
│   │   ├── feedback/        # Session scoring & analysis
│   │   ├── sessions/        # Session record CRUD
│   │   ├── debates/         # Debate record CRUD
│   │   ├── playground/      # Debate endpoints (scenario/respond/generate)
│   │   └── roundtable/      # Roundtable endpoints (scenario/respond/generate)
│   ├── page.tsx             # Home — topic selection + collapsible sidebar
│   ├── play/page.tsx        # Conversation screen
│   ├── playground/page.tsx  # Debate + roundtable hub
│   └── stats/page.tsx       # Session history
├── components/
│   ├── ConfirmDialog.tsx    # Delete confirmation modal
│   ├── PageTransition.tsx   # Route change fade-in animation
│   ├── ProgressBar.tsx      # Fake loading progress bar
│   └── VisualScene.tsx      # CSS-art scene rendering
├── hooks/
│   ├── useGame.ts           # Conversation state machine
│   ├── usePlayground.ts     # 1v1 debate state machine
│   ├── useRoundtable.ts     # Roundtable discussion state
│   └── useVoice.ts          # Speech recognition + TTS
├── lib/
│   ├── types.ts             # Shared TypeScript types
│   ├── prompts.ts           # All LLM prompt templates
│   ├── categories.ts        # People, fields, difficulty definitions
│   ├── deepseek.ts          # DeepSeek API client
│   ├── storage.ts           # Client-side localStorage persistence
│   ├── server-storage.ts    # Server-side JSON file storage
│   └── uid.ts               # UUID generation utility
└── docs/
    └── arch.md              # Architecture documentation
```

## 🤖 AI Model Routing

| Context | Model | Reasoning Effort |
|---|---|---|
| Daily conversation (6 categories) | `deepseek-v4-flash` | Hard → `max`, others → `high` |
| Philosophy, Tech, Playground | `deepseek-v4-pro` | Hard → `max`, others → `high` |
| Speed mode enabled | Any | Thinking disabled |

## 🔧 Environment Variables

| Variable | Description |
|---|---|
| `DEEPSEEK_API_KEY` | DeepSeek API key |

## License

MIT
