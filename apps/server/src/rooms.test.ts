import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import * as Y from "yjs"
import { Awareness, applyAwarenessUpdate, encodeAwarenessUpdate } from "y-protocols/awareness"
import { Rooms } from "./rooms"
import { memoryStore, type Store } from "./store"

function client(room: { sync: (sv: Uint8Array) => { diff: Uint8Array } }) {
  const doc = new Y.Doc()
  const { diff } = room.sync(Y.encodeStateVector(doc))
  Y.applyUpdate(doc, diff)
  return doc
}

describe("Room", () => {
  let store: Store
  let rooms: Rooms

  beforeEach(() => {
    vi.useFakeTimers()
    store = memoryStore()
    rooms = new Rooms(store)
  })
  afterEach(() => vi.useRealTimers())

  it("two clients converge through the room", async () => {
    const room = await rooms.get("abcdefghjk")
    room.join("a")
    room.join("b")
    const a = client(room)
    const b = client(room)

    a.getText("t").insert(0, "hello")
    room.applyUpdate(Y.encodeStateAsUpdate(a), "a")
    b.getText("t").insert(0, "world ")
    room.applyUpdate(Y.encodeStateAsUpdate(b), "b")

    Y.applyUpdate(a, room.sync(Y.encodeStateVector(a)).diff)
    Y.applyUpdate(b, room.sync(Y.encodeStateVector(b)).diff)

    expect(a.getText("t").toString()).toBe(b.getText("t").toString())
    expect(room.doc.getText("t").toString()).toBe(a.getText("t").toString())
  })

  it("saves after the debounce and on last leave", async () => {
    const save = vi.spyOn(store, "save")
    const room = await rooms.get("abcdefghjk")
    room.join("a")
    room.doc.getText("t").insert(0, "x")
    expect(save).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(2100)
    expect(save).toHaveBeenCalledTimes(1)

    room.doc.getText("t").insert(1, "y")
    room.leave("a")
    await vi.advanceTimersByTimeAsync(0)
    expect(save).toHaveBeenCalledTimes(2)
    expect(await store.load("abcdefghjk")).toBeTruthy()
  })

  it("reloads persisted state for a fresh room", async () => {
    const room = await rooms.get("abcdefghjk")
    room.join("a")
    room.doc.getText("t").insert(0, "kept")
    room.leave("a")
    await vi.advanceTimersByTimeAsync(61_000)
    expect(rooms.peek("abcdefghjk")).toBeUndefined()

    const again = await rooms.get("abcdefghjk")
    expect(again.doc.getText("t").toString()).toBe("kept")
  })

  it("drops a client's awareness when it leaves and encodes the removal", async () => {
    const room = await rooms.get("abcdefghjk")
    room.join("a")
    const aw = new Awareness(new Y.Doc())
    aw.setLocalStateField("user", { name: "otter" })
    room.applyAwareness(encodeAwarenessUpdate(aw, [aw.clientID]), "a")
    expect(room.awareness.getStates().size).toBe(1)

    const removal = room.leave("a")
    expect(room.awareness.getStates().size).toBe(0)

    const other = new Awareness(new Y.Doc())
    other.setLocalState(null)
    applyAwarenessUpdate(other, encodeAwarenessUpdate(aw, [aw.clientID]), "x")
    expect(other.getStates().size).toBe(1)
    applyAwarenessUpdate(other, removal!, "x")
    expect(other.getStates().size).toBe(0)
  })

  it("does not evict while someone is still connected", async () => {
    const room = await rooms.get("abcdefghjk")
    room.join("a")
    room.join("b")
    room.leave("a")
    await vi.advanceTimersByTimeAsync(61_000)
    expect(rooms.peek("abcdefghjk")).toBe(room)
  })
})
