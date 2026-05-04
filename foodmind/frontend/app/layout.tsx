import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import AllergenSettings from "@/components/AllergenSettings";
import Onboarding from "@/components/Onboarding";

export const metadata: Metadata = {
  title: "パシャ食",
  description: "余った食材でサクッとごはん",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body className="bg-gray-50">
        <Providers>
          <Onboarding />
          {children}
          <LanguageSwitcher />
          <AllergenSettings />
        </Providers>
      </body>
    </html>
  );
}
