import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { AuthService } from "./auth.service.js";
import { AuthSessionService } from "./session.service.js";

const emailVerifySendSchema = z.object({
  email: z.string().email(),
  type: z.preprocess((value) => {
    if (value === 1 || value === "1") {
      return "login";
    }
    if (value === 2 || value === "2") {
      return "password";
    }
    return value;
  }, z.enum(["login", "password"])).default("login"),
});

const emailCodeLoginSchema = z.object({
  email: z.string().email(),
  verifyCode: z.string().min(4).max(10),
});

const emailPasswordLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const passwordChangeSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

const oauthCallbackSchema = z.object({
  code: z.string().min(1),
});

const updateUserInfoSchema = z.object({
  nickname: z.string().min(1).max(50).optional(),
  avatar: z.string().url().optional(),
});

export async function registerAuthRoutes(app: FastifyInstance) {
  const authService = new AuthService();
  const sessionService = new AuthSessionService();
  const requireSession = async (request: FastifyRequest) => {
    const session = await sessionService.getSession(request);
    if (!session) {
      throw app.httpErrors.unauthorized("认证失败，请重新登录");
    }
    return session;
  };

  app.setErrorHandler((error, request, reply) => {
    const isAuthRoute =
      request.url.startsWith("/api/v1/auth") ||
      request.url.startsWith("/auth") ||
      request.url.startsWith("/api/v1/user") ||
      request.url.startsWith("/user");

    if (!isAuthRoute) {
      reply.send(error);
      return;
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "statusCode" in error &&
      typeof error.statusCode === "number"
    ) {
      const typedError = error as { statusCode: number; message?: string };
      reply.status(typedError.statusCode).send({
        message: typedError.message ?? "auth request failed",
      });
      return;
    }

    const message =
      error instanceof Error ? error.message : "auth request failed";
    const statusCode =
      message.includes("unauthorized") || message.includes("认证失败")
        ? 401
        : message.includes("SMTP")
          ? 503
          : 400;

    reply.status(statusCode).send({
      message,
    });
  });

  app.get("/api/v1/auth/health", async () => ({ ok: true }));

  app.post("/api/v1/auth/email-verify/send", async (request) => {
    const body = emailVerifySendSchema.parse(request.body);
    return {
      success: await authService.sendEmailVerifyCode(body.email, body.type),
    };
  });

  app.post("/api/v1/auth/email-verify/login", async (request, reply) => {
    const body = emailCodeLoginSchema.parse(request.body);
    const result = await authService.loginByEmailCode(body);
    const session = await authService.buildSessionPayload(result.userId);
    await sessionService.createSession(reply, session);
    return result;
  });

  app.post("/api/v1/auth/email-verify/login-by-password", async (request, reply) => {
    const body = emailPasswordLoginSchema.parse(request.body);
    const result = await authService.loginByPassword(body);
    const session = await authService.buildSessionPayload(result.userId);
    await sessionService.createSession(reply, session);
    return result;
  });

  app.post("/api/v1/auth/change-password", async (request, reply) => {
    const session = await requireSession(request);
    const body = passwordChangeSchema.parse(request.body);
    return {
      success: await authService.changePassword({
        userId: session.userId,
        oldPassword: body.oldPassword,
        newPassword: body.newPassword,
      }),
    };
  });

  app.get("/api/v1/auth/github-oauth-url", async () => ({
    url: await authService.getOAuthUrl("github"),
  }));

  app.get("/api/v1/auth/google-oauth-url", async () => ({
    url: await authService.getOAuthUrl("google"),
  }));

  app.post("/api/v1/auth/github-callback", async (request, reply) => {
    const body = oauthCallbackSchema.parse(request.body);
    const result = await authService.loginByOAuth("github", body);
    const session = await authService.buildSessionPayload(result.userId);
    await sessionService.createSession(reply, session);
    return result;
  });

  app.post("/api/v1/auth/google-callback", async (request, reply) => {
    const body = oauthCallbackSchema.parse(request.body);
    const result = await authService.loginByOAuth("google", body);
    const session = await authService.buildSessionPayload(result.userId);
    await sessionService.createSession(reply, session);
    return result;
  });

  app.get("/api/v1/auth/me", async (request) => {
    const session = await requireSession(request);
    return authService.getCurrentUser(session);
  });

  app.post("/api/v1/auth/logout", async (request, reply) => {
    await sessionService.destroySession(request, reply);
    return { success: true };
  });

  app.get("/api/v1/user/get-user-info", async (request) => {
    const session = await requireSession(request);
    return authService.getUserInfo(session);
  });

  app.post("/api/v1/user/update-user-info", async (request) => {
    const session = await requireSession(request);
    const body = updateUserInfoSchema.parse(request.body);
    return {
      success: await authService.updateUserInfo(session, body),
    };
  });

  app.post("/auth/email-verify/send", async (request) => {
    const body = emailVerifySendSchema.parse(request.body);
    return { success: await authService.sendEmailVerifyCode(body.email, body.type) };
  });
  app.post("/auth/email-verify/login", async (request, reply) => {
    const body = emailCodeLoginSchema.parse(request.body);
    const result = await authService.loginByEmailCode(body);
    const session = await authService.buildSessionPayload(result.userId);
    await sessionService.createSession(reply, session);
    return result;
  });
  app.post("/auth/email-verify/login-by-password", async (request, reply) => {
    const body = emailPasswordLoginSchema.parse(request.body);
    const result = await authService.loginByPassword(body);
    const session = await authService.buildSessionPayload(result.userId);
    await sessionService.createSession(reply, session);
    return result;
  });
  app.post("/auth/github-callback", async (request, reply) => {
    const body = oauthCallbackSchema.parse(request.body);
    const result = await authService.loginByOAuth("github", body);
    const session = await authService.buildSessionPayload(result.userId);
    await sessionService.createSession(reply, session);
    return result;
  });
  app.post("/auth/google-callback", async (request, reply) => {
    const body = oauthCallbackSchema.parse(request.body);
    const result = await authService.loginByOAuth("google", body);
    const session = await authService.buildSessionPayload(result.userId);
    await sessionService.createSession(reply, session);
    return result;
  });
  app.get("/auth/github-oauth-url", async () => ({ url: await authService.getOAuthUrl("github") }));
  app.get("/auth/google-oauth-url", async () => ({ url: await authService.getOAuthUrl("google") }));
  app.get("/auth/me", async (request) => authService.getCurrentUser(await requireSession(request)));
  app.post("/auth/logout", async (request, reply) => {
    await sessionService.destroySession(request, reply);
    return { success: true };
  });
  app.get("/user/get-user-info", async (request) => {
    const session = await requireSession(request);
    return authService.getUserInfo(session);
  });
  app.post("/user/update-user-info", async (request) => {
    const session = await requireSession(request);
    const body = updateUserInfoSchema.parse(request.body);
    return { success: await authService.updateUserInfo(session, body) };
  });
}
