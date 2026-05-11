"use client";

import { useState, useEffect } from "react";

// ─── 定数 ─────────────────────────────────────────────────────
export const RANDOM_CHANCE = 0.20; // ランダム出現確率 — ここで調整
export const RARE_CHANCE   = 0.01; // レアキャラ出現確率（1%）— ここで調整

type Animation = "purru" | "jump";
type Intensity = "low" | "mid" | "high";
type RareEffect = "glow" | "cold" | "aurora" | "stardust";

interface CharDef {
  name:      string;
  anim:      Animation;
  intensity: Intensity;
  Svg:       React.ComponentType;
}

interface RareCharDef extends CharDef {
  effect: RareEffect;
}

const ANIM_CLASS: Record<Animation, Record<Intensity, string>> = {
  purru: { low: "animate-purru-low", mid: "animate-purru-mid", high: "animate-purru-high" },
  jump:  { low: "animate-jump-low",  mid: "animate-jump-mid",  high: "animate-jump-high"  },
};

// ─── 共通 SVG パーツ ───────────────────────────────────────────
function Shad() {
  return <ellipse cx="50" cy="112" rx="18" ry="3.5" fill="#000" opacity="0.07" />;
}

function Face({ cy = 68 }: { cy?: number }) {
  return (
    <>
      <g className="animate-veggie-eye-blink">
        <circle cx="40" cy={cy}         r="6.5" fill="white" />
        <circle cx="41" cy={cy + 1}     r="3.5" fill="#1A1A1A" />
        <circle cx="42.5" cy={cy - 1.5} r="1.4" fill="white" />
        <circle cx="43.5" cy={cy + 2}   r="0.6" fill="white" />
      </g>
      <g className="animate-veggie-eye-blink">
        <circle cx="60" cy={cy}         r="6.5" fill="white" />
        <circle cx="61" cy={cy + 1}     r="3.5" fill="#1A1A1A" />
        <circle cx="62.5" cy={cy - 1.5} r="1.4" fill="white" />
        <circle cx="63.5" cy={cy + 2}   r="0.6" fill="white" />
      </g>
      <ellipse cx="30" cy={cy + 8} rx="8" ry="5" fill="#FF8FAB" opacity="0.5" />
      <ellipse cx="70" cy={cy + 8} rx="8" ry="5" fill="#FF8FAB" opacity="0.5" />
      <path
        d={`M 40 ${cy + 11} Q 50 ${cy + 21} 60 ${cy + 11}`}
        stroke="#1A1A1A" strokeWidth="2.5" fill="none" strokeLinecap="round"
      />
    </>
  );
}

// ─── 曜日キャラクター ─────────────────────────────────────────

// 月: かぼちゃ (purru-low)
function SvgPumpkin() {
  return (
    <svg viewBox="0 0 100 115" className="w-24 h-28" xmlns="http://www.w3.org/2000/svg">
      <Shad />
      <rect x="44" y="18" width="12" height="14" rx="5" fill="#4A7C28" />
      <path d="M 50 20 Q 62 12 65 6" stroke="#5B8B36" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="50" cy="68" rx="30" ry="30" fill="#F5882A" />
      <ellipse cx="28" cy="68" rx="16" ry="24" fill="#F59230" />
      <ellipse cx="72" cy="68" rx="16" ry="24" fill="#F59230" />
      <ellipse cx="50" cy="64" rx="20" ry="28" fill="#F5882A" />
      <path d="M 50 36 Q 47 58 48 98" stroke="#E07010" strokeWidth="2" fill="none" opacity="0.4" />
      <path d="M 50 36 Q 53 58 52 98" stroke="#E07010" strokeWidth="2" fill="none" opacity="0.4" />
      <ellipse cx="36" cy="50" rx="5" ry="9" fill="#FACA8A" opacity="0.4" />
      <Face cy={68} />
    </svg>
  );
}

// 火: たまねぎ (purru-low)
function SvgOnion() {
  return (
    <svg viewBox="0 0 100 115" className="w-24 h-28" xmlns="http://www.w3.org/2000/svg">
      <Shad />
      <path d="M 44 26 Q 40 12 38 5"  stroke="#4A9E28" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M 56 26 Q 60 12 62 5"  stroke="#4A9E28" strokeWidth="4" fill="none" strokeLinecap="round" />
      <ellipse cx="50" cy="28" rx="12" ry="6" fill="#5BAE36" />
      <ellipse cx="50" cy="70" rx="28" ry="34" fill="#B89AC8" />
      <ellipse cx="50" cy="72" rx="22" ry="28" fill="#CDB0DC" />
      <ellipse cx="50" cy="74" rx="16" ry="22" fill="#DDC8EC" />
      <ellipse cx="38" cy="50" rx="5"  ry="10" fill="white" opacity="0.3" />
      <Face cy={72} />
    </svg>
  );
}

// 水: おさかな (jump-mid)
function SvgFish() {
  return (
    <svg viewBox="0 0 100 115" className="w-24 h-28" xmlns="http://www.w3.org/2000/svg">
      <Shad />
      {/* 尾びれ */}
      <path d="M 36 96 Q 20 108 18 114 L 50 110 L 82 114 Q 80 108 64 96 Z" fill="#6EB8E8" />
      {/* 胸びれ左右 */}
      <path d="M 22 62 Q 12 50 14 40 Q 24 56 28 64 Z" fill="#6EB8E8" />
      <path d="M 78 62 Q 88 50 86 40 Q 76 56 72 64 Z" fill="#6EB8E8" />
      {/* 背びれ */}
      <path d="M 38 26 Q 50 14 62 26 L 58 36 L 42 36 Z" fill="#6EB8E8" />
      {/* 胴体 */}
      <ellipse cx="50" cy="62" rx="28" ry="36" fill="#9AD0F5" />
      {/* お腹 */}
      <ellipse cx="50" cy="70" rx="18" ry="26" fill="#C8E8FF" />
      <ellipse cx="36" cy="44" rx="5"  ry="9"  fill="white" opacity="0.3" />
      <Face cy={62} />
    </svg>
  );
}

