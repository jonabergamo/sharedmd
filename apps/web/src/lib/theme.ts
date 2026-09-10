import { useEffect, useState } from "react"

export const THEMES = ["slate", "paper", "forest", "plum"] as const
export type Theme = (typeof THEMES)[number]
export type Mode = "light" | "dark"

const KEY = "sharedmd.theme"

type Pref = { theme: Theme; mode: Mode }

export function load(): Pref {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  const dark = matchMedia("(prefers-color-scheme: dark)").matches
  return { theme: "slate", mode: dark ? "dark" : "light" }
}

export function apply({ theme, mode }: Pref) {
  const el = document.documentElement
  el.dataset.theme = theme
  el.dataset.mode = mode
  el.style.colorScheme = mode
}

export function useTheme() {
  const [pref, set] = useState(load)
  useEffect(() => {
    apply(pref)
    localStorage.setItem(KEY, JSON.stringify(pref))
  }, [pref])
  return {
    ...pref,
    setTheme: (theme: Theme) => set((p) => ({ ...p, theme })),
    toggleMode: () => set((p) => ({ ...p, mode: p.mode === "dark" ? "light" : "dark" })),
  }
}
