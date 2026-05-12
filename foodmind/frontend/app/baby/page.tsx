"use client";

import { useState } from "react";
import BottomNav from "@/components/BottomNav";

export const dynamic = "force-dynamic";

interface BabyRecipe {
  name:        string;
  ingredients: string[];
  howTo:       string;
  allergens:   string[];
}

interface Stage {
  id:       string;
  age:      string;
  label:    string;
  emoji:    string;
  bg:       string;
  border:   string;
  foods:    string[];
  recipes:  BabyRecipe[];
}

const STAGES: Stage[] = [
  {
    id:     "early",
    age:    "5〜6ヶ月",
    label:  "初期",
    emoji:  "🌱",
    bg:     "bg-green-50",
    border: "border-green-200",
    foods:  ["10倍粥", "かぼちゃ", "人参", "さつまいも", "豆腐", "ほうれん草"],
    recipes: [
      {
        name:        "10倍粥",
        ingredients: ["ご飯 大さじ1", "水 150ml"],
        howTo:       "ご飯と水を鍋で弱火で煮て、なめらかにすりつぶす。トロトロになるまで。",
        allergens:   [],
      },
      {
        name:        "かぼちゃペースト",
        ingredients: ["かぼちゃ 20g"],
        howTo:       "やわらかく蒸してすりつぶし、お湯でのばしてなめらかにする。",
        allergens:   [],
      },
      {
        name:        "人参スープ",
        ingredients: ["人参 15g", "だし 50ml"],
        howTo:       "人参をやわらかく煮て裏ごしし、だしでのばす。",
        allergens:   [],
      },
    ],
  },
  {
    id:     "middle",
    age:    "7〜8ヶ月",
    label:  "中期",
    emoji:  "🌿",
    bg:     "bg-emerald-50",
    border: "border-emerald-200",
    foods:  ["7倍粥", "白身魚", "豆腐", "卵黄", "ブロッコリー", "じゃがいも"],
    recipes: [
      {
        name:        "卵黄おかゆ",
        ingredients: ["7倍粥 大さじ3", "固ゆで卵の黄身 耳かき1杯"],
        howTo:       "固ゆで卵の黄身のみを耳かき1杯ずつ少量からスタート。おかゆに混ぜる。",
        allergens:   ["卵"],
      },
      {
        name:        "白身魚のとろみ煮",
        ingredients: ["白身魚 10g", "だし 大さじ2", "片栗粉 少々"],
        howTo:       "白身魚をほぐしてだしで煮て、水溶き片栗粉でとろみをつける。",
        allergens:   [],
      },
      {
        name:        "豆腐野菜あんかけ",
        ingredients: ["豆腐 20g", "人参 10g", "だし 50ml"],
        howTo:       "野菜をやわらかく煮て、だしあんにして豆腐にのせる。",
        allergens:   [],
      },
    ],
  },
  {
    id:     "late",
    age:    "9〜11ヶ月",
    label:  "後期",
    emoji:  "🌾",
    bg:     "bg-amber-50",
    border: "border-amber-200",
    foods:  ["軟飯", "鶏ひき肉", "魚", "全卵", "チーズ", "うどん"],
    recipes: [
      {
        name:        "鶏そぼろご飯",
        ingredients: ["鶏ひき肉 15g", "軟飯 大さじ3", "だし 大さじ1", "醤油 ごく少量"],
        howTo:       "鶏ひき肉をだしで炒り煮にして薄味に整え、軟飯にのせる。",
        allergens:   [],
      },
      {
        name:        "卵とじうどん",
        ingredients: ["うどん 40g", "卵 1/4個", "だし 80ml"],
        howTo:       "うどんを細かく切ってだしで煮て、溶き卵でとじる。",
        allergens:   ["卵", "小麦"],
      },
      {
        name:        "野菜スープ煮",
        ingredients: ["じゃがいも 15g", "人参 10g", "玉ねぎ 10g", "だし"],
        howTo:       "野菜を小さく切ってだしでやわらかくなるまで煮る。",
        allergens:   [],
      },
    ],
  },
  {
    id:     "complete",
    age:    "12ヶ月〜",
    label:  "完了期",
    emoji:  "🍚",
    bg:     "bg-orange-50",
    border: "border-orange-200",
    foods:  ["ご飯", "鶏肉・豚肉", "魚", "卵", "チーズ", "多様な野菜"],
    recipes: [
      {
        name:        "親子丼（薄味）",
        ingredients: ["鶏肉 20g", "卵 1/2個", "ご飯 80g", "だし・醤油 各少々"],
        howTo:       "鶏肉をだしで煮て卵でとじ、ご飯にのせる。大人の1/3以下の薄味で。",
        allergens:   ["卵"],
      },
      {
        name:        "ミートソースパスタ",
        ingredients: ["スパゲッティ 30g", "豚ひき肉 15g", "トマト 20g"],
        howTo:       "パスタを細かく折って茹で、トマトと肉で作った薄味ソースと和える。",
        allergens:   ["小麦"],
      },
      {
        name:        "野菜みそ汁",
        ingredients: ["豆腐 20g", "わかめ 少々", "みそ ごく少量"],
        howTo:       "具材をやわらかく煮て、みそを大人の1/4量で溶く。薄めが鉄則。",
        allergens:   [],
      },
    ],
  },
];

