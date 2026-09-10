import type { Peer } from "../hooks/useRoom"

const MAX = 5

export default function Presence({ peers, me }: { peers: Peer[]; me: number }) {
  const shown = peers.slice(0, MAX)
  return (
    <div className="presence" aria-label={`${peers.length} online`}>
      {shown.map((p) => (
        <span
          key={p.id}
          className="chip"
          style={{ background: p.user.color }}
          title={p.id === me ? `${p.user.name} (you)` : p.user.name}
        >
          {p.user.name[0]}
        </span>
      ))}
      {peers.length > MAX && <span className="more">+{peers.length - MAX}</span>}
    </div>
  )
}
