import { expect, it } from "vitest"
import { palette, randomUser } from "./identity"

it("random user has a name and a palette colour", () => {
  const u = randomUser()
  expect(u.name.split(" ")).toHaveLength(2)
  expect(palette).toContain(u.color)
  expect(u.colorLight.startsWith(u.color)).toBe(true)
})
