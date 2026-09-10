import { useNavigate } from "react-router-dom"
import { getRecent } from "../lib/user"

export default function RoomsMenu({ current }: { current: string }) {
  const nav = useNavigate()
  const rooms = getRecent()
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
