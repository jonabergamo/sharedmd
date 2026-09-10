import MarkdownIt from "markdown-it"
import DOMPurify from "dompurify"

const md = new MarkdownIt({ html: false, linkify: true, typographer: true })

DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A") {
    node.setAttribute("target", "_blank")
    node.setAttribute("rel", "noopener noreferrer")
  }
})

export const render = (src: string) => DOMPurify.sanitize(md.render(src), { ADD_ATTR: ["target"] })

export function titleOf(src: string) {
  const line = src.split("\n").find((l) => l.trim())
  return line ? line.replace(/^#+\s*/, "").slice(0, 80) : ""
}
