import type { Status } from "../lib/provider"

const label: Record<Status, string> = {
  connecting: "connecting",
  synced: "synced",
  offline: "offline, changes kept locally",
}
const color: Record<Status, string> = {
  connecting: "var(--warn)",
  synced: "var(--ok)",
  offline: "var(--bad)",
}

export default function StatusPill({ status }: { status: Status }) {
  return (
    <span className="status">
      <span className="dot" style={{ background: color[status] }} />
      {label[status]}
    </span>
  )
}
