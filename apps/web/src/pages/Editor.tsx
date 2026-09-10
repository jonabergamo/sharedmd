import { useEffect, useState } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import { isRoomId, newRoomId } from "@sharedmd/shared"
import { useRoom } from "../hooks/useRoom"
import { getUser, setUserName, touchRecent } from "../lib/user"
import { titleOf } from "../lib/markdown"
import { printPdf, saveMarkdown } from "../lib/download"
import CodeEditor from "../components/CodeEditor"
import Preview from "../components/Preview"
import Presence from "../components/Presence"
import StatusPill from "../components/StatusPill"

export default function Editor() {
  const { id } = useParams()
  if (!isRoomId(id)) return <Navigate to="/" replace />
  return <Room id={id} />
}

function Room({ id }: { id: string }) {
  const nav = useNavigate()
  const [user, setUser] = useState(getUser)
  const { provider, status, peers, me } = useRoom(id, user)
  const text = provider.doc.getText("content")
  const [show, setShow] = useState<"write" | "preview">("write")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const remember = () => touchRecent(id, titleOf(text.toString()))
    remember()
    const t = setInterval(remember, 10_000)
    return () => {
      clearInterval(t)
      remember()
    }
  }, [id, text])

  const copyLink = async () => {
    await navigator.clipboard.writeText(location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  const name = () => titleOf(text.toString()) || id
  const download = (e: React.MouseEvent, fn: (t: string, n: string) => void) => {
    fn(text.toString(), name())
    e.currentTarget.closest("details")?.removeAttribute("open")
  }

  return (
    <div className="app">
      <header className="topbar">
        <span className="brand">SharedMD</span>
        <button className="room" onClick={copyLink} title="Copy link">
          {copied ? "link copied" : `/d/${id}`}
        </button>
        <button className="ghost" onClick={() => nav(`/d/${newRoomId()}`)} title="Start a new document">New</button>
        <details className="menu">
          <summary>Download</summary>
          <div>
            <button onClick={(e) => download(e, saveMarkdown)}>Markdown (.md)</button>
            <button onClick={(e) => download(e, printPdf)}>PDF</button>
          </div>
        </details>
        <span className="spacer" />
        <div className="seg" role="group" aria-label="View">
          <button aria-pressed={show === "write"} onClick={() => setShow("write")}>Write</button>
          <button aria-pressed={show === "preview"} onClick={() => setShow("preview")}>Preview</button>
        </div>
        <Presence peers={peers} me={me} onRename={(n) => setUser(setUserName(n))} />
        <StatusPill status={status} />
      </header>
      <div className="main" data-show={show}>
        <CodeEditor text={text} awareness={provider.awareness} />
        <Preview text={text} />
      </div>
    </div>
  )
}
