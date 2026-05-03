"use client";

import {
  createContext, useContext, useState, useEffect, useCallback,
  type ReactNode,
} from "react";
import { translations, type Lang, type T } from "./i18n";

const STORAGE_KEY = "foodmind_lang";
const DEFAULT_LANG: Lang = "ja";

interface LangCtx {
  lang: Lang;
  t: T;
  setLang: (l: Lang) => void;
}

const LangContext = createContext<LangCtx>({
  lang: DEFAULT_LANG,
  t: translations[DEFAULT_LANG],
  setLang: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (saved && saved in translations) setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = translations[lang].locale;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }, []);

  return (
    <LangContext.Provider value={{ lang, t: translations[lang], setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useT(): T {
  return useContext(LangContext).t;
}

export function useLang() {
  return useContext(LangContext);
}
