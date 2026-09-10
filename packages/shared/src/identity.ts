export type User = { name: string; color: string; colorLight: string }

const adjectives = [
  "brave", "calm", "clever", "eager", "gentle", "happy", "jolly", "kind",
  "lucky", "merry", "nimble", "proud", "quick", "quiet", "sunny", "witty",
]
const animals = [
  "otter", "fox", "heron", "lynx", "panda", "quokka", "raven", "seal",
  "tapir", "wren", "yak", "zebra", "koala", "moose", "gecko", "bison",
]

export const palette = [
  "#e5484d", "#f76b15", "#ffb224", "#30a46c",
  "#0090ff", "#6e56cf", "#e93d82", "#12a594",
]

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]

export const randomName = () => `${pick(adjectives)} ${pick(animals)}`

export const randomUser = (): User => {
  const color = pick(palette)
  return { name: randomName(), color, colorLight: color + "55" }
}
