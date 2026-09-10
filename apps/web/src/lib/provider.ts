import { io, type Socket } from "socket.io-client"
import * as Y from "yjs"
import { Awareness, applyAwarenessUpdate, encodeAwarenessUpdate, removeAwarenessStates } from "y-protocols/awareness"
import type { ClientToServer, ServerToClient, User } from "@sharedmd/shared"

export type Status = "connecting" | "synced" | "offline"

type Listener = (s: Status) => void

const bytes = (x: unknown) => (x instanceof Uint8Array ? x : new Uint8Array(x as ArrayBuffer))

export class Provider {
  doc = new Y.Doc()
  awareness = new Awareness(this.doc)
  status: Status = "connecting"

  private socket: Socket<ServerToClient, ClientToServer> | null = null
  private listeners = new Set<Listener>()

  constructor(readonly room: string, private user: User) {
    this.awareness.setLocalStateField("user", user)

    this.doc.on("update", (u: Uint8Array, origin: unknown) => {
      if (origin !== this && this.socket?.connected) this.socket.emit("update", u)
    })
    this.awareness.on("update", ({ added, updated, removed }: Record<string, number[]>, origin: unknown) => {
      if (origin !== "local" || !this.socket?.connected) return
      const ids = added.concat(updated, removed)
      this.socket.emit("awareness", encodeAwarenessUpdate(this.awareness, ids))
    })
  }

  connect() {
    if (this.socket) return
    // disconnect() clears our awareness state so others drop the cursor right away
    if (!this.awareness.getLocalState()) this.awareness.setLocalState({ user: this.user })
    const socket: Socket<ServerToClient, ClientToServer> = io({ transports: ["websocket", "polling"] })
    this.socket = socket

    socket.on("connect", () => this.join())
    socket.on("disconnect", () => this.set("offline"))
    socket.io.on("reconnect_attempt", () => this.set("connecting"))

    socket.on("sync", (diff, sv) => {
      Y.applyUpdate(this.doc, bytes(diff), this)
      const missing = Y.encodeStateAsUpdate(this.doc, bytes(sv))
      // an empty update still carries a couple of header bytes
      if (missing.byteLength > 2) socket.emit("update", missing)
      this.set("synced")
    })
    socket.on("update", (u) => Y.applyUpdate(this.doc, bytes(u), this))
    socket.on("awareness", (u) => applyAwarenessUpdate(this.awareness, bytes(u), this))
    socket.on("err", (code) => console.warn("server:", code))

    window.addEventListener("beforeunload", this.bye)
  }

  disconnect() {
    if (!this.socket) return
    window.removeEventListener("beforeunload", this.bye)
    this.bye()
    this.socket.disconnect()
    this.socket = null
    this.set("connecting")
  }

  private join() {
    this.set("connecting")
    const sv = Y.encodeStateVector(this.doc)
    const aw = encodeAwarenessUpdate(this.awareness, [this.awareness.clientID])
    this.socket?.emit("join", this.room, sv, aw)
  }

  private bye = () => {
    removeAwarenessStates(this.awareness, [this.awareness.clientID], "unload")
  }

  setUser(user: User) {
    this.user = user
    this.awareness.setLocalState({ user })
  }

  onStatus(fn: Listener) {
    this.listeners.add(fn)
    fn(this.status)
    return () => this.listeners.delete(fn)
  }

  private set(s: Status) {
    if (s === this.status) return
    this.status = s
    this.listeners.forEach((fn) => fn(s))
  }
}
