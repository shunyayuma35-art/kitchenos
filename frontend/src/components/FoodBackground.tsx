import { useMemo } from "react";

// 食材・料理・飲み物をバランスよく混ぜる
const ITEMS = [
  // 料理・食材
  "🍜","🍱","🍣","🍛","🍝","🥘","🫕","🍲","🥗",
  "🥬","🧅","🧄","🥕","🍄","🌶️","🍋","🥦","🥚","🧆","🧇",
  "🍳","🥩","🍖","🥐","🍞","🧀","🥑",
  // 飲み物
  "🧃","🥤","☕","🍵","🧋","🍺","🍻","🍹","🧊","🍶",
  "🥛","🫗","🍷","🍸","🍾",
  // デザート・スイーツ
  "🍰","🎂","🧁","🍩","🍪","🍫","🍬","🍭","🍮",
];

interface Particle {
  emoji: string;
  x: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  rotate: number;
  drift: number; // 左右のゆらぎ量
}

export default function FoodBackground() {
  const particles: Particle[] = useMemo(() =>
    Array.from({ length: 36 }, (_, i) => ({
      emoji: ITEMS[i % ITEMS.length],
      x: (i / 36) * 100 + (Math.random() - 0.5) * 8,
      size: 1.6 + Math.random() * 2.2,
      duration: 16 + Math.random() * 20,
      delay: -(Math.random() * 30),
      opacity: 0.18 + Math.random() * 0.18,
      rotate: Math.random() * 360,
      drift: (Math.random() - 0.5) * 60,
    })), []
  );

  return (
    <>
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(108vh) translateX(0) rotate(var(--r0)); opacity: 0; }
          8%   { opacity: var(--op); }
          50%  { transform: translateY(50vh) translateX(var(--drift)) rotate(var(--r1)); }
          92%  { opacity: var(--op); }
          100% { transform: translateY(-12vh) translateX(0) rotate(var(--r2)); opacity: 0; }
        }
        @keyframes bobble {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.08); }
        }
        .food-particle {
          position: fixed;
          pointer-events: none;
          z-index: 0;
          animation: floatUp linear infinite;
          user-select: none;
          filter: drop-shadow(0 2px 8px rgba(0,0,0,0.08));
        }
      `}</style>
      {particles.map((p, i) => (
        <span
          key={i}
          className="food-particle"
          style={{
            left: `${p.x}%`,
            fontSize: `${p.size}rem`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            "--r0": `${p.rotate}deg`,
            "--r1": `${p.rotate + 20}deg`,
            "--r2": `${p.rotate + 45}deg`,
            "--op": p.opacity,
            "--drift": `${p.drift}px`,
          } as React.CSSProperties}
        >
          {p.emoji}
        </span>
      ))}
    </>
  );
}
