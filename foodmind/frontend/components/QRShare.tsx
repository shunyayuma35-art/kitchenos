"use client";

import { useState, useEffect } from "react";
import QRCode from "react-qr-code";

export default function QRShare() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.origin);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-[140px] right-4 z-40 bg-white border border-gray-200
                   shadow-md rounded-2xl w-12 h-12 flex items-center justify-center text-xl"
        title="QRコードでシェア"
      >
        📷
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
            <h2 className="font-bold text-lg text-gray-800 mb-1">アプリをシェア</h2>
            <p className="text-xs text-gray-400 mb-4">このQRコードを読み取ってください</p>

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
            <p className="text-xs text-amber-600 mt-2">
              ※ 同じWi-Fiでご利用ください
            </p>

            <button
              onClick={() => setOpen(false)}
              className="mt-4 w-full py-3 rounded-2xl bg-amber-600 text-white font-bold"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </>
  );
}
