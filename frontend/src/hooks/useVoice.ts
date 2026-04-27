import { useCallback } from "react";
import type { Language } from "../types";

const LANG_BCP47: Record<Language, string> = {
  ja: "ja-JP",
  en: "en-US",
  vi: "vi-VN",
  ne: "ne-NP",
  id: "id-ID",
  my: "my-MM",
  ur: "ur-PK",
  th: "th-TH",
  zh: "zh-CN",
};

export function useVoice(language: Language) {
  const speak = useCallback(
    (text: string) => {
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = LANG_BCP47[language];
      utterance.rate = 0.95;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    },
    [language]
  );

  const notifyTaskComplete = useCallback(
    (taskType: string) => {
      const messages: Record<Language, string> = {
        ja: `${taskType}が完了しました`,
        en: `${taskType} completed`,
        vi: `${taskType} đã hoàn thành`,
        ne: `${taskType} सम्पन्न भयो`,
        id: `${taskType} selesai`,
        my: `${taskType} ပြီးဆုံးပြီ`,
        ur: `${taskType} مکمل`,
        th: `${taskType} เสร็จแล้ว`,
        zh: `${taskType}已完成`,
      };
      speak(messages[language]);
    },
    [language, speak]
  );

  const notifyNewOrder = useCallback(() => {
    const messages: Record<Language, string> = {
      ja: "新しい注文が入りました",
      en: "New order received",
      vi: "Có đơn hàng mới",
      ne: "नयाँ अर्डर आयो",
      id: "Ada pesanan baru",
      my: "မှာယူမှုအသစ်ရှိသည်",
      ur: "نیا آرڈر آیا",
      th: "มีออเดอร์ใหม่",
      zh: "新订单来了",
    };
    speak(messages[language]);
  }, [language, speak]);

  return { speak, notifyTaskComplete, notifyNewOrder };
}
