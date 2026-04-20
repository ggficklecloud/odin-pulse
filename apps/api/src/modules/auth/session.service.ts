import { randomBytes } from "node:crypto";

import type { FastifyReply, FastifyRequest } from "fastify";

import { env } from "../../config/env.js";
import { getRedisClient } from "../../lib/redis.js";
import type { AuthSession } from "./auth.types.js";

const SESSION_PREFIX = "odinpulse:session:";

export class AuthSessionService {
  async createSession(
    reply: FastifyReply,
    session: Omit<AuthSession, "sessionId">,
  ): Promise<AuthSession> {
    const sessionId = randomBytes(32).toString("hex");
    const payload: AuthSession = {
      sessionId,
      ...session,
    };

    const redis = await getRedisClient();
    await redis.set(`${SESSION_PREFIX}${sessionId}`, JSON.stringify(payload), {
      expiration: {
        type: "EX",
        value: env.SESSION_TTL_SECONDS,
      },
    });

    reply.setCookie(env.SESSION_COOKIE_NAME, sessionId, {
      path: "/",
      httpOnly: true,
      secure: env.SESSION_SECURE,
      sameSite: env.SESSION_SAME_SITE,
      maxAge: env.SESSION_TTL_SECONDS,
    });

    return payload;
  }

  async getSession(request: FastifyRequest) {
    const sessionId = request.cookies[env.SESSION_COOKIE_NAME];
    if (!sessionId) {
      return null;
    }

    const redis = await getRedisClient();
    const raw = await redis.get(`${SESSION_PREFIX}${sessionId}`);
    if (!raw) {
      return null;
    }

    await redis.expire(`${SESSION_PREFIX}${sessionId}`, env.SESSION_TTL_SECONDS);
    return JSON.parse(raw) as AuthSession;
  }

  async destroySession(request: FastifyRequest, reply: FastifyReply) {
    const sessionId = request.cookies[env.SESSION_COOKIE_NAME];
    if (sessionId) {
      const redis = await getRedisClient();
      await redis.del(`${SESSION_PREFIX}${sessionId}`);
    }

    reply.clearCookie(env.SESSION_COOKIE_NAME, {
      path: "/",
      httpOnly: true,
      secure: env.SESSION_SECURE,
      sameSite: env.SESSION_SAME_SITE,
    });
  }
}
