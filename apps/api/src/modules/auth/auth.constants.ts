export const AUTH_SOURCE = {
  EMAIL_CODE: 1,
  GITHUB: 2,
  GOOGLE: 3,
} as const;

export const OPEN_USER_STATUS = {
  LOCKED: 0,
  NORMAL: 1,
} as const;

export const EMAIL_VERIFY_STATUS = {
  UNUSED: 0,
  USED: 1,
} as const;

export const EMAIL_VERIFY_TYPE = {
  LOGIN_REGISTER: 1,
  MODIFY_PASSWORD: 2,
} as const;

export const DEFAULT_PLATFORM_NAME = "odin";
