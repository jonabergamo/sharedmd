import { Navigate } from "react-router-dom"
import { newRoomId } from "@sharedmd/shared"
import { getRecent } from "../lib/user"

export default function Home() {
  const last = getRecent()[0]
  return <Navigate to={`/d/${last?.id ?? newRoomId()}`} replace />
}
