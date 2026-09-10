import { customAlphabet } from "nanoid"

const alphabet = "23456789abcdefghjkmnpqrstuvwxyz"
const gen = customAlphabet(alphabet, 10)

export const newRoomId = () => gen()

export const isRoomId = (s: unknown): s is string =>
  typeof s === "string" && s.length === 10 && [...s].every((c) => alphabet.includes(c))
