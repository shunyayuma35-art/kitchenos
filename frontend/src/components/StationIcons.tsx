interface IconProps { size?: number }

/* ── 厨房スタッフ（シェフ帽＋フライパン） ── */
export function ChefIcon({ size = 80 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 帽子の白部分 */}
      <ellipse cx="40" cy="28" rx="20" ry="18" fill="#fff" stroke="#f4a261" strokeWidth="2"/>
      <rect x="22" y="38" width="36" height="10" rx="3" fill="#fff" stroke="#f4a261" strokeWidth="2"/>
      {/* 帽子のハイライト */}
      <ellipse cx="33" cy="22" rx="6" ry="4" fill="rgba(255,255,255,0.6)"/>
      {/* 顔 */}
      <circle cx="40" cy="54" r="14" fill="#FFD6A5"/>
      {/* 目 */}
      <circle cx="35" cy="52" r="2.5" fill="#3d2010"/>
      <circle cx="45" cy="52" r="2.5" fill="#3d2010"/>
      <circle cx="36" cy="51" r="1" fill="#fff"/>
      <circle cx="46" cy="51" r="1" fill="#fff"/>
      {/* 笑顔 */}
      <path d="M35 58 Q40 63 45 58" stroke="#c0784a" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      {/* ほっぺ */}
      <circle cx="31" cy="56" r="3" fill="rgba(255,120,100,0.3)"/>
      <circle cx="49" cy="56" r="3" fill="rgba(255,120,100,0.3)"/>
      {/* フライパン */}
      <ellipse cx="58" cy="68" rx="12" ry="6" fill="#555" stroke="#333" strokeWidth="1.5"/>
      <rect x="68" y="64" width="10" height="3" rx="1.5" fill="#666"/>
      {/* 湯気 */}
      <path d="M50 56 Q52 52 50 48" stroke="#ffb347" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7"/>
      <path d="M56 54 Q58 50 56 46" stroke="#ffb347" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7"/>
    </svg>
  );
}

/* ── テーブル端末（テーブル＋料理） ── */
export function TableIcon({ size = 80 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* テーブル天板 */}
      <rect x="8" y="42" width="64" height="8" rx="4" fill="#d4956a" stroke="#b07040" strokeWidth="1.5"/>
      {/* 脚 */}
      <rect x="16" y="50" width="5" height="20" rx="2.5" fill="#c08050"/>
      <rect x="59" y="50" width="5" height="20" rx="2.5" fill="#c08050"/>
      {/* 皿 */}
      <ellipse cx="40" cy="40" rx="18" ry="5" fill="#f0e8dc" stroke="#ddd0c0" strokeWidth="1.5"/>
      {/* ラーメン丼 */}
      <path d="M28 32 Q28 42 40 42 Q52 42 52 32" fill="#fff" stroke="#e0c8b0" strokeWidth="1.5"/>
      <ellipse cx="40" cy="32" rx="12" ry="4" fill="#e8d4b8" stroke="#d4c0a0" strokeWidth="1"/>
      {/* スープ */}
      <ellipse cx="40" cy="32" rx="10" ry="3" fill="#c85a2a" opacity="0.85"/>
      {/* 麺 */}
      <path d="M33 31 Q36 29 39 31 Q42 33 45 31" stroke="#f4d080" strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* ネギ */}
      <circle cx="37" cy="30" r="2" fill="#4a9a4a"/>
      <circle cx="43" cy="30" r="2" fill="#4a9a4a"/>
      {/* 箸 */}
      <line x1="54" y1="22" x2="60" y2="40" stroke="#a0704a" strokeWidth="2" strokeLinecap="round"/>
      <line x1="58" y1="22" x2="63" y2="40" stroke="#a0704a" strokeWidth="2" strokeLinecap="round"/>
      {/* 湯気 */}
      <path d="M36 26 Q38 22 36 18" stroke="#ffccaa" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M44 25 Q46 21 44 17" stroke="#ffccaa" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6"/>
    </svg>
  );
}

