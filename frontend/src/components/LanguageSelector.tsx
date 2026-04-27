import type { Language } from "../types";
import { LANGUAGE_NAMES } from "../i18n/translations";

interface Props {
  current: Language;
  onChange: (lang: Language) => void;
}

const LANGS: Language[] = ["ja", "vi", "ne", "id", "my"];

export default function LanguageSelector({ current, onChange }: Props) {
  return (
    <div style={styles.root}>
      {LANGS.map((l) => (
        <button
          key={l}
          style={{
            ...styles.btn,
            ...(current === l ? styles.active : {}),
          }}
          onClick={() => onChange(l)}
        >
          {LANGUAGE_NAMES[l]}
        </button>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap" as const,
  },
  btn: {
    background: "#16213e",
    color: "#a0a0b0",
    border: "1px solid #0f3460",
    padding: "6px 12px",
    borderRadius: 8,
    fontSize: "0.8rem",
    cursor: "pointer",
  },
  active: {
    background: "#e9456022",
    borderColor: "#e94560",
    color: "#fff",
  },
};