// 木: たこ (jump-mid)
function SvgOctopus() {
  return (
    <svg viewBox="0 0 100 115" className="w-24 h-28" xmlns="http://www.w3.org/2000/svg">
      <Shad />
      {/* 触手 5本 */}
      <path d="M 28 76 Q 20 90 24 108" stroke="#E0607A" strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M 38 80 Q 32 95 36 110" stroke="#E0607A" strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M 50 82 Q 50 96 52 112" stroke="#E0607A" strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M 62 80 Q 68 95 64 110" stroke="#E0607A" strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M 72 76 Q 80 90 76 108" stroke="#E0607A" strokeWidth="8" fill="none" strokeLinecap="round" />
      {/* 吸盤 */}
      <circle cx="24" cy="107" r="3.5" fill="#F090A8" />
      <circle cx="36" cy="109" r="3.5" fill="#F090A8" />
      <circle cx="52" cy="111" r="3.5" fill="#F090A8" />
      <circle cx="64" cy="109" r="3.5" fill="#F090A8" />
      <circle cx="76" cy="107" r="3.5" fill="#F090A8" />
      {/* 頭 */}
      <ellipse cx="50" cy="54" rx="32" ry="30" fill="#F07090" />
      <ellipse cx="36" cy="36" rx="8"  ry="12" fill="#F8A8BC" opacity="0.5" />
      <Face cy={54} />
    </svg>
  );
}

// 金: たまご (purru-low)
function SvgEgg() {
  return (
    <svg viewBox="0 0 100 115" className="w-24 h-28" xmlns="http://www.w3.org/2000/svg">
      <Shad />
      <ellipse cx="50" cy="66" rx="28" ry="36" fill="#F5F0E0" />
      <ellipse cx="50" cy="64" rx="26" ry="34" fill="#FDFAF3" />
      <ellipse cx="38" cy="44" rx="6"  ry="11" fill="white"   opacity="0.6" />
      <Face cy={66} />
    </svg>
  );
}

// 土: ブロッコリー (purru-low)
function SvgBroccoli() {
  return (
    <svg viewBox="0 0 100 115" className="w-24 h-28" xmlns="http://www.w3.org/2000/svg">
      <rect x="43" y="86" width="14" height="22" rx="6" fill="#4A7C28" />
      <Shad />
      <circle cx="50" cy="64" r="28" fill="#5CB83A" />
      <circle cx="28" cy="56" r="20" fill="#63C43F" />
      <circle cx="72" cy="56" r="20" fill="#63C43F" />
      <circle cx="50" cy="42" r="22" fill="#63C43F" />
      <circle cx="32" cy="44" r="16" fill="#75D150" />
      <circle cx="68" cy="44" r="16" fill="#75D150" />
      <circle cx="50" cy="30" r="19" fill="#75D150" />
      <circle cx="38" cy="34" r="12" fill="#85DC60" />
      <circle cx="62" cy="34" r="12" fill="#85DC60" />
      <circle cx="50" cy="20" r="13" fill="#85DC60" />
      <ellipse cx="50" cy="72" rx="20" ry="16" fill="#5CB83A" />
      <Face cy={68} />
    </svg>
  );
}

// 日: いちご (purru-low)
function SvgStrawberry() {
  const seeds: [number, number][] = [
    [40, 58], [50, 54], [60, 58],
    [36, 70], [46, 68], [56, 68], [64, 70],
    [40, 82], [50, 84], [60, 82],
  ];
  return (
    <svg viewBox="0 0 100 115" className="w-24 h-28" xmlns="http://www.w3.org/2000/svg">
      <Shad />
      <path d="M 50 28 Q 38 16 30 20 Q 38 28 44 32" fill="#5CB83A" />
      <path d="M 50 28 Q 50 12 50 6 Q 52 18 56 28"  fill="#5CB83A" />
      <path d="M 50 28 Q 62 16 70 20 Q 62 28 56 32" fill="#5CB83A" />
      <ellipse cx="50" cy="28" rx="10" ry="6" fill="#6DC848" />
      <ellipse cx="50" cy="72" rx="26" ry="35" fill="#F04040" />
      <ellipse cx="50" cy="70" rx="24" ry="33" fill="#F55050" />
      {seeds.map(([cx, cy], i) => (
        <ellipse key={i} cx={cx} cy={cy} rx="1.8" ry="2.4" fill="#FFCC44" />
      ))}
      <ellipse cx="38" cy="50" rx="5" ry="10" fill="white" opacity="0.25" />
      <Face cy={70} />
    </svg>
  );
}

// ─── ランダムキャラクター ─────────────────────────────────────

// にんじん (purru-mid)
function SvgCarrot() {
  return (
    <svg viewBox="0 0 100 115" className="w-24 h-28" xmlns="http://www.w3.org/2000/svg">
      <Shad />
      <path d="M 42 26 Q 34 12 30 6"  stroke="#5CB83A" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <path d="M 50 22 Q 50 6  50 0"  stroke="#5CB83A" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <path d="M 58 26 Q 66 12 70 6"  stroke="#5CB83A" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <ellipse cx="50" cy="28" rx="14" ry="8" fill="#6DC848" />
      <path d="M 36 28 Q 30 60 50 108 Q 70 60 64 28 Z" fill="#FF8020" />
      <path d="M 38 28 Q 33 60 50 104 Q 67 60 62 28 Z" fill="#FFA040" />
      <path d="M 38 50 Q 50 46 62 50" stroke="#E06010" strokeWidth="1.8" fill="none" />
      <path d="M 37 64 Q 50 60 63 64" stroke="#E06010" strokeWidth="1.8" fill="none" />
      <path d="M 38 78 Q 50 74 62 78" stroke="#E06010" strokeWidth="1.8" fill="none" />
      <ellipse cx="40" cy="48" rx="4" ry="12" fill="white" opacity="0.25" />
      <Face cy={58} />
    </svg>
  );
}

