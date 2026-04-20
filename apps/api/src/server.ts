import Fastify from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";

import { env } from "./config/env.js";
import { postgresHealthcheck } from "./lib/postgres.js";
import { redisHealthcheck } from "./lib/redis.js";
import { registerAuthRoutes } from "./modules/auth/auth.routes.js";
import { registerNewsRoutes } from "./modules/news/news.routes.js";
import { NewsScheduler } from "./modules/news/news.scheduler.js";
import { NewsService } from "./modules/news/news.service.js";

const app = Fastify({
  logger: {
    transport:
      process.env.NODE_ENV === "production"
        ? undefined
        : {
            target: "pino-pretty",
            options: {
              translateTime: "SYS:standard",
              ignore: "pid,hostname",
            },
          },
  },
});

const newsService = new NewsService();
const scheduler = new NewsScheduler(newsService);

await app.register(sensible);
await app.register(cookie);
await app.register(cors, {
  origin: env.CORS_ORIGIN.split(",").map((origin) => origin.trim()),
  credentials: true,
});

await registerAuthRoutes(app);
await registerNewsRoutes(app, newsService);

app.addHook("onReady", async () => {
  await Promise.all([
    newsService.healthcheck(),
    postgresHealthcheck(),
    redisHealthcheck(),
  ]);
  scheduler.start();
});

app.addHook("onClose", async () => {
  scheduler.stop();
});

await app.listen({
  host: env.API_HOST,
  port: env.API_PORT,
});
