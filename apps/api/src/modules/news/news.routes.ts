import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { NewsService } from "./news.service.js";

const newsQuerySchema = z.object({
  page: z.coerce.number().optional(),
  pageSize: z.coerce.number().optional(),
  keyword: z.string().optional(),
  category: z.string().optional(),
  source: z.string().optional(),
  sentiment: z.string().optional(),
});

export async function registerNewsRoutes(app: FastifyInstance, service: NewsService) {
  app.get("/health", async () => ({
    ok: true,
    scheduler: service.getSchedulerState(),
  }));

  app.get("/api/v1/news", async (request) => {
    const query = newsQuerySchema.parse(request.query);
    return service.getNews(query);
  });

  app.get("/api/v1/news/:id", async (request, reply) => {
    const { id } = z.object({ id: z.string().min(1) }).parse(request.params);
    const detail = await service.getNewsDetail(id);
    if (!detail) {
      return reply.code(404).send({
        message: "news not found",
      });
    }
    return detail;
  });

  app.get("/api/v1/news/stats", async () => service.getStats());

  app.post("/api/v1/news/refresh", async () => service.triggerRefresh("manual"));

  app.post("/api/v1/news/sync", async () => service.syncLatestToEs());

  app.get("/finance/news", async (request) => {
    const query = newsQuerySchema.parse(request.query);
    return service.getNews(query);
  });

  app.get("/finance/news/:id", async (request, reply) => {
    const { id } = z.object({ id: z.string().min(1) }).parse(request.params);
    const detail = await service.getNewsDetail(id);
    if (!detail) {
      return reply.code(404).send({
        message: "news not found",
      });
    }
    return detail;
  });

  app.get("/finance/news/refresh", async () => service.triggerRefresh("manual"));

  app.get("/finance/news/sync", async () => service.syncLatestToEs());
}