// トマト (purru-low)
function SvgTomato() {
  return (
    <svg viewBox="0 0 100 115" className="w-24 h-28" xmlns="http://www.w3.org/2000/svg">
      <Shad />
      <path d="M50,30 Q44,18 36,20 Q42,28 40,34" fill="#4CAF50" />
      <path d="M50,30 Q50,16 50,12 Q48,22 50,30" fill="#43A047" />
      <path d="M50,30 Q56,18 64,20 Q58,28 60,34" fill="#4CAF50" />
      <path d="M50,30 Q42,22 38,14 Q46,24 50,30" fill="#66BB6A" />
      <path d="M50,30 Q58,22 62,14 Q54,24 50,30" fill="#66BB6A" />
      <ellipse cx="50" cy="32" rx="9" ry="5" fill="#388E3C" />
      <circle cx="50" cy="70" r="34" fill="#E53935" />
      <circle cx="50" cy="68" r="34" fill="#F44336" />
      <ellipse cx="38" cy="50" rx="9" ry="6" fill="white" opacity="0.25" transform="rotate(-20 38 50)" />
      <Face cy={66} />
    </svg>
  );
}

// りんご (purru-low)
function SvgApple() {
  return (
    <svg viewBox="0 0 100 115" className="w-24 h-28" xmlns="http://www.w3.org/2000/svg">
      <Shad />
      <rect x="48" y="18" width="5" height="12" rx="2.5" fill="#7A4E28" />
      <path d="M 52 22 Q 64 14 66 8 Q 56 12 54 22" fill="#5CB83A" />
      <circle cx="36" cy="62" r="22" fill="#E03838" />
      <circle cx="64" cy="62" r="22" fill="#E03838" />
      <ellipse cx="50" cy="72" rx="28" ry="30" fill="#E83838" />
      <ellipse cx="50" cy="68" rx="25" ry="28" fill="#F04848" />
      <ellipse cx="36" cy="50" rx="7"  ry="12" fill="white"   opacity="0.25" />
      <Face cy={68} />
    </svg>
  );
}

// ねぎ (jump-low)
function SvgGreenOnion() {
  return (
    <svg viewBox="0 0 100 115" className="w-24 h-28" xmlns="http://www.w3.org/2000/svg">
      <Shad />
      <rect x="40" y="4"  width="9" height="30" rx="4.5" fill="#3E9420" />
      <rect x="52" y="8"  width="8" height="26" rx="4"   fill="#4EA830" />
      <rect x="30" y="10" width="8" height="24" rx="4"   fill="#4EA830" />
      <ellipse cx="50" cy="68" rx="26" ry="34" fill="#F0ECE0" />
      <ellipse cx="50" cy="66" rx="24" ry="32" fill="#FAF6E8" />
      <path d="M 36 98  Q 30 106 28 112" stroke="#D0C890" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 44 100 Q 42 108 42 112" stroke="#D0C890" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 56 100 Q 58 108 58 112" stroke="#D0C890" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 64 98  Q 70 106 72 112" stroke="#D0C890" strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx="38" cy="48" rx="5"  ry="11" fill="white"   opacity="0.3" />
      <Face cy={66} />
    </svg>
  );
}

// しいたけ (purru-low)
function SvgShiitake() {
  return (
    <svg viewBox="0 0 100 115" className="w-24 h-28" xmlns="http://www.w3.org/2000/svg">
      <Shad />
      <rect x="42" y="70" width="16" height="34" rx="7" fill="#D4B896" />
      <ellipse cx="50" cy="72" rx="12" ry="5"  fill="#C4A880" />
      <ellipse cx="50" cy="66" rx="36" ry="13" fill="#E8D4B0" />
      <ellipse cx="50" cy="54" rx="36" ry="22" fill="#8B4C28" />
      <ellipse cx="50" cy="50" rx="34" ry="20" fill="#A05C34" />
      <path d="M 28 46 Q 38 40 50 42 Q 62 40 72 46" stroke="#C47848" strokeWidth="2" fill="none" />
      <path d="M 18 56 Q 34 48 50 50 Q 66 48 82 56" stroke="#C47848" strokeWidth="2" fill="none" />
      <ellipse cx="34" cy="44" rx="7"  ry="10" fill="white"   opacity="0.2" />
      <Face cy={56} />
    </svg>
  );
}

// とうもろこし (purru-mid)
function SvgCorn() {
  return (
    <svg viewBox="0 0 100 115" className="w-24 h-28" xmlns="http://www.w3.org/2000/svg">
      <Shad />
      <path d="M 50 26 Q 34 14 22 18 Q 34 26 44 30" fill="#5CB83A" />
      <path d="M 50 26 Q 66 14 78 18 Q 66 26 56 30" fill="#5CB83A" />
      <ellipse cx="50" cy="68" rx="22" ry="40" fill="#FFD020" />
      <ellipse cx="50" cy="66" rx="20" ry="38" fill="#FFE840" />
      <path d="M 32 40 Q 50 36 68 40" stroke="#FFC000" strokeWidth="2" fill="none" />
      <path d="M 30 50 Q 50 46 70 50" stroke="#FFC000" strokeWidth="2" fill="none" />
      <path d="M 30 60 Q 50 56 70 60" stroke="#FFC000" strokeWidth="2" fill="none" />
      <path d="M 30 70 Q 50 66 70 70" stroke="#FFC000" strokeWidth="2" fill="none" />
      <path d="M 30 80 Q 50 76 70 80" stroke="#FFC000" strokeWidth="2" fill="none" />
      <path d="M 32 90 Q 50 86 68 90" stroke="#FFC000" strokeWidth="2" fill="none" />
      <ellipse cx="36" cy="46" rx="5"  ry="13" fill="white"   opacity="0.25" />
      <Face cy={64} />
    </svg>
  );
}

// ─── 追加：新規ランダムキャラ SVG ────────────────────────────

function SvgCabbage() {
  return (
    <svg viewBox="0 0 100 115" className="w-24 h-28" xmlns="http://www.w3.org/2000/svg">
      <Shad />
      <circle cx="50" cy="62" r="30" fill="#7DC95E" />
      <circle cx="34" cy="54" r="18" fill="#90D970" />
      <circle cx="66" cy="54" r="18" fill="#90D970" />
      <circle cx="50" cy="46" r="20" fill="#A8E880" />
      <ellipse cx="50" cy="70" rx="22" ry="16" fill="#7DC95E" />
      <ellipse cx="36" cy="46" rx="5" ry="9" fill="white" opacity="0.25" />
      <Face cy={66} />
    </svg>
  );
}

