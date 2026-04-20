import type {
  AuthCurrentUser,
  AuthLoginSuccess,
  OAuthProvider,
  UserInfo,
} from "@odin-pulse/shared";

export const AUTH_SOURCE = {
  EMAIL_CODE: 1,
  GITHUB: 2,
  GOOGLE: 3,
  WECHAT: 4,
} as const;

export const OPEN_USER_STATUS = {
  LOCKED: 0,
  NORMAL: 1,
} as const;

export const EMAIL_VERIFY_TYPE = {
  LOGIN_REGISTER: 1,
  MODIFY_PASSWORD: 2,
} as const;

export type EmailVerifyType = number;

export const EMAIL_VERIFY_STATUS = {
  NOT_USED: 0,
  USED: 1,
} as const;

export type Platform = {
  platformId: string;
  platformName: string;
  jwtSecret: string;
};

export type OauthSetting = {
  id: number;
  platformName: string;
  oauthPlatform: OAuthProvider;
  clientId: string | null;
  clientSecret: string | null;
  redirectUri: string | null;
  scope: string | null;
  extendParams: string | null;
};

export type UnionUser = {
  unionId: string;
  email: string | null;
  uniUserNickname: string;
  source: number;
  wxOpenId: string | null;
  githubId: number | null;
  githubLoginName: string | null;
  githubName: string | null;
  githubAvatarUrl: string | null;
  googleId: string | null;
  googleName: string | null;
  googleFamilyName: string | null;
  googleGivenName: string | null;
  googleEmail: string | null;
  googleEmailVerified: boolean | null;
  googleAvatarUrl: string | null;
  deleted: number;
  createTime: string;
  updateTime: string;
};

export type OpenUser = {
  openId: string;
  unionId: string;
  platformId: string;
  openUserNickname: string;
  openUsername: string;
  openUserPassword: string;
  avatar: string | null;
  source: number;
  openUserStatus: number;
  deleted: number;
  createTime: string;
  updateTime: string;
};

export type EmailVerify = {
  id: number;
  email: string | null;
  platformId: string;
  code: string;
  type: number;
  expireTime: string | null;
  status: number;
  deleted: number;
  createTime: string;
  updateTime: string;
};

export type SessionPayload = AuthCurrentUser & {
  platformName: string;
  email: string | null;
  isAdmin: boolean;
};

export type AuthSession = SessionPayload & {
  sessionId: string;
};

export type EmailCodeLoginInput = {
  email: string;
  verifyCode: string;
};

export type PasswordLoginInput = {
  email: string;
  password: string;
};

export type ChangePasswordInput = {
  userId: string;
  oldPassword: string;
  newPassword: string;
};

export type UpdateUserInfoInput = {
  nickname?: string;
  avatar?: string;
};

export type OAuthCallbackInput = {
  code: string;
  inviteCode?: string;
};

export type CurrentUserResponse = AuthCurrentUser;
export type LoginSuccessResponse = AuthLoginSuccess;
export type UserInfoResponse = UserInfo;

export type DbPlatform = Platform;
export type DbOauthSetting = OauthSetting;
export type DbUnionUser = UnionUser;
export type DbOpenUser = OpenUser;
export type DbEmailVerify = EmailVerify;