const ALLERGENS = ["卵", "乳", "小麦", "えび/かに", "そば", "落花生"];
const ALLERGEN_EMOJI: Record<string, string> = {
  "卵": "🥚", "乳": "🥛", "小麦": "🌾", "えび/かに": "🦐", "そば": "🍜", "落花生": "🥜",
};

export default function BabyPage() {
  const [openId, setOpenId] = useState<string>("middle");

  return (
    <div className="max-w-sm mx-auto min-h-screen bg-gray-50 pb-28">
      {/* ── ヘッダー ── */}
      <div
        className="px-5 pt-12 pb-8"
        style={{ background: "linear-gradient(135deg, #f9a8d4 0%, #ec4899 100%)" }}
      >
        <p className="text-white/70 text-xs uppercase tracking-widest mb-1">Baby Food</p>
        <h1 className="text-white text-2xl font-bold">👶 離乳食ガイド</h1>
        <p className="text-white/70 text-sm mt-1">月齢に合わせた食材とレシピ</p>
      </div>

      <div className="px-4 mt-4 space-y-3">
        {/* 注意書き */}
        <div className="bg-pink-50 border border-pink-200 rounded-2xl px-4 py-3">
          <p className="text-pink-800 text-xs font-medium leading-relaxed">
            ⚕️ このガイドは参考情報です。アレルギーや体調の変化があれば小児科医にご相談ください。
            新しい食材は1種類ずつ、少量から始めましょう。
          </p>
        </div>

        {/* ── 月齢カード ── */}
        {STAGES.map((stage) => {
          const isOpen = openId === stage.id;
          return (
            <div
              key={stage.id}
              className={`rounded-2xl border overflow-hidden ${stage.bg} ${stage.border}`}
            >
              {/* タップで開閉 */}
              <button
                className="w-full flex items-center gap-3 px-4 py-4 text-left"
                onClick={() => setOpenId(isOpen ? "" : stage.id)}
              >
                <span className="text-2xl">{stage.emoji}</span>
                <div className="flex-1">
                  <p className="font-bold text-gray-800 text-base">{stage.age}</p>
                  <p className="text-xs text-gray-500">{stage.label}</p>
                </div>
                <span className="text-gray-400 text-sm">{isOpen ? "▲" : "▼"}</span>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 space-y-4">
                  {/* おすすめ食材 */}
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      おすすめ食材
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {stage.foods.map((f) => (
                        <span
                          key={f}
                          className="text-xs bg-white border border-gray-200 rounded-full px-2.5 py-1 text-gray-700"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* かんたんレシピ */}
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      かんたんレシピ
                    </p>
                    <div className="space-y-2">
                      {stage.recipes.map((recipe) => (
                        <div
                          key={recipe.name}
                          className="bg-white rounded-xl p-3.5 border border-gray-100"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="font-bold text-gray-800 text-sm">{recipe.name}</p>
                            {recipe.allergens.length > 0 && (
                              <div className="flex flex-wrap gap-1 shrink-0">
                                {recipe.allergens.map((a) => (
                                  <span
                                    key={a}
                                    className="text-[10px] bg-red-50 text-red-600 border border-red-200 rounded-full px-1.5 py-0.5"
                                  >
                                    ⚠️ {a}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mb-1.5">
                            {recipe.ingredients.join(" ・ ")}
                          </p>
                          <p className="text-xs text-gray-600 leading-relaxed">{recipe.howTo}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* アレルゲン一覧 */}
                  <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-3">
                    <p className="text-xs font-bold text-red-700 mb-2">⚠️ 特定原材料（アレルゲン）</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      {ALLERGENS.map((name) => (
                        <span key={name} className="text-xs text-red-600">
                          {ALLERGEN_EMOJI[name]} {name}
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-red-500 mt-2">
                      該当食材は⚠️表示。必ず少量から始め、様子を確認してください。
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}