function SvgBanana() {
  return (
    <svg viewBox="0 0 100 115" className="w-24 h-28" xmlns="http://www.w3.org/2000/svg">
      <Shad />
      <path d="M 30 80 Q 20 50 40 30 Q 60 14 78 24 Q 65 20 55 35 Q 42 56 48 86 Z" fill="#FFE033" />
      <path d="M 32 78 Q 23 52 42 33 Q 60 18 75 26 Q 63 22 54 37 Q 43 57 49 83 Z" fill="#FFF280" />
      <path d="M 40 30 Q 57 16 75 24" stroke="#C8A020" strokeWidth="2" fill="none" strokeLinecap="round" />
      <Face cy={64} />
    </svg>
  );
}

function SvgCat() {
  return (
    <svg viewBox="0 0 100 115" className="w-24 h-28" xmlns="http://www.w3.org/2000/svg">
      <Shad />
      <polygon points="24,44 20,20 40,36" fill="#F0B8C0" />
      <polygon points="76,44 80,20 60,36" fill="#F0B8C0" />
      <polygon points="26,42 23,24 38,36" fill="#FFD8E0" />
      <polygon points="74,42 77,24 62,36" fill="#FFD8E0" />
      <ellipse cx="50" cy="76" rx="28" ry="30" fill="#F8E0D0" />
      <ellipse cx="50" cy="58" rx="28" ry="26" fill="#F8E0D0" />
      <path d="M 78 92 Q 96 82 90 70 Q 86 78 78 88" fill="#ECC8B8" />
      <ellipse cx="36" cy="46" rx="5" ry="9" fill="white" opacity="0.3" />
      <Face cy={56} />
      <path d="M 30 61 L 14 57" stroke="#C8A090" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
      <path d="M 30 64 L 14 64" stroke="#C8A090" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
      <path d="M 70 61 L 86 57" stroke="#C8A090" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
      <path d="M 70 64 L 86 64" stroke="#C8A090" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
    </svg>
  );
}

function SvgFridgeSpirit() {
  return (
    <svg viewBox="0 0 100 115" className="w-24 h-28" xmlns="http://www.w3.org/2000/svg">
      <Shad />
      <ellipse cx="20" cy="64" rx="8" ry="5" fill="#C8E8FF" transform="rotate(-20 20 64)" />
      <ellipse cx="80" cy="64" rx="8" ry="5" fill="#C8E8FF" transform="rotate(20 80 64)" />
      <rect x="22" y="28" width="56" height="78" rx="14" fill="#D8F0FF" />
      <rect x="22" y="28" width="56" height="36" rx="14" fill="#EEF8FF" />
      <rect x="64" y="40" width="4" height="12" rx="2" fill="#A0C8E8" />
      <rect x="64" y="78" width="4" height="12" rx="2" fill="#A0C8E8" />
      <rect x="22" y="62" width="56" height="3" rx="1.5" fill="#B8D8F0" />
      <ellipse cx="36" cy="38" rx="5" ry="7" fill="white" opacity="0.4" />
      <Face cy={72} />
    </svg>
  );
}

function SvgOnionWhite() {
  return (
    <svg viewBox="0 0 100 115" className="w-24 h-28" xmlns="http://www.w3.org/2000/svg">
      <Shad />
      <path d="M 44 26 Q 40 12 38 5"  stroke="#8BC870" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M 56 26 Q 60 12 62 5"  stroke="#8BC870" strokeWidth="4" fill="none" strokeLinecap="round" />
      <ellipse cx="50" cy="28" rx="12" ry="6" fill="#9AD880" />
      <ellipse cx="50" cy="70" rx="28" ry="34" fill="#F0EEE8" />
      <ellipse cx="50" cy="72" rx="22" ry="28" fill="#F8F6F0" />
      <ellipse cx="50" cy="74" rx="16" ry="22" fill="#FFFFFF" />
      <ellipse cx="38" cy="50" rx="5"  ry="10" fill="white" opacity="0.5" />
      <Face cy={72} />
    </svg>
  );
}

function SvgSweetPotato() {
  return (
    <svg viewBox="0 0 100 115" className="w-24 h-28" xmlns="http://www.w3.org/2000/svg">
      <Shad />
      <path d="M 44 26 Q 40 16 38 10" stroke="#8B6C34" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M 52 24 Q 54 14 56 8"  stroke="#6B9C44" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="50" cy="66" rx="26" ry="36" fill="#9B4C8C" />
      <ellipse cx="50" cy="64" rx="24" ry="34" fill="#B05CA0" />
      <path d="M 28 54 Q 50 48 72 54" stroke="#8A3C7C" strokeWidth="1.5" fill="none" />
      <path d="M 26 66 Q 50 60 74 66" stroke="#8A3C7C" strokeWidth="1.5" fill="none" />
      <path d="M 28 78 Q 50 72 72 78" stroke="#8A3C7C" strokeWidth="1.5" fill="none" />
      <ellipse cx="36" cy="46" rx="5" ry="10" fill="white" opacity="0.25" />
      <Face cy={64} />
    </svg>
  );
}

function SvgShrimp() {
  return (
    <svg viewBox="0 0 100 115" className="w-24 h-28" xmlns="http://www.w3.org/2000/svg">
      <Shad />
      <path d="M 50 100 Q 34 108 30 114" stroke="#F08060" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M 50 100 Q 66 108 70 114" stroke="#F08060" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M 50 30 Q 72 42 74 62 Q 76 82 60 98 Q 54 104 50 100 Q 46 104 40 98 Q 24 82 26 62 Q 28 42 50 30 Z" fill="#F9A080" />
      <path d="M 50 32 Q 69 44 71 62 Q 73 80 60 95 Q 55 101 50 98 Q 45 101 40 95 Q 27 80 29 62 Q 31 44 50 32 Z" fill="#FFB898" />
      <path d="M 30 60 L 16 54" stroke="#F08060" strokeWidth="2" strokeLinecap="round" />
      <path d="M 28 70 L 14 68" stroke="#F08060" strokeWidth="2" strokeLinecap="round" />
      <path d="M 70 60 L 84 54" stroke="#F08060" strokeWidth="2" strokeLinecap="round" />
      <path d="M 72 70 L 86 68" stroke="#F08060" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="38" cy="46" rx="5" ry="8" fill="white" opacity="0.3" />
      <Face cy={62} />
    </svg>
  );
}

