import { describe, expect, it } from "vitest"
import Redis from "ioredis"
import { memoryStore, redisStore } from "./store"

it("memory store round trips bytes", async () => {
  const s = memoryStore()
  expect(await s.load("nope")).toBeNull()
  await s.save("id", new Uint8Array([1, 2, 3]))
  expect(await s.load("id")).toEqual(new Uint8Array([1, 2, 3]))
})

describe.skipIf(!process.env.REDIS_URL)("redis store", () => {
  it("round trips bytes and sets a ttl", async () => {
    const redis = new Redis(process.env.REDIS_URL!)
    const s = redisStore(redis)
    const id = "test" + Date.now()
    await s.save(id, new Uint8Array([9, 8, 7]))
    expect(await s.load(id)).toEqual(new Uint8Array([9, 8, 7]))
    expect(await redis.ttl(`sharedmd:doc:${id}`)).toBeGreaterThan(0)
    await redis.del(`sharedmd:doc:${id}`)
    redis.disconnect()
  })
})
