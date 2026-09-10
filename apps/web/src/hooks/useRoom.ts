import { useEffect, useMemo, useState } from "react"
import type { User } from "@sharedmd/shared"
import { Provider, type Status } from "../lib/provider"

export type Peer = { id: number; user: User }

export function useRoom(room: string, user: User) {
  const provider = useMemo(() => new Provider(room, user), [room])
  const [status, setStatus] = useState<Status>(provider.status)
  const [peers, setPeers] = useState<Peer[]>([])

  useEffect(() => {
    const off = provider.onStatus(setStatus)
    const aw = provider.awareness
    const refresh = () => {
      const list: Peer[] = []
      aw.getStates().forEach((state, id) => {
        if (state?.user) list.push({ id, user: state.user as User })
      })
      list.sort((a, b) => (a.id === aw.clientID ? -1 : b.id === aw.clientID ? 1 : a.id - b.id))
      setPeers(list)
    }
    refresh()
    aw.on("change", refresh)
    provider.connect()
    return () => {
      off()
      aw.off("change", refresh)
      provider.disconnect()
    }
  }, [provider])

  useEffect(() => {
    provider.setUser(user)
  }, [provider, user])

  return { provider, status, peers, me: provider.awareness.clientID }
}
