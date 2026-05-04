import { useState } from "react";
import type { Language, StationType } from "./types";
import StationView from "./components/StationView";
import SetupScreen from "./components/SetupScreen";
import TableView from "./components/TableView";
import CustomerOrderView from "./components/CustomerOrderView";
import FoodBackground from "./components/FoodBackground";

export default function App() {
  const tableFromUrl = new URLSearchParams(window.location.search).get("table") ?? "";

  const [station, setStation] = useState<StationType | null>(null);
  const [language, setLanguage] = useState<Language>("ja");
  const [staffName, setStaffName] = useState<string>("");
  const [orderedId, setOrderedId] = useState<number | null>(null);

  // ── QRコードからのアクセス（?table=A1 など）──────────────
  if (tableFromUrl) {
    if (!orderedId) {
      return (
        <>
          <FoodBackground />
          <CustomerOrderView
            tableNumber={tableFromUrl}
            language={language}
            onChangeLanguage={setLanguage}
            onOrderSubmitted={setOrderedId}
          />
        </>
      );
    }
    return (
      <TableView
        tableNumber={tableFromUrl}
        language={language}
        onReset={() => setOrderedId(null)}
        onChangeLanguage={setLanguage}
      />
    );
  }

  // ── 厨房スタッフ（手動セットアップ）───────────────────────
  const handleStart = (s: StationType, l: Language, name: string) => {
    setStation(s);
    setLanguage(l);
    setStaffName(name);
  };

  const handleReset = () => {
    setStation(null);
    setStaffName("");
  };

  if (!station) {
    return (
      <>
        <FoodBackground />
        <SetupScreen onStart={handleStart} />
      </>
    );
  }

  return (
    <StationView
      station={station}
      language={language}
      staffName={staffName}
      onChangeLanguage={setLanguage}
      onReset={handleReset}
    />
  );
}
