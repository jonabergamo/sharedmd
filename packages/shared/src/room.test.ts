import { describe, expect, it } from "vitest"
import { isRoomId, newRoomId } from "./room"

describe("room ids", () => {
  it("makes 10 char ids that validate", () => {
    for (let i = 0; i < 50; i++) {
      const id = newRoomId()
      expect(id).toHaveLength(10)
      expect(isRoomId(id)).toBe(true)
    }
  })

  it("rejects junk", () => {
    expect(isRoomId("")).toBe(false)
    expect(isRoomId("too-short")).toBe(false)
    expect(isRoomId("UPPERCASE1")).toBe(false)
    expect(isRoomId("has space 1")).toBe(false)
    expect(isRoomId(42)).toBe(false)
  })
})
