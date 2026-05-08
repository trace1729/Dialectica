"use client";

import { useState, useEffect } from "react";

interface ProgressBarProps {
  label?: string;
}

export default function ProgressBar({ label = "生成中..." }: ProgressBarProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 85) return 85;
        const increment = Math.random() * 8 + 2;
        return Math.min(85, p + increment);
      });
    }, 400);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-xs mx-auto">
      <div className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-gray-900 dark:bg-gray-100 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );
}
