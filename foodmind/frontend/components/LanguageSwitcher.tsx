"use client";

import { useState } from "react";
import { useLang } from "@/lib/LangContext";
import { LANG_META, type Lang } from "@/lib/i18n";

const LANGS = Object.entries(LANG_META) as [Lang, { flag: string; label: string }][];

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const meta = LANG_META[lang];

  return (
    <>
      {/* 言語ボタン（BottomNavの上に固定） */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-[76px] right-4 z-40 bg-white border border-gray-200 rounded-full
                   px-3 py-1.5 flex items-center gap-1.5 card-shadow text-xs font-semibold
                   text-gray-600 active:scale-95 transition-transform"
      >
        <span className="text-base leading-none">{meta.flag}</span>
        <span>{meta.label}</span>
      </button>

      {/* モーダル */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end animate-fade-in"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white w-full max-w-sm mx-auto rounded-t-3xl p-5 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <p className="text-center text-xs text-gray-400 font-semibold uppercase tracking-widest mb-4">
              🌐 Language / 言語
            </p>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {LANGS.map(([code, m]) => (
                <button
                  key={code}
                  onClick={() => { setLang(code); setOpen(false); }}
                  className={`flex flex-col items-center gap-1 py-3 rounded-2xl text-xs font-semibold
                              border transition-all active:scale-95 ${
                    lang === code
                      ? "bg-emerald-700 text-white border-emerald-700 shadow-md"
                      : "bg-white text-gray-600 border-gray-100 card-shadow"
                  }`}
                >
                  <span className="text-2xl leading-none">{m.flag}</span>
                  <span className="leading-tight text-center">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
