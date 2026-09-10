import { useState } from "react"
import type { Peer } from "../hooks/useRoom"

const MAX = 5

type Props = { peers: Peer[]; me: number; onRename: (name: string) => void }

export default function Presence({ peers, me, onRename }: Props) {
  const [editing, setEditing] = useState(false)
  const shown = peers.slice(0, MAX)
  const mine = peers.find((p) => p.id === me)

  const done = (name: string) => {
    onRename(name)
    setEditing(false)
  }

  return (
    <div className="presence" aria-label={`${peers.length} online`}>
      {shown.map((p) =>
        p.id === me ? (
          <button
            key={p.id}
            className="chip"
            style={{ background: p.user.color }}
            title={`${p.user.name} (you), click to rename`}
            onClick={() => setEditing((v) => !v)}
          >
            {p.user.name[0]}
          </button>
        ) : (
          <span key={p.id} className="chip" style={{ background: p.user.color }} title={p.user.name}>
            {p.user.name[0]}
          </span>
        ),
      )}
      {peers.length > MAX && <span className="more">+{peers.length - MAX}</span>}
      {editing && mine && (
        <div className="rename">
          <input
            autoFocus
            defaultValue={mine.user.name}
            maxLength={24}
            onBlur={(e) => done(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") done(e.currentTarget.value)
              if (e.key === "Escape") setEditing(false)
            }}
          />
        </div>
      )}
    </div>
  )
}
