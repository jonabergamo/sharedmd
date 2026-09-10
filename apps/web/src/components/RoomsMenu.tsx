import { useNavigate } from "react-router-dom"
import { getRecent } from "../lib/user"

export default function RoomsMenu({ current, title }: { current: string; title: string }) {
  const nav = useNavigate()
  const rooms = getRecent().map((r) => (r.id === current ? { ...r, title } : r))
  if (!rooms.some((r) => r.id === current)) rooms.unshift({ id: current, title, at: Date.now() })
  const go = (e: React.MouseEvent, id: string) => {
    e.currentTarget.closest("details")?.removeAttribute("open")
    if (id !== current) nav(`/d/${id}`)
  }

  return (
    <details className="menu rooms">
      <summary title="Documents you opened on this device">Rooms</summary>
      <div>
        {rooms.map((r) => (
          <button key={r.id} aria-current={r.id === current} onClick={(e) => go(e, r.id)}>
            <span className="title">{r.title}</span>
            <time dateTime={new Date(r.at).toISOString()}>{new Date(r.at).toLocaleDateString()}</time>
          </button>
        ))}
      </div>
    </details>
  )
}