function SvgTofu() {
  return (
    <svg viewBox="0 0 100 115" className="w-24 h-28" xmlns="http://www.w3.org/2000/svg">
      <Shad />
      <rect x="18" y="36" width="64" height="66" rx="10" fill="#F0EEE0" />
      <rect x="20" y="38" width="60" height="62" rx="9"  fill="#FAFAF0" />
      <circle cx="34" cy="54" r="4" fill="#E8E6D8" />
      <circle cx="50" cy="54" r="4" fill="#E8E6D8" />
      <circle cx="66" cy="54" r="4" fill="#E8E6D8" />
      <circle cx="34" cy="70" r="4" fill="#E8E6D8" />
      <circle cx="50" cy="70" r="4" fill="#E8E6D8" />
      <circle cx="66" cy="70" r="4" fill="#E8E6D8" />
      <ellipse cx="30" cy="44" rx="6" ry="4" fill="white" opacity="0.6" />
      <Face cy={86} />
    </svg>
  );
}

function SvgKiwi() {
  const seeds: [number, number, number][] = [
    [50, 52, 0],  [61, 56, 30],  [68, 64, 60],  [65, 74, 90],
    [57, 82, 120],[43, 82, 150], [35, 74, 180], [32, 64, 210], [39, 56, 240],
  ];
  return (
    <svg viewBox="0 0 100 115" className="w-24 h-28" xmlns="http://www.w3.org/2000/svg">
      <Shad />
      <ellipse cx="50" cy="68" rx="30" ry="36" fill="#8B6C3C" />
      <ellipse cx="50" cy="68" rx="27" ry="33" fill="#A07840" />
      <ellipse cx="50" cy="68" rx="23" ry="29" fill="#6CB840" />
      <ellipse cx="50" cy="68" rx="20" ry="26" fill="#7DCF50" />
      {seeds.map(([cx, cy, deg], i) => (
        <ellipse key={i} cx={cx} cy={cy} rx="2" ry="3.5" fill="#3A5C18"
          transform={`rotate(${deg} ${cx} ${cy})`} />
      ))}
      <circle cx="50" cy="68" r="6" fill="#E8F0C0" />
      <ellipse cx="36" cy="50" rx="5" ry="9" fill="white" opacity="0.25" />
      <Face cy={64} />
    </svg>
  );
}

// ─── レアキャラ SVG ───────────────────────────────────────────

function SvgGoldenCat() {
  return (
    <svg viewBox="0 0 100 115" className="w-24 h-28" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="rc-gold" cx="40%" cy="35%" r="65%">
          <stop offset="0%"   stopColor="#FFF4A0" />
          <stop offset="100%" stopColor="#F5A800" />
        </radialGradient>
      </defs>
      <Shad />
      <polygon points="24,44 20,20 40,36" fill="#F5C000" />
      <polygon points="76,44 80,20 60,36" fill="#F5C000" />
      <polygon points="26,42 23,24 38,36" fill="#FFE840" />
      <polygon points="74,42 77,24 62,36" fill="#FFE840" />
      <ellipse cx="50" cy="76" rx="28" ry="30" fill="url(#rc-gold)" />
      <ellipse cx="50" cy="58" rx="28" ry="26" fill="url(#rc-gold)" />
      <path d="M 78 92 Q 96 82 90 70 Q 86 78 78 88" fill="#F5A800" />
      <ellipse cx="36" cy="46" rx="5" ry="9" fill="white" opacity="0.4" />
      <Face cy={56} />
      <path d="M 30 61 L 14 57" stroke="#C89000" strokeWidth="1.5" opacity="0.7" strokeLinecap="round" />
      <path d="M 30 64 L 14 64" stroke="#C89000" strokeWidth="1.5" opacity="0.7" strokeLinecap="round" />
      <path d="M 70 61 L 86 57" stroke="#C89000" strokeWidth="1.5" opacity="0.7" strokeLinecap="round" />
      <path d="M 70 64 L 86 64" stroke="#C89000" strokeWidth="1.5" opacity="0.7" strokeLinecap="round" />
      <polygon points="36,38 41,28 50,35 59,28 64,38" fill="#FFD700" stroke="#F5A800" strokeWidth="1" />
      <circle cx="41" cy="28" r="2.5" fill="#FF5080" />
      <circle cx="50" cy="25" r="3"   fill="#FF5080" />
      <circle cx="59" cy="28" r="2.5" fill="#FF5080" />
    </svg>
  );
}

function SvgRainbowFish() {
  return (
    <svg viewBox="0 0 100 115" className="w-24 h-28" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rc-rainbow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#FF6B6B" />
          <stop offset="25%"  stopColor="#FFD93D" />
          <stop offset="50%"  stopColor="#6BCB77" />
          <stop offset="75%"  stopColor="#4D96FF" />
          <stop offset="100%" stopColor="#C77DFF" />
        </linearGradient>
      </defs>
      <Shad />
      <path d="M 36 96 Q 20 108 18 114 L 50 110 L 82 114 Q 80 108 64 96 Z" fill="url(#rc-rainbow)" />
      <path d="M 22 62 Q 12 50 14 40 Q 24 56 28 64 Z" fill="url(#rc-rainbow)" />
      <path d="M 78 62 Q 88 50 86 40 Q 76 56 72 64 Z" fill="url(#rc-rainbow)" />
      <path d="M 38 26 Q 50 14 62 26 L 58 36 L 42 36 Z" fill="url(#rc-rainbow)" />
      <ellipse cx="50" cy="62" rx="28" ry="36" fill="url(#rc-rainbow)" />
      <ellipse cx="50" cy="70" rx="18" ry="26" fill="rgba(255,255,255,0.25)" />
      <ellipse cx="36" cy="44" rx="5"  ry="9"  fill="white" opacity="0.35" />
      <Face cy={62} />
    </svg>
  );
}