/* ── 調理（炎＋フライパン＋おいしそうな食材） ── */
export function CookingIcon({ size = 60 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 炎 */}
      <path d="M20 44 Q14 36 18 26 Q20 32 24 28 Q22 20 28 14 Q26 22 30 20 Q34 14 36 20 Q40 16 38 26 Q42 22 42 30 Q44 38 38 44" fill="#ff6b35" opacity="0.9"/>
      <path d="M22 44 Q18 38 22 32 Q24 36 26 34 Q24 28 28 22 Q28 28 32 26 Q34 22 36 26 Q38 22 38 30 Q40 36 36 44" fill="#ffb347"/>
      <path d="M26 44 Q24 40 26 36 Q28 38 30 36 Q30 32 32 28 Q32 34 34 32 Q36 36 34 44" fill="#ffe066"/>
      {/* フライパン */}
      <ellipse cx="30" cy="46" rx="16" ry="7" fill="#2d2d2d" stroke="#1a1a1a" strokeWidth="1.5"/>
      <ellipse cx="30" cy="44" rx="14" ry="5" fill="#3a3a3a"/>
      {/* 取っ手 */}
      <rect x="44" y="42" width="14" height="4" rx="2" fill="#4a4a4a"/>
      {/* 目玉焼き */}
      <ellipse cx="26" cy="43" rx="5" ry="3.5" fill="#fff8dc"/>
      <circle cx="26" cy="43" r="2.5" fill="#f59e0b"/>
      {/* チャーシュー */}
      <ellipse cx="35" cy="44" rx="4" ry="2.5" fill="#c0392b"/>
      <path d="M32 43 Q35 41 38 43" stroke="#e74c3c" strokeWidth="1" fill="none"/>
      {/* 湯気 */}
      <path d="M22 36 Q24 32 22 28" stroke="#ffcc88" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7"/>
      <path d="M30 34 Q32 30 30 26" stroke="#ffcc88" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7"/>
    </svg>
  );
}

/* ── 盛付（美しいプレートに盛られた料理） ── */
export function PlatingIcon({ size = 60 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 白いお皿 */}
      <ellipse cx="30" cy="42" rx="24" ry="8" fill="#f5f0e8" stroke="#e0d4c0" strokeWidth="2"/>
      <path d="M6 42 Q6 54 30 54 Q54 54 54 42" fill="#fff" stroke="#e0d4c0" strokeWidth="1.5"/>
      {/* ラーメン丼 */}
      <ellipse cx="30" cy="34" rx="18" ry="6" fill="#fff" stroke="#e0c8a8" strokeWidth="1.5"/>
      <path d="M12 34 Q12 46 30 46 Q48 46 48 34" fill="#fff9f0" stroke="#e8d8b8" strokeWidth="1"/>
      {/* スープ（味噌色） */}
      <ellipse cx="30" cy="34" rx="16" ry="5" fill="#c87840" opacity="0.9"/>
      {/* 麺 */}
      <path d="M22 32 Q25 29 28 32 Q31 35 34 32 Q37 29 40 32" stroke="#f4d060" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* チャーシュー */}
      <ellipse cx="24" cy="31" rx="5" ry="3" fill="#c0392b"/>
      <ellipse cx="24" cy="31" rx="3" ry="2" fill="#e74c3c"/>
      {/* ネギ（緑） */}
      <ellipse cx="34" cy="30" rx="4" ry="2" fill="#2ecc71"/>
      {/* バター（黄色い丸） */}
      <circle cx="30" cy="28" r="3" fill="#f1c40f"/>
      {/* メンマ */}
      <rect x="36" y="33" width="6" height="2" rx="1" fill="#d4a017" transform="rotate(-15 36 33)"/>
      {/* 箸 */}
      <line x1="50" y1="22" x2="54" y2="38" stroke="#a0704a" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="54" y1="22" x2="57" y2="38" stroke="#a0704a" strokeWidth="2.5" strokeLinecap="round"/>
      {/* 湯気 */}
      <path d="M25 24 Q27 20 25 16" stroke="#ffcc99" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7"/>
      <path d="M31 22 Q33 18 31 14" stroke="#ffcc99" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7"/>
      <path d="M37 24 Q39 20 37 16" stroke="#ffcc99" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7"/>
    </svg>
  );
}

