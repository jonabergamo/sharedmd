import type Redis from "ioredis"

export interface Store {
  load(id: string): Promise<Uint8Array | null>
  save(id: string, bytes: Uint8Array): Promise<void>
}

export function memoryStore(): Store {
  const docs = new Map<string, Uint8Array>()
  return {
    async load(id) {
      return docs.get(id) ?? null
    },
    async save(id, bytes) {
      docs.set(id, bytes)
    },
  }
}

const TTL = 60 * 60 * 24 * 30

export function redisStore(redis: Redis): Store {
  const key = (id: string) => `sharedmd:doc:${id}`
  return {
    async load(id) {
      const buf = await redis.getBuffer(key(id))
      return buf ? new Uint8Array(buf) : null
    },
    async save(id, bytes) {
      await redis.set(key(id), Buffer.from(bytes), "EX", TTL)
    },
  }
}
