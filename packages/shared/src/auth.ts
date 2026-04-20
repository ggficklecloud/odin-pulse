export type AuthCurrentUser = {
  userId: string;
  unionId: string | null;
};

export type AuthLoginSuccess = {
  userId: string;
  unionId: string | null;
};

export type UserInfo = {
  openId: string;
  unionId: string;
  platformId: string;
  openUserNickname: string;
  openUsername: string;
  email: string | null;
  uniUserNickname: string;
  avatar: string | null;
  isAdmin: boolean;
};

export type OAuthProvider = "github" | "google";

export type OAuthSettingPreview = {
  platformName: string;
  oauthPlatform: OAuthProvider;
  redirectUri: string;
  scope: string | null;
};
