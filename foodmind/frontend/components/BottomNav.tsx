"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/LangContext";

export default function BottomNav() {
  const pathname = usePathname();
  const t = useT();

  const TABS = [
    { href: "/",          label: t.navHome,      icon: "🏠" },
    { href: "/inventory", label: t.navInventory, icon: "❄️" },
    { href: "/add",       label: t.navAdd,       icon: "🛒" },
  ];

  return (
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
              <span className={`text-[10px] font-medium ${active ? "text-emerald-700" : "text-gray-400"}`}>
                {tab.label}
              </span>
              {active && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-600" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
