import { randomInt } from "node:crypto";

import type {
  AuthCurrentUser,
  AuthLoginSuccess,
  OAuthProvider,
  UserInfo,
} from "@odin-pulse/shared";

import { env } from "../../config/env.js";
import { getPostgresPool } from "../../lib/postgres.js";
import { AuthRepository } from "./auth.repository.js";
import { MailService } from "./mail.service.js";
import { OAuthService } from "./oauth.service.js";
import { hashPassword, verifyPassword } from "./password.js";
import type {
  SessionPayload,
  ChangePasswordInput,
  EmailCodeLoginInput,
  OAuthCallbackInput,
  PasswordLoginInput,
  Platform,
  AuthSession,
  UpdateUserInfoInput,
} from "./auth.types.js";
import {
  AUTH_SOURCE,
  EMAIL_VERIFY_TYPE,
  OPEN_USER_STATUS,
} from "./auth.types.js";

export class AuthService {
  private readonly repository = new AuthRepository();
  private readonly mailService = new MailService();
  private readonly oauthService = new OAuthService();

  async healthcheck() {
    await this.repository.healthcheck();
  }

  async sendEmailVerifyCode(email: string, type: "login" | "password") {
    const platform = await this.requirePlatform();
    const code = String(randomInt(100000, 999999));

    await this.mailService.sendVerificationCode(
      email,
      code,
      type,
    );

    await this.repository.createEmailVerify({
      email,
      platformId: platform.platformId,
      code,
      type: type === "password" ? EMAIL_VERIFY_TYPE.MODIFY_PASSWORD : EMAIL_VERIFY_TYPE.LOGIN_REGISTER,
      expireTime: new Date(Date.now() + 10 * 60_000),
    });

    return true;
  }

  async loginByEmailCode(input: EmailCodeLoginInput): Promise<AuthLoginSuccess> {
    const platform = await this.requirePlatform();
    const verify = await this.repository.findLatestEmailVerify(
      platform.platformId,
      input.email,
      EMAIL_VERIFY_TYPE.LOGIN_REGISTER,
    );

    if (!verify || verify.code !== input.verifyCode) {
      throw new Error("验证码不正确");
    }
    if (!verify.expireTime || new Date(verify.expireTime).getTime() < Date.now()) {
      throw new Error("验证码已过期");
    }

    await this.repository.markEmailVerifyUsed(verify.id);
    const openUser = await this.findOrCreateEmailUser(platform, input.email);
    return {
      userId: openUser.openId,
      unionId: openUser.unionId,
    };
  }

  async loginByPassword(input: PasswordLoginInput): Promise<AuthLoginSuccess> {
    const platform = await this.requirePlatform();
    const unionUser = await this.repository.findUnionUserByEmail(input.email);
    if (!unionUser) {
      throw new Error("user does not exist");
    }

    const openUser = await this.repository.findOpenUserByUnionIdAndPlatformId(
      unionUser.unionId,
      platform.platformId,
    );
    if (!openUser) {
      throw new Error("user does not exist");
    }
    if (openUser.openUserStatus !== OPEN_USER_STATUS.NORMAL) {
      throw new Error("The user is locked and temporarily unable to log in");
    }
    if (!(await verifyPassword(input.password, openUser.openUserPassword))) {
      throw new Error("password error");
    }

    return {
      userId: openUser.openId,
      unionId: openUser.unionId,
    };
  }

  async changePassword(input: ChangePasswordInput) {
    const openUser = await this.repository.findOpenUserById(input.userId);
    if (!openUser) {
      throw new Error("user does not exist");
    }

    if (!(await verifyPassword(input.oldPassword, openUser.openUserPassword))) {
      throw new Error("The old password is incorrect");
    }
    if (await verifyPassword(input.newPassword, openUser.openUserPassword)) {
      throw new Error("The new password cannot be the same as the old password");
    }

    await this.repository.updateOpenUserPassword(
      input.userId,
      await hashPassword(input.newPassword),
    );
    return true;
  }

  async getOAuthUrl(provider: OAuthProvider) {
    return this.oauthService.getAuthUrl(provider, env.AUTH_PLATFORM_NAME || "odin");
  }

  async loginByOAuth(provider: OAuthProvider, input: OAuthCallbackInput): Promise<AuthLoginSuccess> {
    const platform = await this.requirePlatform();
    const profile = await this.oauthService.exchangeCodeForProfile(
      provider,
      env.AUTH_PLATFORM_NAME || "odin",
      input.code,
    );
    const openUser = await this.findOrCreateOauthUser(platform, provider, profile);

    return {
      userId: openUser.openId,
      unionId: openUser.unionId,
    };
  }

  async getCurrentUser(session: AuthSession | null): Promise<AuthCurrentUser | null> {
    if (!session) {
      return null;
    }
    return {
      userId: session.userId,
      unionId: session.unionId,
    };
  }

  async getUserInfo(userIdOrSession: string | SessionPayload): Promise<UserInfo> {
    const userId = typeof userIdOrSession === "string" ? userIdOrSession : userIdOrSession.userId;
    const record = await this.repository.getUserInfo(userId);
    if (!record) {
      throw new Error("user does not exist");
    }

    return {
      ...record,
      isAdmin: this.isAdmin(record.email),
    };
  }

