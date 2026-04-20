import { createClient, type RedisClientType } from "redis";

import { env } from "../config/env.js";

let redisClient: RedisClientType | null = null;

export async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      socket: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
      },
      password: env.REDIS_PASSWORD || undefined,
      database: env.REDIS_DATABASE,
    });

    redisClient.on("error", (error) => {
      console.error("redis error", error);
    });

    await redisClient.connect();
  }

  return redisClient;
}

export async function redisHealthcheck() {
  const client = await getRedisClient();
  await client.ping();
}
