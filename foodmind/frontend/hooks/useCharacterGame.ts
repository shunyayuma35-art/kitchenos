"use client";

import { useState, useEffect, useRef } from "react";
import { resolveCharacterState, calcXpDelta } from "@/lib/character/logic";
import type { CharItem } from "@/lib/character/logic";

const XP_PER_LEVEL = 100;

interface GameState {
  xp:      number;
  level:   number;
  totalXp: number;
}

export interface CharacterGameReturn {
  mood:      "happy" | "warning" | "sad" | "neutral";
  emoji:     string;
  moodEmoji: string;
  message:   string;
  level:     number;
  xp:        number;
  xpPercent: number;
}

export function useCharacterGame(
  items: CharItem[],
  fridgeScore: number
): CharacterGameReturn {
  const charState = resolveCharacterState(items, fridgeScore);

  const [gameState, setGameState] = useState<GameState>({ xp: 0, level: 1, totalXp: 0 });
  const [msgIdx, setMsgIdx]       = useState(0);

  // Stable key: only recompute XP when actual data changes
  const stateKey    = `${items.map((i) => `${i.name}:${i.daysLeft}`).join(",")}|${fridgeScore}`;
  const prevKeyRef  = useRef("");
  const itemsRef    = useRef(items);
  const scoreRef    = useRef(fridgeScore);
  itemsRef.current  = items;
  scoreRef.current  = fridgeScore;

  // XP: update only on data change, not on every render
  useEffect(() => {
    if (prevKeyRef.current === stateKey) return;
    prevKeyRef.current = stateKey;

    const delta = calcXpDelta(itemsRef.current, scoreRef.current);
    if (delta === 0) return;

    setGameState((prev) => {
      const newTotal = Math.max(0, prev.totalXp + delta);
      const newLevel = Math.floor(newTotal / XP_PER_LEVEL) + 1;
      const newXp    = newTotal % XP_PER_LEVEL;
      return { xp: newXp, level: newLevel, totalXp: newTotal };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateKey]);

  // Reset message index on mood change
  useEffect(() => {
    setMsgIdx(0);
  }, [charState.mood]);

  // Cycle messages every 5 seconds when multiple exist
  useEffect(() => {
    if (charState.messages.length <= 1) return;
    const t = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % charState.messages.length);
    }, 5000);
    return () => clearInterval(t);
  }, [charState.messages.length, charState.mood]);

  return {
    mood:      charState.mood,
    emoji:     charState.emoji,
    moodEmoji: charState.moodEmoji,
    message:   charState.messages[msgIdx % charState.messages.length],
    level:     gameState.level,
    xp:        gameState.xp,
    xpPercent: (gameState.xp / XP_PER_LEVEL) * 100,
  };
}
