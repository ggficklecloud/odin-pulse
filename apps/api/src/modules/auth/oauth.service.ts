import type { OAuthProvider } from "@odin-pulse/shared";

import { AuthRepository } from "./auth.repository.js";

type GithubTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type GithubUserResponse = {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string | null;
};

type GoogleTokenResponse = {
  access_token: string;
};

type GoogleUserResponse = {
  sub: string;
  name: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  email_verified?: boolean;
  picture?: string;
};

export class OAuthService {
  private readonly repository = new AuthRepository();

  async getAuthUrl(provider: OAuthProvider, platformName: string) {
    const setting = await this.repository.findOauthSetting(platformName, provider);
    if (!setting || !setting.clientId) {
      return null;
    }

    if (provider === "github") {
      return `https://github.com/login/oauth/authorize?scope=${encodeURIComponent(setting.scope ?? "user:email")}&client_id=${encodeURIComponent(setting.clientId)}`;
    }

    if (!setting.redirectUri) {
      return null;
    }

    let url =
      `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(setting.clientId)}` +
      `&redirect_uri=${encodeURIComponent(setting.redirectUri)}` +
      `&response_type=code&scope=${encodeURIComponent(setting.scope ?? "openid profile email")}`;

    if (setting.extendParams) {
      url += `&${setting.extendParams}`;
    }

    return url;
  }

  async exchangeCodeForProfile(provider: OAuthProvider, platformName: string, code: string) {
    const setting = await this.repository.findOauthSetting(platformName, provider);
    if (!setting || !setting.clientId || !setting.clientSecret) {
      throw new Error(`${provider} oauth is not configured`);
    }

    if (provider === "github") {
      const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: setting.clientId,
          client_secret: setting.clientSecret,
          code,
        }),
      });
      const tokenBody = (await tokenRes.json()) as GithubTokenResponse;
      if (!tokenRes.ok || !tokenBody.access_token) {
        throw new Error(tokenBody.error_description || "github auth request failed");
      }

      const userRes = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${tokenBody.access_token}`,
          Accept: "application/json",
        },
      });
      const profile = (await userRes.json()) as GithubUserResponse;
      if (!userRes.ok || !profile.id) {
        throw new Error("github user fetch failed");
      }

      return {
        provider,
        githubId: profile.id,
        loginName: profile.login,
        name: profile.name ?? profile.login,
        avatarUrl: profile.avatar_url,
      };
    }

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: setting.clientId,
        client_secret: setting.clientSecret,
        grant_type: "authorization_code",
        redirect_uri: setting.redirectUri,
        code,
      }),
    });

    const tokenBody = (await tokenRes.json()) as GoogleTokenResponse;
    if (!tokenRes.ok || !tokenBody.access_token) {
      throw new Error("google auth request failed");
    }

    const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenBody.access_token}`,
        Accept: "application/json",
      },
    });
    const profile = (await userRes.json()) as GoogleUserResponse;
    if (!userRes.ok || !profile.sub) {
      throw new Error("google user fetch failed");
    }

    return {
      provider,
      googleId: profile.sub,
      name: profile.name,
      familyName: profile.family_name ?? null,
      givenName: profile.given_name ?? null,
      email: profile.email ?? null,
      emailVerified: profile.email_verified ?? null,
      avatarUrl: profile.picture ?? null,
    };
  }
}