  async updateUserInfo(userIdOrSession: string | SessionPayload, input: UpdateUserInfoInput) {
    const userId = typeof userIdOrSession === "string" ? userIdOrSession : userIdOrSession.userId;
    await this.repository.updateOpenUserProfile(userId, input);
    return true;
  }

  async buildSessionPayload(userId: string): Promise<Omit<AuthSession, "sessionId">> {
    const userInfo = await this.getUserInfo(userId);
    return {
      userId: userInfo.openId,
      unionId: userInfo.unionId,
      platformName: env.AUTH_PLATFORM_NAME,
      email: userInfo.email,
      isAdmin: userInfo.isAdmin,
    };
  }

  private async requirePlatform(): Promise<Platform> {
    const platform = await this.repository.findPlatformByName(env.AUTH_PLATFORM_NAME);
    if (!platform) {
      throw new Error(`platform ${env.AUTH_PLATFORM_NAME} not found`);
    }
    return platform;
  }

  private async findOrCreateEmailUser(platform: Platform, email: string) {
    const client = await getPostgresPool().connect();
    try {
      await client.query("begin");

      let unionUser = await this.repository.findUnionUserByEmail(email);
      if (!unionUser) {
        unionUser = await this.repository.createUnionUser(
          {
            email,
            uniUserNickname: `小西瓜${randomInt(1000, 9999)}号`,
            source: AUTH_SOURCE.EMAIL_CODE,
          },
          client,
        );
      }

      let openUser = await this.repository.findOpenUserByUnionIdAndPlatformId(
        unionUser.unionId,
        platform.platformId,
      );
      if (!openUser) {
        openUser = await this.repository.createOpenUser(
          {
            unionId: unionUser.unionId,
            platformId: platform.platformId,
            openUserNickname: unionUser.uniUserNickname,
            openUsername: email,
            openUserPassword: await hashPassword(env.AUTH_DEFAULT_PASSWORD),
            source: AUTH_SOURCE.EMAIL_CODE,
            openUserStatus: OPEN_USER_STATUS.NORMAL,
          },
          client,
        );
      }

      await client.query("commit");
      return openUser;
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  private async findOrCreateOauthUser(
    platform: Platform,
    provider: OAuthProvider,
    profile: Record<string, unknown>,
  ) {
    const client = await getPostgresPool().connect();
    try {
      await client.query("begin");

      let unionUser = null;
      if (provider === "github") {
        const githubId = typeof profile.githubId === "number" ? profile.githubId : null;
        if (!githubId) {
          throw new Error("github user not exist");
        }
        unionUser = await this.repository.findUnionUserByGithubId(githubId);
        if (!unionUser) {
          unionUser = await this.repository.createUnionUser(
            {
              email: null,
              uniUserNickname: String(profile.name ?? profile.loginName ?? ""),
              source: AUTH_SOURCE.GITHUB,
              githubId,
              githubLoginName: String(profile.loginName ?? ""),
              githubName: String(profile.name ?? ""),
              githubAvatarUrl: String(profile.avatarUrl ?? ""),
            },
            client,
          );
        }
      } else {
        const googleId = typeof profile.googleId === "string" ? profile.googleId : null;
        if (!googleId) {
          throw new Error("google user not exist");
        }
        unionUser = await this.repository.findUnionUserByGoogleId(googleId);
        if (!unionUser) {
          unionUser = await this.repository.createUnionUser(
            {
              email: profile.email ? String(profile.email) : null,
              uniUserNickname: String(profile.name ?? ""),
              source: AUTH_SOURCE.GOOGLE,
              googleId,
              googleName: String(profile.name ?? ""),
              googleFamilyName: String(profile.familyName ?? ""),
              googleGivenName: String(profile.givenName ?? ""),
              googleEmail: String(profile.email ?? ""),
              googleEmailVerified: profile.emailVerified == null ? null : Boolean(profile.emailVerified),
              googleAvatarUrl: String(profile.avatarUrl ?? ""),
            },
            client,
          );
        }
      }

      if (!unionUser) {
        throw new Error("oauth user create failed");
      }

      let openUser = await this.repository.findOpenUserByUnionIdAndPlatformId(
        unionUser.unionId,
        platform.platformId,
      );
      if (!openUser) {
        openUser = await this.repository.createOpenUser(
          {
            unionId: unionUser.unionId,
            platformId: platform.platformId,
            openUserNickname: unionUser.uniUserNickname,
            openUsername:
              provider === "github"
                ? unionUser.githubLoginName || unionUser.uniUserNickname
                : unionUser.googleName || unionUser.uniUserNickname,
            openUserPassword: await hashPassword(env.AUTH_DEFAULT_PASSWORD),
            avatar:
              provider === "github" ? unionUser.githubAvatarUrl : unionUser.googleAvatarUrl,
            source: provider === "github" ? AUTH_SOURCE.GITHUB : AUTH_SOURCE.GOOGLE,
            openUserStatus: OPEN_USER_STATUS.NORMAL,
          },
          client,
        );
      }

      await client.query("commit");
      return openUser;
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  private isAdmin(email: string | null) {
    if (!email) {
      return false;
    }
    const admins = env.AUTH_ADMIN_EMAILS.split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);
    return admins.includes(email.toLowerCase());
  }
}
