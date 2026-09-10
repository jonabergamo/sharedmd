import { useEffect, useState } from "react"
import type * as Y from "yjs"
import { titleOf } from "../lib/markdown"

export function useTitle(text: Y.Text) {
  const [title, setTitle] = useState(() => titleOf(text.toString()))
  useEffect(() => {
    const update = () => setTitle(titleOf(text.toString()))
    update()
    text.observe(update)
    return () => text.unobserve(update)
  }, [text])
  return title || "Untitled"
}
