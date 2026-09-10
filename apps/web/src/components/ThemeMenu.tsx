import { THEMES, useTheme, type Theme } from "../lib/theme"

const LABEL: Record<Theme, string> = { slate: "Slate", paper: "Paper", forest: "Forest", plum: "Plum" }

export default function ThemeMenu() {
  const { theme, mode, setTheme, toggleMode } = useTheme()
  return (
    <details className="menu themes">
      <summary title="Theme">{LABEL[theme]}</summary>
      <div>
        {THEMES.map((t) => (
          <button key={t} data-theme={t} aria-pressed={t === theme} onClick={() => setTheme(t)}>
            <span className="swatch" />
            {LABEL[t]}
          </button>
        ))}
        <button className="mode" onClick={toggleMode}>
          {mode === "dark" ? "Switch to light" : "Switch to dark"}
        </button>
      </div>
    </details>
  )
}
