import { useEffect, useRef } from "react"
import { EditorState } from "@codemirror/state"
import { EditorView, keymap, drawSelection, highlightActiveLine, placeholder } from "@codemirror/view"
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands"
import { markdown } from "@codemirror/lang-markdown"
import { oneDark } from "@codemirror/theme-one-dark"
import { yCollab } from "y-codemirror.next"
import type * as Y from "yjs"
import type { Awareness } from "y-protocols/awareness"

type Props = { text: Y.Text; awareness: Awareness }

const theme = EditorView.theme({
  "&": { backgroundColor: "var(--bg)" },
  ".cm-gutters": { display: "none" },
  ".cm-activeLine": { backgroundColor: "rgba(255,255,255,0.03)" },
})

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
          oneDark,
          theme,
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
