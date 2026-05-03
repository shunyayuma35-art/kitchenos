"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "pashashoku_onboarded";

export default function Onboarding() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setShow(true);
  }, []);

  function handleStart() {
    localStorage.setItem(STORAGE_KEY, "1");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center
                    bg-gradient-to-b from-amber-500 to-amber-700 px-8 text-center">
      <div className="text-7xl mb-6 animate-bounce-slow">🍱</div>

      <h1 className="text-white text-5xl font-bold tracking-tight mb-2">パシャ食</h1>

      <p className="text-white/90 text-xl font-medium mb-4 leading-snug">
        冷蔵庫を、<br />おいしく使いきろう
      </p>

      <p className="text-white/70 text-sm mb-12 leading-relaxed">
        食材を入れるだけ。<br />今日の献立をAIが考えます。
      </p>

      <button
        onClick={handleStart}
        className="w-full max-w-xs py-4 bg-white text-amber-600 font-bold text-lg
                   rounded-2xl shadow-xl active:scale-95 transition-transform"
      >
        はじめる
      </button>

      <p className="text-white/40 text-xs mt-6">完全無料・インストール不要</p>
    </div>
  );
}
