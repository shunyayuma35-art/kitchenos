"use client";

import { useState, useEffect } from "react";
import QRCode from "react-qr-code";

export default function QRShare() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [isLocalhost, setIsLocalhost] = useState(false);

  useEffect(() => {
    const origin = window.location.origin;
    setUrl(origin);
    setIsLocalhost(
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    );
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-[140px] right-4 z-40 bg-white border border-gray-200
                   shadow-md rounded-2xl w-14 flex flex-col items-center justify-center
                   gap-0.5 py-2 px-1"
        title="QRコードでシェア"
      >
        <span className="text-xl leading-none">📷</span>
        <span className="text-[9px] font-bold text-gray-500 leading-tight text-center">
          シェア<br />QR
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-6"
          onClick={() => setOpen(false)}
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
                  <li>フロントエンドを一度止める</li>
                  <li>ターミナルで<br />
                    <code className="bg-amber-100 px-1 rounded text-[11px] break-all">npm run dev</code><br />
                    で再起動（すでに対応済み）
                  </li>
                  <li>PCのIPアドレスを確認<br />
                    <code className="bg-amber-100 px-1 rounded text-[11px]">ipconfig</code>（Windows）<br />
                    <code className="bg-amber-100 px-1 rounded text-[11px]">ifconfig</code>（Mac）
                  </li>
                  <li>ブラウザで<br />
                    <code className="bg-amber-100 px-1 rounded text-[11px] break-all">http://192.168.x.x:3000</code><br />
                    で開き直してください
                  </li>
                </ol>
                <p className="text-xs text-amber-500 mt-3">IPアドレスで開くと QRコードが使えます</p>
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

            <p className="text-xs text-amber-600 mt-2">
              同じWi-Fiでひらけます
            </p>

            <button
              onClick={() => setOpen(false)}
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
