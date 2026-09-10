export const env = {
  port: Number(process.env.PORT ?? 3000),
  redisUrl: process.env.REDIS_URL || null,
  origin: process.env.ORIGIN || null,
  prod: process.env.NODE_ENV === "production",
}
