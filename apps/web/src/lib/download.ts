import { render } from "./markdown"

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

export function saveMarkdown(text: string, name: string) {
  const a = document.createElement("a")
  a.href = URL.createObjectURL(new Blob([text], { type: "text/markdown" }))
  a.download = `${slug(name) || "document"}.md`
  a.click()
  URL.revokeObjectURL(a.href)
}

// the browser's print dialog does the pdf part, the window title becomes the file name
export function printPdf(text: string, name: string) {
  const w = window.open("", "_blank", "width=800,height=900")
  if (!w) return
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${slug(name) || "document"}</title>
<style>
  body { font: 15px/1.6 system-ui, sans-serif; color: #111; max-width: 720px; margin: 40px auto; padding: 0 24px; }
  h1, h2, h3 { line-height: 1.25; margin: 1.4em 0 0.5em; }
  pre { background: #f4f4f4; padding: 12px 14px; border-radius: 6px; overflow: auto; white-space: pre-wrap; }
  code { font-family: ui-monospace, monospace; font-size: 0.92em; }
  blockquote { margin: 0; padding-left: 14px; border-left: 3px solid #ccc; color: #555; }
  img { max-width: 100%; }
  table { border-collapse: collapse; } td, th { border: 1px solid #ccc; padding: 4px 10px; }
  a { color: inherit; }
</style></head><body>${render(text)}</body></html>`)
  w.document.close()
  w.onafterprint = () => w.close()
  setTimeout(() => w.print(), 200)
}
