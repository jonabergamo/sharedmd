import { useEffect, useRef } from "react"
import { EditorState } from "@codemirror/state"
import { EditorView, keymap, drawSelection, highlightActiveLine, placeholder } from "@codemirror/view"
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands"
import { markdown } from "@codemirror/lang-markdown"
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language"
import { tags as t } from "@lezer/highlight"
import { yCollab } from "y-codemirror.next"
import type * as Y from "yjs"
import type { Awareness } from "y-protocols/awareness"

type Props = { text: Y.Text; awareness: Awareness }

const theme = EditorView.theme({
  "&": { backgroundColor: "var(--bg)", color: "var(--text)" },
  ".cm-content": { caretColor: "var(--text)" },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--text)" },
  "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground": {
    backgroundColor: "color-mix(in srgb, var(--accent) 30%, transparent)",
  },
  ".cm-gutters": { display: "none" },
  ".cm-activeLine": { backgroundColor: "color-mix(in srgb, var(--text) 4%, transparent)" },
  ".cm-placeholder": { color: "var(--muted)" },
})

const syntax = HighlightStyle.define([
  { tag: t.heading, color: "var(--accent)", fontWeight: "700" },
  { tag: t.emphasis, fontStyle: "italic" },
  { tag: t.strong, fontWeight: "700" },
  { tag: t.strikethrough, textDecoration: "line-through" },
  { tag: [t.link, t.url], color: "var(--accent)", textDecoration: "underline" },
  { tag: [t.monospace, t.processingInstruction, t.contentSeparator], color: "var(--muted)" },
  { tag: t.quote, color: "var(--muted)", fontStyle: "italic" },
  { tag: t.list, color: "var(--muted)" },
])

export default function CodeEditor({ text, awareness }: Props) {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const view = new EditorView({
      parent: host.current!,
      state: EditorState.create({
        doc: text.toString(),
        extensions: [
          history(),
          drawSelection(),
          highlightActiveLine(),
          EditorView.lineWrapping,
          keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
          markdown(),
          theme,
          syntaxHighlighting(syntax),
          placeholder("Start typing. Share the link and watch it fill in."),
          yCollab(text, awareness),
        ],
      }),
    })
    view.focus()
    return () => view.destroy()
  }, [text, awareness])

  return <div ref={host} className="pane editor-pane" />
}
