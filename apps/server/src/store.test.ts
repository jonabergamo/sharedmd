import { expect, it } from "vitest"
import { memoryStore } from "./store"

it("memory store round trips bytes", async () => {
  const s = memoryStore()
  expect(await s.load("nope")).toBeNull()
  await s.save("id", new Uint8Array([1, 2, 3]))
  expect(await s.load("id")).toEqual(new Uint8Array([1, 2, 3]))
})
