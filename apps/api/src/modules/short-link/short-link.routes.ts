import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { shortLinkService } from "./short-link.service.js";
import { AuthSessionService } from "../auth/session.service.js";

const createShortLinkSchema = z.object({
  originalUrl: z.string().url(),
  slug: z.string().min(1).max(50).optional(),
  description: z.string().max(200).optional(),
});

export async function registerShortLinkRoutes(app: FastifyInstance) {
  const sessionService = new AuthSessionService();

  const requireSession = async (request: FastifyRequest) => {
    const session = await sessionService.getSession(request);
    if (!session) {
      throw app.httpErrors.unauthorized("认证失败，请重新登录");
    }
    return session;
  };

  // Create short link
  app.post("/api/v1/short-links", async (request) => {
    const session = await requireSession(request);
    const body = createShortLinkSchema.parse(request.body);
    try {
      return await shortLinkService.create(session.userId, body);
    } catch (err: any) {
      if (err.message === "Slug already exists") {
        throw app.httpErrors.conflict("该 Slug 已被占用，请尝试其他名称");
      }
      throw err;
    }
  });

  // List short links
  app.get("/api/v1/short-links", async (request) => {
    const session = await requireSession(request);
    return shortLinkService.list(session.userId);
  });

  // Delete short link
  app.delete("/api/v1/short-links/:id", async (request) => {
    const session = await requireSession(request);
    const { id } = request.params as { id: string };
    const success = await shortLinkService.delete(session.userId, id);
    return { success };
  });

  // Public redirection endpoint
  app.get("/s/:slug", async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const url = await shortLinkService.resolve(slug);
    if (url) {
      return reply.redirect(url);
    } else {
      return reply.status(404).send({ message: "Short link not found" });
    }
  });
}
