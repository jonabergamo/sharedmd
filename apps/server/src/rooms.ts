import * as Y from "yjs"
import { Awareness, applyAwarenessUpdate, encodeAwarenessUpdate, removeAwarenessStates } from "y-protocols/awareness"
import type { Store } from "./store"

const SAVE_DEBOUNCE = 2000
const SAVE_MAX_WAIT = 30_000
const EVICT_AFTER = 60_000

export class Room {
  doc = new Y.Doc()
  awareness = new Awareness(this.doc)
  clients = new Map<string, Set<number>>()

  private dirty = false
  private saveTimer: NodeJS.Timeout | null = null
  private firstDirtyAt = 0
  private evictTimer: NodeJS.Timeout | null = null

  constructor(
    readonly id: string,
    private store: Store,
    private onEvict: (room: Room) => void,
  ) {
    // the server never edits, so awareness for its own client id is noise
    this.awareness.setLocalState(null)
    this.doc.on("update", () => this.markDirty())
    this.awareness.on("update", ({ added, updated }: { added: number[]; updated: number[] }, origin: unknown) => {
      const owned = typeof origin === "string" ? this.clients.get(origin) : null
      if (!owned) return
      for (const id of added) owned.add(id)
      for (const id of updated) owned.add(id)
    })
  }

  async load() {
    const bytes = await this.store.load(this.id)
    if (bytes) Y.applyUpdate(this.doc, bytes, "store")
  }

  join(socketId: string) {
    this.clients.set(socketId, new Set())
    if (this.evictTimer) {
      clearTimeout(this.evictTimer)
      this.evictTimer = null
    }
  }

  leave(socketId: string) {
    const ids = [...(this.clients.get(socketId) ?? [])]
    this.clients.delete(socketId)

    let removal: Uint8Array | null = null
    if (ids.length) {
      removeAwarenessStates(this.awareness, ids, "disconnect")
      removal = encodeAwarenessUpdate(this.awareness, ids)
    }
    if (this.clients.size === 0) {
      void this.flush()
      this.evictTimer = setTimeout(() => this.onEvict(this), EVICT_AFTER)
    }
    return removal
  }

  sync(stateVector: Uint8Array) {
    return {
      diff: Y.encodeStateAsUpdate(this.doc, stateVector),
      sv: Y.encodeStateVector(this.doc),
    }
  }

  applyUpdate(u: Uint8Array, origin: string) {
    Y.applyUpdate(this.doc, u, origin)
  }

  applyAwareness(u: Uint8Array, socketId: string) {
    applyAwarenessUpdate(this.awareness, u, socketId)
  }

  fullAwareness() {
    const ids = [...this.awareness.getStates().keys()]
    return ids.length ? encodeAwarenessUpdate(this.awareness, ids) : null
  }

  private markDirty() {
    const now = Date.now()
    if (!this.dirty) this.firstDirtyAt = now
    this.dirty = true

    if (this.saveTimer) clearTimeout(this.saveTimer)
    const waited = now - this.firstDirtyAt
    const delay = waited >= SAVE_MAX_WAIT ? 0 : Math.min(SAVE_DEBOUNCE, SAVE_MAX_WAIT - waited)
    this.saveTimer = setTimeout(() => void this.flush(), delay)
  }

  async flush() {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer)
      this.saveTimer = null
    }
    if (!this.dirty) return
    this.dirty = false
    await this.store.save(this.id, Y.encodeStateAsUpdate(this.doc))
  }

  destroy() {
    if (this.saveTimer) clearTimeout(this.saveTimer)
    if (this.evictTimer) clearTimeout(this.evictTimer)
    this.awareness.destroy()
    this.doc.destroy()
  }
}

export class Rooms {
  private rooms = new Map<string, Room>()
  private loading = new Map<string, Promise<Room>>()

  constructor(private store: Store) {}

  get(id: string) {
    const hit = this.rooms.get(id)
    if (hit) return Promise.resolve(hit)

    let pending = this.loading.get(id)
    if (pending) return pending

    pending = (async () => {
      const room = new Room(id, this.store, (r) => this.evict(r))
      await room.load()
      this.rooms.set(id, room)
      this.loading.delete(id)
      return room
    })()
    this.loading.set(id, pending)
    return pending
  }

  peek(id: string) {
    return this.rooms.get(id)
  }

  get size() {
    return this.rooms.size
  }

  private evict(room: Room) {
    if (room.clients.size) return
    this.rooms.delete(room.id)
    room.destroy()
  }

  async flushAll() {
    await Promise.all([...this.rooms.values()].map((r) => r.flush()))
  }
}