function SvgIceCrystalFridge() {
  return (
    <svg viewBox="0 0 100 115" className="w-24 h-28" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rc-ice" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#E0F8FF" />
          <stop offset="100%" stopColor="#90C8F0" />
        </linearGradient>
      </defs>
      <Shad />
      <ellipse cx="20" cy="64" rx="8" ry="5" fill="#B8E8FF" transform="rotate(-20 20 64)" />
      <ellipse cx="80" cy="64" rx="8" ry="5" fill="#B8E8FF" transform="rotate(20 80 64)" />
      <rect x="22" y="28" width="56" height="78" rx="14" fill="url(#rc-ice)" />
      <rect x="22" y="28" width="56" height="36" rx="14" fill="rgba(230,248,255,0.9)" />
      <rect x="64" y="40" width="4" height="12" rx="2" fill="#68A8D8" />
      <rect x="64" y="78" width="4" height="12" rx="2" fill="#68A8D8" />
      <rect x="22" y="62" width="56" height="3" rx="1.5" fill="#88C0E8" />
      <ellipse cx="36" cy="38" rx="5" ry="7" fill="white" opacity="0.6" />
      <Face cy={72} />
    </svg>
  );
}

function SvgLegendaryEgg() {
  return (
    <svg viewBox="0 0 100 115" className="w-24 h-28" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="rc-legend" cx="40%" cy="35%" r="60%">
          <stop offset="0%"   stopColor="#FFFDE7" />
          <stop offset="60%"  stopColor="#FFE082" />
          <stop offset="100%" stopColor="#FFB300" />
        </radialGradient>
      </defs>
      <Shad />
      <ellipse cx="50" cy="66" rx="28" ry="36" fill="url(#rc-legend)" />
      <ellipse cx="50" cy="64" rx="26" ry="34" fill="rgba(255,253,231,0.7)" />
      <ellipse cx="38" cy="44" rx="6"  ry="11" fill="white" opacity="0.7" />
      <Face cy={66} />
      <path d="M 50 32 L 46 45 L 53 38 L 48 53"
            stroke="#FFD700" strokeWidth="2.2" fill="none" opacity="0.8" strokeLinecap="round" />
    </svg>
  );
}

function SvgAuroraCarrot() {
  return (
    <svg viewBox="0 0 100 115" className="w-24 h-28" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rc-aurora" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#FF6B6B" />
          <stop offset="33%"  stopColor="#FFD93D" />
          <stop offset="66%"  stopColor="#6BCB77" />
          <stop offset="100%" stopColor="#4D96FF" />
        </linearGradient>
      </defs>
      <Shad />
      <path d="M 42 26 Q 34 12 30 6"  stroke="#5CB83A" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <path d="M 50 22 Q 50 6  50 0"  stroke="#5CB83A" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <path d="M 58 26 Q 66 12 70 6"  stroke="#5CB83A" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <ellipse cx="50" cy="28" rx="14" ry="8" fill="#6DC848" />
      <path d="M 36 28 Q 30 60 50 108 Q 70 60 64 28 Z" fill="url(#rc-aurora)" />
      <path d="M 38 50 Q 50 46 62 50" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" fill="none" />
      <path d="M 37 64 Q 50 60 63 64" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" fill="none" />
      <path d="M 38 78 Q 50 74 62 78" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" fill="none" />
      <ellipse cx="40" cy="48" rx="4" ry="12" fill="white" opacity="0.35" />
      <Face cy={58} />
    </svg>
  );
}

function SvgStarMushroom() {
  return (
    <svg viewBox="0 0 100 115" className="w-24 h-28" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="rc-starcap" cx="50%" cy="40%" r="60%">
          <stop offset="0%"   stopColor="#FF70A0" />
          <stop offset="100%" stopColor="#CC0050" />
        </radialGradient>
      </defs>
      <Shad />
      <rect x="42" y="70" width="16" height="34" rx="7" fill="#D4B896" />
      <ellipse cx="50" cy="72" rx="12" ry="5"  fill="#C4A880" />
      <ellipse cx="50" cy="66" rx="36" ry="13" fill="#E8D4B0" />
      <ellipse cx="50" cy="54" rx="36" ry="22" fill="url(#rc-starcap)" />
      <ellipse cx="50" cy="50" rx="34" ry="20" fill="#FF60A0" />
      <circle cx="37" cy="44" r="5.5" fill="white" opacity="0.85" />
      <circle cx="56" cy="41" r="4.5" fill="white" opacity="0.85" />
      <circle cx="68" cy="52" r="4"   fill="white" opacity="0.85" />
      <circle cx="30" cy="54" r="3.5" fill="white" opacity="0.85" />
      <ellipse cx="34" cy="44" rx="7" ry="10" fill="white" opacity="0.2" />
      <Face cy={56} />
    </svg>
  );
}

// ─── 追加レアキャラ SVG ───────────────────────────────────────

// 月光猫 (cold)
function SvgMoonlightCat() {
  return (
    <svg viewBox="0 0 100 115" className="w-24 h-28" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="rc-moon" cx="40%" cy="35%" r="65%">
          <stop offset="0%"   stopColor="#E8F0FF" />
          <stop offset="100%" stopColor="#6878C0" />
        </radialGradient>
      </defs>
      <Shad />
      <polygon points="24,44 20,20 40,36" fill="#7888C0" />
      <polygon points="76,44 80,20 60,36" fill="#7888C0" />
      <polygon points="26,42 23,24 38,36" fill="#AAB8E0" />
      <polygon points="74,42 77,24 62,36" fill="#AAB8E0" />
      <ellipse cx="50" cy="76" rx="28" ry="30" fill="url(#rc-moon)" />
      <ellipse cx="50" cy="58" rx="28" ry="26" fill="url(#rc-moon)" />
      <path d="M 78 92 Q 96 82 90 70 Q 86 78 78 88" fill="#7888C0" />
      {/* 胸の三日月 */}
      <path d="M 44 74 Q 50 70 56 74 Q 53 82 50 80 Q 47 82 44 74 Z" fill="#D0DCFF" opacity="0.8" />
      <ellipse cx="36" cy="46" rx="5" ry="9" fill="white" opacity="0.3" />
      <Face cy={56} />
      <path d="M 30 61 L 14 57" stroke="#8898C8" strokeWidth="1.5" opacity="0.7" strokeLinecap="round" />
      <path d="M 30 64 L 14 64" stroke="#8898C8" strokeWidth="1.5" opacity="0.7" strokeLinecap="round" />
      <path d="M 70 61 L 86 57" stroke="#8898C8" strokeWidth="1.5" opacity="0.7" strokeLinecap="round" />
      <path d="M 70 64 L 86 64" stroke="#8898C8" strokeWidth="1.5" opacity="0.7" strokeLinecap="round" />
    </svg>
  );
}

