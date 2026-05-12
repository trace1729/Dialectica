"use client";

import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useGame } from "@/hooks/useGame";
import { useVoice } from "@/hooks/useVoice";
import { getCategoryLabel, getDifficultyLabel, SCIENTISTS, POLITICIANS } from "@/lib/categories";
import VisualScene from "@/components/VisualScene";
import ProgressBar from "@/components/ProgressBar";
import type { Category, Difficulty } from "@/lib/types";

function PlayContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [textInput, setTextInput] = useState("");
  const [voiceMode, setVoiceMode] = useState(searchParams.get("voice") === "1");
  const [showReasoning, setShowReasoning] = useState(false);

  const category = searchParams.get("category") as Category | null;
  const difficulty = searchParams.get("difficulty") as Difficulty | null;
  const philosopher = searchParams.get("philosopher") ?? undefined;
  const speedMode = searchParams.get("speed") === "1";
  const seminarMode = searchParams.get("seminar") === "1";
  const customTopic = searchParams.get("customTopic") ?? undefined;
  const draftId = searchParams.get("draft") ?? undefined;

  const { state, startGame, sendMessage, endSession } = useGame(draftId);

  const handleVoiceResult = useCallback(
    (transcript: string) => { sendMessage(transcript); },
    [sendMessage]
  );

  const { isListening, isSupported, startListening, stopListening, speak } =
    useVoice({ onResult: handleVoiceResult });

  useEffect(() => {
    if (category && difficulty && state.phase === "home" && !draftId) {
      startGame(category, difficulty, philosopher, speedMode, customTopic, seminarMode);
    }
  }, [category, difficulty, philosopher, speedMode, state.phase, startGame, draftId, customTopic, seminarMode]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.transcript]);

  useEffect(() => {
    if (state.phase === "playing" && state.transcript.length > 0) {
      const lastMsg = state.transcript[state.transcript.length - 1];
      if (lastMsg.role === "npc") {
        speak(lastMsg.text);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.transcript, state.phase]);

  function handleSend() {
    const msg = textInput.trim();
    if (!msg || state.loading) return;
    sendMessage(msg);
    setTextInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleToggleVoice() {
    if (voiceMode) {
      stopListening();
    }
    setVoiceMode(!voiceMode);
  }

  if (state.phase === "home" || state.phase === "setup") {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-6 gap-4">
        <ProgressBar label="正在生成你的练习场景..." />
      </div>
    );
  }

  if (state.phase === "feedback" && state.feedback) {
    return (
      <div className="flex flex-col flex-1 p-6 max-w-lg mx-auto w-full font-sans">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
          会话反馈
        </h2>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-900 dark:bg-gray-100 mb-3">
            <span className="text-3xl font-bold text-white dark:text-gray-900">
              {state.feedback.score}
            </span>
          </div>
          <p className="text-sm text-gray-400">总分 10 分</p>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2 uppercase tracking-wide">
            做得好的地方
          </h3>
          <ul className="space-y-2">
            {state.feedback.strengths.map((s, i) => (
              <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2">
                <span className="text-green-500 shrink-0">+</span> {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2 uppercase tracking-wide">
            可以改进的地方
          </h3>
          <ul className="space-y-2">
            {state.feedback.improvements.map((imp, i) => (
              <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2">
                <span className="text-amber-500 shrink-0">→</span> {imp}
              </li>
            ))}
          </ul>
        </div>

        <div className="text-center mb-6">
          <span className="text-sm font-medium text-gray-500">
            +{state.feedback.xpEarned} XP 获得
          </span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/stats")}
            className="flex-1 p-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            查看历史
          </button>
          <button
            onClick={() => router.push("/")}
            className="flex-1 p-3 rounded-xl bg-gray-900 text-white font-medium hover:opacity-90 dark:bg-gray-100 dark:text-gray-900"
          >
            再来一次
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 max-w-lg mx-auto w-full font-sans">
      {category && <VisualScene category={category} />}

      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">
            {(() => {
              if (category === "philosophy" && philosopher) {
                if (SCIENTISTS.some((s) => s.id === philosopher)) return "科学对话";
                if (POLITICIANS.some((p) => p.id === philosopher)) return "政治对话";
              }
              return category ? getCategoryLabel(category) : "";
            })()}
            {difficulty ? ` · ${getDifficultyLabel(difficulty)}` : ""}
          </p>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            与 {state.scenario?.npc.name ?? "NPC"} 对话中
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowReasoning(!showReasoning)}
            className={`text-xs px-2 py-1.5 rounded-lg font-medium transition-colors ${
              showReasoning
                ? "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
            }`}>💭</button>
          <button
            onClick={() => { if (confirm("确定要返回主界面吗？当前对话将丢失。")) router.push("/"); }}
            className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
          >
            返回
          </button>
          <button
            onClick={endSession}
            disabled={state.loading}
            className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 font-medium hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 disabled:opacity-50"
          >
            结束
          </button>
        </div>
      </div>

      {state.scenario && (
        <div className="mx-4 mt-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">场景</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">{state.scenario.scene}</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {state.error && (
          <div className="text-center p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
            <p className="text-xs text-red-600 dark:text-red-400">⚠ {state.error}</p>
          </div>
        )}
        {state.transcript.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className="max-w-[80%] space-y-1">
                  <div
                    className={`p-3 rounded-2xl text-sm ${
                      msg.role === "user"
                        ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 rounded-br-md"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 rounded-bl-md"
                    }`}
                  >
                    {msg.text}
                  </div>
                  {showReasoning && msg.role === "npc" && msg.reasoningContent && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 italic leading-relaxed px-2 py-1 border-l-2 border-purple-300 dark:border-purple-600 bg-purple-50/50 dark:bg-purple-950/30 rounded-r">
                      {msg.reasoningContent}
                    </div>
                  )}
                </div>
              </div>
        ))}
        {state.loading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-3 rounded-2xl bg-gray-100 dark:bg-gray-800 rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.1s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        {voiceMode ? (
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleVoice}
              className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
            >
              键盘
            </button>
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={state.loading || !isSupported}
              className={`flex-1 p-3 rounded-xl text-center font-medium transition-all ${
                isListening
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
              } disabled:opacity-50`}
            >
              {!isSupported
                ? "浏览器不支持语音"
                : isListening
                  ? "正在听..."
                  : "点击说话"}
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleToggleVoice}
              className={`p-3 rounded-xl text-xs font-medium ${
                isSupported
                  ? "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800"
              }`}
              disabled={!isSupported}
              title={isSupported ? "切换到语音输入" : "浏览器不支持语音"}
            >
              🎤
            </button>
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={state.loading}
              placeholder="输入你的回复..."
              className="flex-1 p-3 rounded-xl bg-gray-100 text-gray-900 placeholder-gray-400 text-sm outline-none focus:ring-2 focus:ring-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={state.loading || !textInput.trim()}
              className="p-3 px-5 rounded-xl bg-gray-900 text-white font-medium text-sm hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed dark:bg-gray-100 dark:text-gray-900"
            >
              发送
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col flex-1 items-center justify-center p-6 gap-4">
          <ProgressBar label="加载中..." />
        </div>
      }
    >
      <PlayContent />
    </Suspense>
  );
}
