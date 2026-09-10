import type { Server, Socket } from "socket.io"
import { isRoomId, MAX_UPDATE, type ClientToServer, type ServerToClient } from "@sharedmd/shared"
import type { Rooms } from "./rooms"

type IO = Server<ClientToServer, ServerToClient>
type Sock = Socket<ClientToServer, ServerToClient>

const bytes = (x: unknown) => (x instanceof Uint8Array ? x : new Uint8Array(x as ArrayBuffer))

export function attach(io: IO, rooms: Rooms) {
  io.on("connection", (socket: Sock) => {
    let roomId: string | null = null

    socket.on("join", async (id, sv, aw) => {
      if (!isRoomId(id)) return socket.emit("err", "bad_room")
      if (roomId && roomId !== id) {
        rooms.peek(roomId)?.leave(socket.id)
        await socket.leave(roomId)
      }
      roomId = id

      const room = await rooms.get(id)
      room.join(socket.id)
      await socket.join(id)

      const { diff, sv: mine } = room.sync(bytes(sv))
      socket.emit("sync", diff, mine)

      if (aw) {
        const u = bytes(aw)
        room.applyAwareness(u, socket.id)
        socket.to(id).emit("awareness", u)
      }
      const all = room.fullAwareness()
      if (all) socket.emit("awareness", all)
    })

    socket.on("update", (raw) => {
      const room = roomId && rooms.peek(roomId)
      if (!room) return
      const u = bytes(raw)
      if (u.byteLength > MAX_UPDATE) return socket.emit("err", "too_big")
      room.applyUpdate(u, socket.id)
      socket.to(room.id).emit("update", u)
    })

    socket.on("awareness", (raw) => {
      const room = roomId && rooms.peek(roomId)
      if (!room) return
      const u = bytes(raw)
      room.applyAwareness(u, socket.id)
      socket.to(room.id).emit("awareness", u)
    })

    socket.on("disconnect", () => {
      const room = roomId && rooms.peek(roomId)
      if (!room) return
      const removal = room.leave(socket.id)
      if (removal) io.to(room.id).emit("awareness", removal)
    })
  })
}