// 炎ピーマン (stardust)
function SvgFlamePepper() {
  return (
    <svg viewBox="0 0 100 115" className="w-24 h-28" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rc-flame" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#FF2010" />
          <stop offset="100%" stopColor="#FF8030" />
        </linearGradient>
      </defs>
      <Shad />
      <rect x="47" y="14" width="6" height="16" rx="3" fill="#2A7010" />
      <path d="M 50 18 Q 60 10 63 4" stroke="#3A8820" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <ellipse cx="50" cy="72" rx="28" ry="36" fill="url(#rc-flame)" />
      <ellipse cx="50" cy="70" rx="25" ry="33" fill="#FF4A25" />
      {/* ロブの縦溝 */}
      <path d="M 36 36 Q 34 72 38 104" stroke="#CC1808" strokeWidth="2" fill="none" opacity="0.5" strokeLinecap="round" />
      <path d="M 64 36 Q 66 72 62 104" stroke="#CC1808" strokeWidth="2" fill="none" opacity="0.5" strokeLinecap="round" />
      <ellipse cx="38" cy="50" rx="5" ry="13" fill="white" opacity="0.28" transform="rotate(-8 38 50)" />
      <Face cy={68} />
    </svg>
  );
}

// 霜牛乳の精霊 (cold)
function SvgFrostMilk() {
  return (
    <svg viewBox="0 0 100 115" className="w-24 h-28" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rc-frost" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#F4FAFF" />
          <stop offset="100%" stopColor="#88C4F0" />
        </linearGradient>
      </defs>
      <Shad />
      {/* 注ぎ口 */}
      <rect x="38" y="16" width="24" height="10" rx="5" fill="#70B0E0" />
      {/* 首 */}
      <rect x="40" y="24" width="20" height="14" rx="6" fill="#90C8F0" />
      {/* 本体 */}
      <rect x="22" y="36" width="56" height="70" rx="12" fill="url(#rc-frost)" />
      <path d="M 26 60 Q 50 56 74 60" stroke="#B0D8F0" strokeWidth="1.5" fill="none" />
      <path d="M 25 74 Q 50 70 75 74" stroke="#B0D8F0" strokeWidth="1.5" fill="none" />
      {/* 氷晶 */}
      <path d="M 16 48 L 20 46 M 20 46 L 18 42 M 20 46 L 24 46" stroke="#70B8F0" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <path d="M 84 62 L 80 60 M 80 60 L 82 56 M 80 60 L 76 60" stroke="#70B8F0" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <ellipse cx="34" cy="56" rx="4" ry="14" fill="white" opacity="0.5" />
      <Face cy={74} />
    </svg>
  );
}

// プリズム玉ねぎ (aurora)
function SvgPrismOnion() {
  return (
    <svg viewBox="0 0 100 115" className="w-24 h-28" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rc-prism" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#FF8888" />
          <stop offset="25%"  stopColor="#FFE060" />
          <stop offset="50%"  stopColor="#80EC80" />
          <stop offset="75%"  stopColor="#80B8FF" />
          <stop offset="100%" stopColor="#CC70FF" />
        </linearGradient>
      </defs>
      <Shad />
      <path d="M 44 26 Q 40 12 38 5"  stroke="#4A9E28" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M 56 26 Q 60 12 62 5"  stroke="#4A9E28" strokeWidth="4" fill="none" strokeLinecap="round" />
      <ellipse cx="50" cy="28" rx="12" ry="6" fill="#5BAE36" />
      <ellipse cx="50" cy="70" rx="28" ry="34" fill="url(#rc-prism)" />
      <ellipse cx="50" cy="72" rx="22" ry="28" fill="rgba(255,255,255,0.20)" />
      <ellipse cx="50" cy="74" rx="16" ry="22" fill="rgba(255,255,255,0.15)" />
      <ellipse cx="38" cy="50" rx="5"  ry="10" fill="white" opacity="0.35" />
      <Face cy={72} />
    </svg>
  );
}

// ─── レア演出レイヤー ─────────────────────────────────────────
function RareEffectLayer({ effect }: { effect: RareEffect }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
      {effect === "glow" && (
        <div className="rare-glow absolute inset-[-10px] rounded-full"
             style={{ background: "radial-gradient(circle, rgba(255,215,50,0.38) 0%, transparent 68%)" }} />
      )}
      {effect === "cold" && (
        <>{[0,1,2,3,4].map((i) => (
          <div key={i} className="rare-cold absolute bottom-2 rounded-full bg-sky-100/70"
               style={{ width: `${7+i*4}px`, height: `${5+i*2}px`,
                        left: `${14+i*16}%`, animationDelay: `${i*0.45}s`, filter: "blur(2.5px)" }} />
        ))}</>
      )}
      {effect === "aurora" && (
        <>{(["rgba(255,100,200,0.35)","rgba(80,200,255,0.30)","rgba(160,255,100,0.28)"] as const).map((color, i) => (
          <div key={i} className="rare-aurora absolute top-0 h-full w-1/2"
               style={{ background: `linear-gradient(180deg,transparent,${color},transparent)`,
                        animationDelay: `${i*1.1}s`, animationDuration: `${3+i*0.9}s` }} />
        ))}</>
      )}
      {effect === "stardust" && (
        <>{[0,1,2,3,4,5,6,7].map((i) => (
          <span key={i} className="rare-star absolute select-none text-[9px]"
                style={{ color: ["#FFD700","#FF69B4","#87CEEB","#98FB98"][i%4],
                         left: `${8+(i*13)%80}%`, top: `${4+(i*19)%58}%`,
                         animationDelay: `${i*0.28}s`, animationDuration: `${1.7+(i%3)*0.45}s` }}>
            ✦
          </span>
        ))}</>
      )}
    </div>
  );
}

