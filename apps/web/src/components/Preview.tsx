import { useEffect, useState } from "react"
import type * as Y from "yjs"
import { render } from "../lib/markdown"

export default function Preview({ text }: { text: Y.Text }) {
  const [html, setHtml] = useState(() => render(text.toString()))

  useEffect(() => {
    let raf = 0
    const onChange = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setHtml(render(text.toString())))
    }
    text.observe(onChange)
    onChange()
    return () => {
      text.unobserve(onChange)
      cancelAnimationFrame(raf)
    }
  }, [text])

  if (!html.trim()) {
    return (
      <div className="pane preview-pane">
        <div className="preview"><p className="empty">Nothing to preview yet.</p></div>
      </div>
    )
  }
  return (
    <div className="pane preview-pane">
      <article className="preview" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