/* ── 仕込み（まな板＋野菜を切る） ── */
export function PrepIcon({ size = 60 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* まな板 */}
      <rect x="6" y="30" width="48" height="22" rx="4" fill="#d4a373" stroke="#b5845a" strokeWidth="2"/>
      <rect x="6" y="30" width="48" height="22" rx="4" fill="url(#woodGrain)"/>
      {/* 木目 */}
      <line x1="14" y1="30" x2="14" y2="52" stroke="#c49060" strokeWidth="0.8" opacity="0.5"/>
      <line x1="24" y1="30" x2="24" y2="52" stroke="#c49060" strokeWidth="0.8" opacity="0.5"/>
      <line x1="36" y1="30" x2="36" y2="52" stroke="#c49060" strokeWidth="0.8" opacity="0.5"/>
      <line x1="46" y1="30" x2="46" y2="52" stroke="#c49060" strokeWidth="0.8" opacity="0.5"/>
      {/* まな板の穴 */}
      <circle cx="50" cy="34" r="2.5" fill="#b5845a"/>
      {/* 長ねぎ（斜めスライス） */}
      <ellipse cx="18" cy="40" rx="5" ry="2.5" fill="#4ade80" stroke="#22c55e" strokeWidth="1"/>
      <ellipse cx="26" cy="38" rx="5" ry="2.5" fill="#4ade80" stroke="#22c55e" strokeWidth="1"/>
      <ellipse cx="34" cy="40" rx="5" ry="2.5" fill="#bbf7d0" stroke="#22c55e" strokeWidth="0.8"/>
      {/* 人参（丸切り） */}
      <circle cx="20" cy="46" r="4" fill="#fb923c" stroke="#ea580c" strokeWidth="1"/>
      <path d="M18 46 Q20 43 22 46" stroke="#fcd34d" strokeWidth="1" fill="none"/>
      {/* 包丁 */}
      <path d="M44 8 L54 30 L50 32 L38 12 Z" fill="#e8e8e8" stroke="#ccc" strokeWidth="1"/>
      <path d="M38 12 L50 32 L48 33 L36 14 Z" fill="#d0d0d0"/>
      <rect x="32" y="8" width="8" height="14" rx="2" fill="#5c3d1e" transform="rotate(25 32 8)"/>
      {/* ✨スパーク（切った直後） */}
      <text x="8" y="24" fontSize="12">✨</text>
    </svg>
  );
}

/* ── 管理（クリップボード＋グラフ） ── */
export function AdminIcon({ size = 60 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* クリップボード */}
      <rect x="10" y="14" width="40" height="44" rx="5" fill="#fff9f0" stroke="#f4a261" strokeWidth="2"/>
      <rect x="22" y="8" width="16" height="10" rx="3" fill="#f4a261"/>
      <rect x="25" y="10" width="10" height="6" rx="2" fill="#e8834a"/>
      {/* 棒グラフ */}
      <rect x="15" y="40" width="7" height="12" rx="2" fill="#ff6b6b"/>
      <rect x="25" y="34" width="7" height="18" rx="2" fill="#f59e0b"/>
      <rect x="35" y="28" width="7" height="24" rx="2" fill="#10b981"/>
      {/* グラフ上昇矢印 */}
      <path d="M14 44 L22 36 L30 38 L44 24" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <polygon points="44,24 40,26 42,30" fill="#6366f1"/>
      {/* チェックリスト */}
      <line x1="15" y1="22" x2="45" y2="22" stroke="#e0c8a0" strokeWidth="1.5"/>
      <circle cx="18" cy="26" r="2.5" fill="#10b981"/>
      <line x1="22" y1="26" x2="36" y2="26" stroke="#c0a070" strokeWidth="1.5"/>
    </svg>
  );
}
