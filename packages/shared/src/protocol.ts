export type Bytes = Uint8Array

export interface ClientToServer {
  join: (room: string, stateVector: Bytes, awareness: Bytes | null) => void
  update: (u: Bytes) => void
  awareness: (u: Bytes) => void
}

export interface ServerToClient {
  sync: (diff: Bytes, stateVector: Bytes) => void
  update: (u: Bytes) => void
  awareness: (u: Bytes) => void
  err: (code: "bad_room" | "too_big") => void
}

export const MAX_UPDATE = 2 * 1024 * 1024
