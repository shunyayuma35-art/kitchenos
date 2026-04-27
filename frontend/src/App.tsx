import { useState } from "react";
import type { Language, StationType } from "./types";
import StationView from "./components/StationView";
import SetupScreen from "./components/SetupScreen";
import TableView from "./components/TableView";
import FoodBackground from "./components/FoodBackground";

export default function App() {
  const [station, setStation] = useState<StationType | null>(null);
  const [language, setLanguage] = useState<Language>("ja");
  const [staffName, setStaffName] = useState<string>("");
  const [tableNumber, setTableNumber] = useState<string>("");

  const handleStart = (
    s: StationType,
    l: Language,
    name: string,
    tableNum?: string
  ) => {
    setStation(s);
    setLanguage(l);
    setStaffName(name);
    setTableNumber(tableNum ?? "");
  };

  const handleReset = () => {
    setStation(null);
    setStaffName("");
    setTableNumber("");
  };

  if (!station) {
    return (
      <>
        <FoodBackground />
        <SetupScreen onStart={handleStart} />
      </>
    );
  }

  // 客席・カウンタータブレット
  if (station === "table") {
    return (
      <TableView
        tableNumber={tableNumber}
        language={language}
        onReset={handleReset}
        onChangeLanguage={setLanguage}
      />
    );
  }

  // 厨房スタッフ画面
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
