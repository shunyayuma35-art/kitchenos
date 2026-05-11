"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCharacterGame } from "@/hooks/useCharacterGame";
import type { CharItem } from "@/lib/character/logic";

const MOOD_RING: Record<string, string> = {
  happy:   "ring-emerald-400",
  warning: "ring-amber-400",
  sad:     "ring-blue-300",
  neutral: "ring-gray-300",
};

const MOOD_BUBBLE: Record<string, string> = {
  happy:   "bg-white border-emerald-200 text-emerald-800",
  warning: "bg-amber-50 border-amber-300 text-amber-900",
  sad:     "bg-blue-50 border-blue-200 text-blue-800",
  neutral: "bg-white border-gray-200 text-gray-700",
};

const MOOD_XP: Record<string, string> = {
  happy:   "bg-emerald-400",
  warning: "bg-amber-400",
  sad:     "bg-blue-300",
  neutral: "bg-gray-400",
};

interface Props {
  items:       CharItem[];
  fridgeScore: number;
}

export default function CharacterHUD({ items, fridgeScore }: Props) {
  const { mood, emoji, moodEmoji, message, level, xpPercent } =
    useCharacterGame(items, fridgeScore);

  const [bubbleOn, setBubbleOn] = useState(true);
  const [levelUp, setLevelUp]   = useState(false);
  const prevLevelRef            = useRef(level);

  useEffect(() => {
    if (level > prevLevelRef.current) {
      setLevelUp(true);
      const t = setTimeout(() => setLevelUp(false), 2500);
      prevLevelRef.current = level;
      return () => clearTimeout(t);
    }
    prevLevelRef.current = level;
  }, [level]);

  useEffect(() => {
    setBubbleOn(true);
    const t = setTimeout(() => setBubbleOn(false), 8000);
    return () => clearTimeout(t);
  }, [message]);

  return (
    <>
      {/* ── 背景ゴースト（半透明・背景層） ── */}
      <div
        className="fixed inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
        style={{ zIndex: 0 }}
        aria-hidden
      >
        <motion.span
          key={emoji}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={
            mood === "warning"
              ? { opacity: [0.08, 0.13, 0.08], scale: 1 }
              : { opacity: 0.09, scale: 1 }
          }
          transition={
            mood === "warning"
              ? { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
              : { duration: 1.2 }
          }
          style={{ fontSize: "65vw", lineHeight: 1 }}
        >
          {emoji}
        </motion.span>
      </div>

      {/* ── キャラHUD本体（fixed 右下） ── */}
      <div className="fixed bottom-24 right-3 z-[9999] flex flex-col items-end gap-2 pointer-events-none select-none">

        {/* レベルアップ演出 */}
        <AnimatePresence>
          {levelUp && (
            <motion.div
              key="levelup"
              initial={{ opacity: 0, scale: 0.7, y: 8 }}
              animate={{ opacity: 1, scale: 1,   y: 0 }}
              exit={{    opacity: 0,              y: -14 }}
              transition={{ duration: 0.35 }}
              className="bg-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md"
            >
              ✨ Lv.{level} にレベルアップ！
            </motion.div>
          )}
        </AnimatePresence>

        {/* 吹き出し */}
        <AnimatePresence mode="wait">
          {bubbleOn && (
            <motion.button
              key={message}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0  }}
              exit={{    opacity: 0, y: -6  }}
              transition={{ duration: 0.3 }}
              onClick={() => setBubbleOn(false)}
              className={`
                pointer-events-auto text-left
                relative max-w-[200px] px-3.5 py-2.5
                rounded-2xl border shadow-md text-xs font-medium leading-snug
                ${MOOD_BUBBLE[mood]}
              `}
            >
              {message}
              <span
                aria-hidden
                className="absolute -bottom-[7px] right-6 block w-[13px] h-[13px] rotate-45 border-r border-b"
                style={{ background: "inherit", borderColor: "inherit" }}
              />
            </motion.button>
          )}
        </AnimatePresence>

        {/* キャラ本体（w-28 h-28） */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1   }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          onClick={() => setBubbleOn((v) => !v)}
          className="pointer-events-auto focus:outline-none"
          aria-label="キャラクターメッセージを表示"
        >
          <motion.div
            animate={
              mood === "warning"
                ? { x: [0, -3, 3, -3, 3, 0] }
                : { x: 0 }
            }
            transition={
              mood === "warning"
                ? { repeat: Infinity, duration: 0.55, repeatDelay: 2.5, ease: "easeInOut" }
                : { duration: 0.2 }
            }
            className={`
              w-28 h-28 rounded-full bg-white
              flex flex-col items-center justify-center
              shadow-xl ring-4 ${MOOD_RING[mood]}
            `}
          >
            <span className="text-5xl leading-none">{emoji}</span>
            {/* 食材絵文字表示中はムード絵文字を小さく補足表示 */}
            {emoji !== moodEmoji && (
              <span className="text-lg leading-none mt-0.5">{moodEmoji}</span>
            )}
            <span className="text-[10px] text-gray-400 font-bold mt-1">Lv.{level}</span>
          </motion.div>
        </motion.button>

        {/* XP バー（w-28 でキャラと幅合わせ） */}
        <div className="w-28 h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${MOOD_XP[mood]}`}
            animate={{ width: `${xpPercent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

      </div>
    </>
  );
}
