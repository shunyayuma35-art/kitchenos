"use client";

import { useState, useMemo, useEffect } from "react";

// ─── 定数 ─────────────────────────────────────────────────────
export const RANDOM_CHANCE = 0.20; // ランダム出現確率 — ここで調整

type Animation = "purru" | "jump";
type Intensity = "low" | "mid" | "high";

interface CharDef {
  name:      string;
  anim:      Animation;
  intensity: Intensity;
  Svg:       React.ComponentType;
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
      <circle cx="40" cy={cy}       r="6.5" fill="white" />
      <circle cx="60" cy={cy}       r="6.5" fill="white" />
      <circle cx="41" cy={cy + 1}   r="3.5" fill="#1A1A1A" />
      <circle cx="61" cy={cy + 1}   r="3.5" fill="#1A1A1A" />
      <circle cx="42.5" cy={cy - 1.5} r="1.4" fill="white" />
      <circle cx="62.5" cy={cy - 1.5} r="1.4" fill="white" />
      <circle cx="43.5" cy={cy + 2}   r="0.6" fill="white" />
      <circle cx="63.5" cy={cy + 2}   r="0.6" fill="white" />
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
  { name: "にんじん",       anim: "purru", intensity: "mid", Svg: SvgCarrot     },
  { name: "トマト",         anim: "purru", intensity: "low", Svg: SvgTomato     },
  { name: "りんご",         anim: "purru", intensity: "low", Svg: SvgApple      },
  { name: "ねぎ",           anim: "jump",  intensity: "low", Svg: SvgGreenOnion },
  { name: "しいたけ",       anim: "purru", intensity: "low", Svg: SvgShiitake   },
  { name: "とうもろこし",   anim: "purru", intensity: "mid", Svg: SvgCorn       },
];

// ─── メインコンポーネント ─────────────────────────────────────
export default function DailyCharacter() {
  // サーバー/クライアント初期値を統一（曜日は決定的）
  const dayChar = useMemo(() => DAY_CHARS[new Date().getDay()], []);
  const [char, setChar] = useState<CharDef>(dayChar);

  // ハイドレーション後にのみランダム判定（SSR不一致を回避）
  useEffect(() => {
    if (Math.random() < RANDOM_CHANCE) {
      setChar(RANDOM_CHARS[Math.floor(Math.random() * RANDOM_CHARS.length)]);
    }
  }, []);

  const { Svg, anim, intensity } = char;

  return (
    <div className="flex justify-center mb-3">
      <div
        className={ANIM_CLASS[anim][intensity]}
        style={{ transformOrigin: "50% 100%" }}
      >
        <Svg />
      </div>
    </div>
  );
}
