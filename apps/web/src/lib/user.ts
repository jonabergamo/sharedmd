import { randomUser, type User } from "@sharedmd/shared"

const USER_KEY = "sharedmd.user"
const RECENT_KEY = "sharedmd.recent"

export function getUser(): User {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  const u = randomUser()
  localStorage.setItem(USER_KEY, JSON.stringify(u))
  return u
}

export function setUserName(name: string) {
  const u = { ...getUser(), name: name.trim() || randomUser().name }
  localStorage.setItem(USER_KEY, JSON.stringify(u))
  return u
}

export type Recent = { id: string; title: string; at: number }

export function getRecent(): Recent[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]")
  } catch {
    return []
  }
}

export function touchRecent(id: string, title: string) {
  const rest = getRecent().filter((r) => r.id !== id)
  const next = [{ id, title: title || "Untitled", at: Date.now() }, ...rest].slice(0, 12)
  localStorage.setItem(RECENT_KEY, JSON.stringify(next))
}
