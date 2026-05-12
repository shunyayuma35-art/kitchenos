"use client";

import { useState, useEffect } from "react";
import { resolveCharacterState } from "@/lib/character/logic";
import type { CharItem } from "@/lib/character/logic";

interface Props {
  items:       CharItem[];
  fridgeScore: number;
}

export default function CharacterHUD({ items, fridgeScore }: Props) {
  const state = resolveCharacterState(items, fridgeScore);
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    setMsgIdx(0);
  }, [state.mood]);

  useEffect(() => {
    if (state.messages.length <= 1) return;
    const t = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % state.messages.length);
    }, 5000);
    return () => clearInterval(t);
  }, [state.messages.length, state.mood]);

  const message = state.messages[msgIdx % state.messages.length];

  return (
    <div
      className="fixed bottom-24 right-3 z-[9999] flex flex-col items-end gap-2 pointer-events-none select-none"
    >
      {/* 吹き出し */}
      <div className="max-w-[180px] px-3 py-2 bg-white border border-gray-200 rounded-2xl shadow-md text-xs text-gray-700 leading-snug">
        {message}
      </div>

      {/* キャラ本体 */}
      <div className="w-16 h-16 rounded-full bg-white border-2 border-gray-200 shadow-md flex items-center justify-center text-4xl">
        {state.emoji}
      </div>
    </div>
  );
}