// ─── キャラクター定義 ──────────────────────────────────────────
// getDay(): 0=日, 1=月, 2=火, 3=水, 4=木, 5=金, 6=土
const DAY_CHARS: CharDef[] = [
  { name: "いちご",       anim: "purru", intensity: "low", Svg: SvgStrawberry }, // 日
  { name: "かぼちゃ",     anim: "purru", intensity: "low", Svg: SvgPumpkin    }, // 月
  { name: "たまねぎ",     anim: "purru", intensity: "low", Svg: SvgOnion      }, // 火
  { name: "おさかな",     anim: "jump",  intensity: "mid", Svg: SvgFish       }, // 水
  { name: "たこ",         anim: "jump",  intensity: "mid", Svg: SvgOctopus    }, // 木
  { name: "たまご",       anim: "purru", intensity: "low", Svg: SvgEgg        }, // 金
  { name: "ブロッコリー", anim: "purru", intensity: "low", Svg: SvgBroccoli   }, // 土
];

const RANDOM_CHARS: CharDef[] = [
  { name: "にんじん",     anim: "purru", intensity: "mid", Svg: SvgCarrot       },
  { name: "トマト",       anim: "purru", intensity: "low", Svg: SvgTomato       },
  { name: "りんご",       anim: "purru", intensity: "low", Svg: SvgApple        },
  { name: "ねぎ",         anim: "jump",  intensity: "low", Svg: SvgGreenOnion   },
  { name: "しいたけ",     anim: "purru", intensity: "low", Svg: SvgShiitake     },
  { name: "とうもろこし", anim: "purru", intensity: "mid", Svg: SvgCorn         },
  { name: "キャベツ",     anim: "purru", intensity: "low", Svg: SvgCabbage      },
  { name: "バナナ",       anim: "purru", intensity: "mid", Svg: SvgBanana       },
  { name: "ねこ",         anim: "jump",  intensity: "low", Svg: SvgCat          },
  { name: "冷蔵庫の精霊", anim: "jump",  intensity: "mid", Svg: SvgFridgeSpirit },
  { name: "白たまねぎ",   anim: "purru", intensity: "low", Svg: SvgOnionWhite   },
  { name: "さつまいも",   anim: "purru", intensity: "low", Svg: SvgSweetPotato  },
  { name: "えび",         anim: "jump",  intensity: "low", Svg: SvgShrimp       },
  { name: "とうふ",       anim: "purru", intensity: "low", Svg: SvgTofu         },
  { name: "キウイ",       anim: "purru", intensity: "low", Svg: SvgKiwi         },
];

const RARE_CHARS: RareCharDef[] = [
  { name: "黄金猫",           anim: "jump",  intensity: "high", effect: "glow",     Svg: SvgGoldenCat        },
  { name: "虹色おさかな",     anim: "jump",  intensity: "high", effect: "aurora",   Svg: SvgRainbowFish      },
  { name: "氷の冷蔵庫の精霊", anim: "jump",  intensity: "high", effect: "cold",     Svg: SvgIceCrystalFridge },
  { name: "伝説の卵",         anim: "purru", intensity: "high", effect: "glow",     Svg: SvgLegendaryEgg     },
  { name: "オーロラにんじん", anim: "purru", intensity: "high", effect: "aurora",   Svg: SvgAuroraCarrot     },
  { name: "星キノコ",         anim: "purru", intensity: "high", effect: "stardust", Svg: SvgStarMushroom     },
  { name: "月光ねこ",         anim: "jump",  intensity: "high", effect: "cold",     Svg: SvgMoonlightCat     },
  { name: "炎ピーマン",       anim: "jump",  intensity: "high", effect: "stardust", Svg: SvgFlamePepper      },
  { name: "霜牛乳の精霊",     anim: "purru", intensity: "high", effect: "cold",     Svg: SvgFrostMilk        },
  { name: "プリズム玉ねぎ",   anim: "purru", intensity: "high", effect: "aurora",   Svg: SvgPrismOnion       },
];

// ─── メインコンポーネント ─────────────────────────────────────
export default function DailyCharacter() {
  const [char, setChar]             = useState<CharDef | null>(null);
  const [rareEffect, setRareEffect] = useState<RareEffect | null>(null);

  useEffect(() => {
    const day        = new Date().getDay();
    const baseChar   = DAY_CHARS[day];
    const rareRoll   = Math.random();
    const randomRoll = Math.random();
    const isRare     = rareRoll   < RARE_CHANCE;
    const isRandom   = randomRoll < RANDOM_CHANCE;

    if (isRare) {
      const rare = RARE_CHARS[Math.floor(Math.random() * RARE_CHARS.length)];
      setChar(rare);
      setRareEffect(rare.effect);
    } else if (isRandom) {
      setChar(RANDOM_CHARS[Math.floor(Math.random() * RANDOM_CHARS.length)]);
    } else {
      setChar(baseChar);
    }
  }, []);

  if (!char) {
    return <div className="flex justify-center mb-3" style={{ minHeight: "7rem" }} />;
  }

  const { Svg, anim, intensity } = char;

  const dropFilter =
    rareEffect === "glow"   ? "drop-shadow(0 0 14px rgba(255,210,50,0.65)) drop-shadow(0 4px 8px rgba(0,0,0,0.10))" :
    rareEffect === "cold"   ? "drop-shadow(0 0 12px rgba(140,210,255,0.70)) drop-shadow(0 4px 8px rgba(0,0,0,0.10))" :
    rareEffect === "aurora" ? "drop-shadow(0 0 12px rgba(180,100,255,0.55)) drop-shadow(0 4px 8px rgba(0,0,0,0.10))" :
                              "drop-shadow(0 6px 14px rgba(0,0,0,0.10)) drop-shadow(0 2px 4px rgba(0,0,0,0.06))";

  return (
    <div className="flex justify-center mb-3">
      <div className="relative char-pop">
        {rareEffect && <RareEffectLayer effect={rareEffect} />}
        <div
          className={ANIM_CLASS[anim][intensity]}
          style={{ transformOrigin: "50% 100%", filter: dropFilter }}
        >
          <Svg />
        </div>
      </div>
    </div>
  );
}
