import { Navigate } from "react-router-dom"
import { newRoomId } from "@sharedmd/shared"
import { getRecent } from "../lib/user"

export default function Home() {
  const last = getRecent()[0]
  if (last) return <Navigate to={`/d/${last.id}`} replace />
  return <Navigate to={`/d/${newRoomId()}`} replace state={{ fresh: true }} />
}
