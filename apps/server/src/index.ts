import { createServer } from "node:http"
import path from "node:path"
import express from "express"
import { Server } from "socket.io"
import { createAdapter } from "@socket.io/redis-adapter"
import Redis from "ioredis"
import { env } from "./env"
import { memoryStore, redisStore } from "./store"
import { Rooms } from "./rooms"
import { attach } from "./socket"

// dev runs from apps/server via pnpm -r, the docker image runs from the repo root
const webDist = env.prod ? path.resolve("apps/web/dist") : path.resolve("../web/dist")

const app = express()
const http = createServer(app)
const io = new Server(http, {
  cors: env.origin ? { origin: env.origin } : undefined,
  maxHttpBufferSize: 4 * 1024 * 1024,
})

let redis: Redis | null = null
if (env.redisUrl) {
  // upstash only speaks tls, so a pasted redis:// url would just time out
  const url = env.redisUrl.replace(/^redis:\/\/(?=.*upstash\.io)/, "rediss://")
  redis = new Redis(url, { maxRetriesPerRequest: 3 })
  const sub = redis.duplicate()
  io.adapter(createAdapter(redis, sub))
  for (const c of [redis, sub]) c.on("error", (e) => console.error("redis:", e.message))
}

const rooms = new Rooms(redis ? redisStore(redis) : memoryStore())
attach(io, rooms)

app.get("/health", (_req, res) => {
  res.json({ ok: true, rooms: rooms.size, redis: redis ? redis.status : "off" })
})

app.use(express.static(webDist, { index: false }))
app.get("/{*path}", (req, res, next) => {
  if (req.path.startsWith("/socket.io")) return next()
  res.sendFile(path.join(webDist, "index.html"), (err) => err && next())
})

http.listen(env.port, () => {
  console.log(`sharedmd on :${env.port} (${redis ? "redis" : "memory"})`)
})

const shutdown = async () => {
  console.log("shutting down, flushing rooms")
  await rooms.flushAll()
  io.close()
  redis?.disconnect()
  process.exit(0)
}
process.on("SIGTERM", shutdown)
process.on("SIGINT", shutdown)
