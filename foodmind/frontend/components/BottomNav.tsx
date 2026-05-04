"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/LangContext";
import { useState, useEffect } from "react";
import QRCode from "react-qr-code";

export default function BottomNav() {
  const pathname = usePathname();
  const t = useT();
  const [qrOpen, setQrOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [isLocalhost, setIsLocalhost] = useState(false);

  useEffect(() => {
    setUrl(window.location.origin);
    setIsLocalhost(
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    );
  }, []);

  const TABS = [
    { href: "/",          label: t.navHome,      icon: "🏠" },
    { href: "/inventory", label: t.navInventory, icon: "❄️" },
    { href: "/add",       label: t.navAdd,       icon: "➕" },
    { href: "/shopping",  label: t.navShopping,  icon: "🛒" },
  ];

  return (
    <>
      <nav
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm
                   bg-white/90 backdrop-blur-md border-t border-gray-100"
        style={{ boxShadow: "0 -4px 20px rgba(0,0,0,0.06)" }}
      >
        <div className="flex">
          {TABS.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors relative"
              >
                <span className={`text-xl transition-transform ${active ? "scale-110" : "scale-100 opacity-50"}`}>
                  {tab.icon}
                </span>
                <span className={`text-[10px] font-medium ${active ? "text-amber-700" : "text-gray-400"}`}>
                  {tab.label}
                </span>
                {active && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-amber-600" />
                )}
              </Link>
            );
          })}

          {/* QRシェアボタン */}
          <button
            onClick={() => setQrOpen(true)}
            className="flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors active:scale-95"
          >
            <span className="text-xl opacity-50">📷</span>
            <span className="text-[10px] font-medium text-gray-400">{t.navShare}</span>
          </button>
        </div>
      </nav>

      {/* QRモーダル */}
      {qrOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-6"
          onClick={() => setQrOpen(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 w-full max-w-xs text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-bold text-lg text-gray-800 mb-1">家族や友だちに教えてあげよう</h2>
            <p className="text-xs text-gray-400 mb-4">カメラでかざすだけ！</p>

            {isLocalhost ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left">
                <p className="text-sm font-bold text-amber-700 mb-2">⚠️ スマホから開くには</p>
                <ol className="text-xs text-amber-700 space-y-1.5 list-decimal list-inside leading-relaxed">
                  <li>PCのIPアドレスを確認<br />
                    <code className="bg-amber-100 px-1 rounded text-[11px]">ipconfig</code>（Windows）
                  </li>
                  <li>ブラウザで<br />
                    <code className="bg-amber-100 px-1 rounded text-[11px] break-all">http://192.168.x.x:3000</code><br />
                    で開き直してください
                  </li>
                </ol>
                <p className="text-xs text-amber-500 mt-3">IPアドレスで開くとQRコードが使えます</p>
              </div>
            ) : (
              <>
                <div className="bg-white p-3 rounded-2xl border border-gray-100 inline-block">
                  {url && (
                    <QRCode
                      value={url}
                      size={180}
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-3 break-all">{url}</p>
              </>
            )}

            <p className="text-xs text-amber-600 mt-2">同じWi-Fiでひらけます</p>

            <button
              onClick={() => setQrOpen(false)}
              className="mt-4 w-full py-3 rounded-2xl bg-amber-600 text-white font-bold"
            >
              とじる
            </button>
          </div>
        </div>
      )}
    </>
  );
}
