import { useEffect, useState } from "react"
import { Link, Navigate, useParams } from "react-router-dom"
import { isRoomId } from "@sharedmd/shared"
import { useRoom } from "../hooks/useRoom"
import { getUser, touchRecent } from "../lib/user"
import { titleOf } from "../lib/markdown"
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
  const [user] = useState(getUser)
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

  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="brand">SharedMD</Link>
        <button className="room" onClick={copyLink} title="Copy link">
          {copied ? "link copied" : `/d/${id}`}
        </button>
        <span className="spacer" />
        <div className="seg" role="group" aria-label="View">
          <button aria-pressed={show === "write"} onClick={() => setShow("write")}>Write</button>
          <button aria-pressed={show === "preview"} onClick={() => setShow("preview")}>Preview</button>
        </div>
        <Presence peers={peers} me={me} />
        <StatusPill status={status} />
      </header>
      <div className="main" data-show={show}>
        <CodeEditor text={text} awareness={provider.awareness} />
        <Preview text={text} />
      </div>
    </div>
  )
}
