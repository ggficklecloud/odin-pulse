import type { PoolClient, QueryResultRow } from "pg";

import { env } from "../../config/env.js";
import { getPostgresPool } from "../../lib/postgres.js";
import { snowflake } from "../../lib/snowflake.js";
import type {
  DbEmailVerify,
  DbOauthSetting,
  DbOpenUser,
  DbPlatform,
  DbUnionUser,
  EmailVerifyType,
  UpdateUserInfoInput,
} from "./auth.types.js";

function tableName(name: string) {
  return env.POSTGRES_SCHEMA === "public" ? name : `${env.POSTGRES_SCHEMA}.${name}`;
}

function mapPlatform(row: QueryResultRow): DbPlatform {
  return {
    platformId: String(row.platform_id),
    platformName: String(row.platform_name),
    jwtSecret: String(row.jwt_secret ?? ""),
  };
}

function mapUnionUser(row: QueryResultRow): DbUnionUser {
  return {
    unionId: String(row.union_id),
    email: row.email ? String(row.email) : null,
    uniUserNickname: String(row.uni_user_nickname ?? ""),
    source: Number(row.source ?? 1),
    wxOpenId: row.wx_open_id ? String(row.wx_open_id) : null,
    githubId: row.github_id === null ? null : Number(row.github_id),
    githubLoginName: row.github_login_name ? String(row.github_login_name) : null,
    githubName: row.github_name ? String(row.github_name) : null,
    githubAvatarUrl: row.github_avatar_url ? String(row.github_avatar_url) : null,
    googleId: row.google_id ? String(row.google_id) : null,
    googleName: row.google_name ? String(row.google_name) : null,
    googleFamilyName: row.google_family_name ? String(row.google_family_name) : null,
    googleGivenName: row.google_given_name ? String(row.google_given_name) : null,
    googleEmail: row.google_email ? String(row.google_email) : null,
    googleEmailVerified:
      row.google_email_verified === null ? null : Boolean(row.google_email_verified),
    googleAvatarUrl: row.google_avatar_url ? String(row.google_avatar_url) : null,
    deleted: Number(row.deleted ?? 0),
    createTime: new Date(row.create_time).toISOString(),
    updateTime: new Date(row.update_time).toISOString(),
  };
}

function mapOpenUser(row: QueryResultRow): DbOpenUser {
  return {
    openId: String(row.open_id),
    unionId: String(row.union_id),
    platformId: String(row.platform_id),
    openUserNickname: String(row.open_user_nickname ?? ""),
    openUsername: String(row.open_username ?? ""),
    openUserPassword: String(row.open_user_password ?? ""),
    avatar: row.avatar ? String(row.avatar) : null,
    source: Number(row.source ?? 1),
    openUserStatus: Number(row.open_user_status ?? 1),
    deleted: Number(row.deleted ?? 0),
    createTime: new Date(row.create_time).toISOString(),
    updateTime: new Date(row.update_time).toISOString(),
  };
}

function mapOauthSetting(row: QueryResultRow): DbOauthSetting {
  return {
    id: Number(row.id),
    platformName: String(row.platform_name),
    oauthPlatform: String(row.oauth_platform) as DbOauthSetting["oauthPlatform"],
    clientId: String(row.client_id ?? ""),
    clientSecret: String(row.client_secret ?? ""),
    redirectUri: String(row.redirect_uri ?? ""),
    scope: row.scope ? String(row.scope) : null,
    extendParams: row.extend_params ? String(row.extend_params) : null,
  };
}

function mapEmailVerify(row: QueryResultRow): DbEmailVerify {
  return {
    id: Number(row.id),
    email: String(row.email),
    platformId: String(row.platform_id),
    code: String(row.code),
    type: Number(row.type),
    expireTime: new Date(row.expire_time).toISOString(),
    status: Number(row.status),
    deleted: Number(row.deleted ?? 0),
    createTime: new Date(row.create_time).toISOString(),
    updateTime: new Date(row.update_time).toISOString(),
  };
}

export type UserInfoRecord = {
  openId: string;
  unionId: string;
  platformId: string;
  openUserNickname: string;
  openUsername: string;
  avatar: string | null;
  email: string | null;
  uniUserNickname: string;
};

export class AuthRepository {
  async healthcheck() {
    await getPostgresPool().query("select 1");
  }

  async findPlatformByName(platformName: string) {
    const result = await getPostgresPool().query(
      `select * from ${tableName("odin_platform")} where platform_name = $1 and deleted = 0 limit 1`,
      [platformName],
    );
    return result.rows[0] ? mapPlatform(result.rows[0]) : null;
  }

  async findOauthSetting(platformName: string, oauthPlatform: string) {
    const result = await getPostgresPool().query(
      `select * from ${tableName("platform_oauth_setting")} where platform_name = $1 and oauth_platform = $2 and deleted = 0 limit 1`,
      [platformName, oauthPlatform],
    );
    return result.rows[0] ? mapOauthSetting(result.rows[0]) : null;
  }

  async findUnionUserById(unionId: string) {
    const result = await getPostgresPool().query(
      `select * from ${tableName("odin_union_user")} where union_id = $1 and deleted = 0 limit 1`,
      [unionId],
    );
    return result.rows[0] ? mapUnionUser(result.rows[0]) : null;
  }

  async findUnionUserByEmail(email: string) {
    const result = await getPostgresPool().query(
      `select * from ${tableName("odin_union_user")} where email = $1 and deleted = 0 limit 1`,
      [email],
    );
    return result.rows[0] ? mapUnionUser(result.rows[0]) : null;
  }

  async findUnionUserByGithubId(githubId: number) {
    const result = await getPostgresPool().query(
      `select * from ${tableName("odin_union_user")} where github_id = $1 and deleted = 0 limit 1`,
      [githubId],
    );
    return result.rows[0] ? mapUnionUser(result.rows[0]) : null;
  }

  async findUnionUserByGoogleId(googleId: string) {
    const result = await getPostgresPool().query(
      `select * from ${tableName("odin_union_user")} where google_id = $1 and deleted = 0 limit 1`,
      [googleId],
    );
    return result.rows[0] ? mapUnionUser(result.rows[0]) : null;
  }

  async findOpenUserById(openId: string) {
    const result = await getPostgresPool().query(
      `select * from ${tableName("odin_open_user")} where open_id = $1 and deleted = 0 limit 1`,
      [openId],
    );
    return result.rows[0] ? mapOpenUser(result.rows[0]) : null;
  }

  async findOpenUserByUnionIdAndPlatformId(unionId: string, platformId: string) {
    const result = await getPostgresPool().query(
      `select * from ${tableName("odin_open_user")} where union_id = $1 and platform_id = $2 and deleted = 0 limit 1`,
      [unionId, platformId],
    );
    return result.rows[0] ? mapOpenUser(result.rows[0]) : null;
  }

  async createUnionUser(
    input: {
      email: string | null;
      uniUserNickname: string;
      source: number;
      githubId?: number | null;
      githubLoginName?: string | null;
      githubName?: string | null;
      githubAvatarUrl?: string | null;
      googleId?: string | null;
      googleName?: string | null;
      googleFamilyName?: string | null;
      googleGivenName?: string | null;
      googleEmail?: string | null;
      googleEmailVerified?: boolean | null;
      googleAvatarUrl?: string | null;
    },
    client?: PoolClient,
  ) {
    const unionId = snowflake.nextId();
    const runner = client ?? getPostgresPool();
    const result = await runner.query(
      `insert into ${tableName("odin_union_user")} (
        union_id, email, uni_user_nickname, source, wx_open_id,
        github_id, github_login_name, github_name, github_avatar_url,
        google_id, google_name, google_family_name, google_given_name, google_email, google_email_verified, google_avatar_url,
        deleted
      ) values (
        $1, $2, $3, $4, '',
        $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14, $15,
        0
      ) returning *`,
      [
        unionId,
        input.email,
        input.uniUserNickname,
        input.source,
        input.githubId ?? null,
        input.githubLoginName ?? null,
        input.githubName ?? null,
        input.githubAvatarUrl ?? null,
        input.googleId ?? null,
        input.googleName ?? null,
        input.googleFamilyName ?? null,
        input.googleGivenName ?? null,
        input.googleEmail ?? null,
        input.googleEmailVerified ?? null,
        input.googleAvatarUrl ?? null,
      ],
    );
    return mapUnionUser(result.rows[0]);
  }

  async createOpenUser(
    input: {
      unionId: string;
      platformId: string;
      openUserNickname: string;
      openUsername: string;
      openUserPassword: string;
      avatar?: string | null;
      source: number;
      openUserStatus: number;
    },
    client?: PoolClient,
  ) {
    const openId = snowflake.nextId();
    const runner = client ?? getPostgresPool();
    const result = await runner.query(
      `insert into ${tableName("odin_open_user")} (
        open_id, union_id, platform_id, open_user_nickname, open_username, open_user_password,
        avatar, source, open_user_status, deleted
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,0)
      returning *`,
      [
        openId,
        input.unionId,
        input.platformId,
        input.openUserNickname,
        input.openUsername,
        input.openUserPassword,
        input.avatar ?? null,
        input.source,
        input.openUserStatus,
      ],
    );
    return mapOpenUser(result.rows[0]);
  }

  async updateOpenUserPassword(openId: string, passwordHash: string) {
    const result = await getPostgresPool().query(
      `update ${tableName("odin_open_user")}
       set open_user_password = $2, update_time = now()
       where open_id = $1
       returning *`,
      [openId, passwordHash],
    );
    return result.rows[0] ? mapOpenUser(result.rows[0]) : null;
  }

  async updateOpenUserProfile(openId: string, input: UpdateUserInfoInput) {
    const result = await getPostgresPool().query(
      `update ${tableName("odin_open_user")}
       set open_user_nickname = coalesce($2, open_user_nickname),
           avatar = coalesce($3, avatar),
           update_time = now()
       where open_id = $1
       returning *`,
      [openId, input.nickname ?? null, input.avatar ?? null],
    );
    return result.rows[0] ? mapOpenUser(result.rows[0]) : null;
  }

  async createEmailVerify(input: {
    email: string;
    platformId: string;
    code: string;
    type: EmailVerifyType;
    expireTime: Date;
  }) {
    const result = await getPostgresPool().query(
      `insert into ${tableName("odin_email_verify")} (email, platform_id, code, type, expire_time, status, deleted)
       values ($1, $2, $3, $4, $5, 0, 0)
       returning *`,
      [input.email, input.platformId, input.code, input.type, input.expireTime],
    );
    return mapEmailVerify(result.rows[0]);
  }

  async findLatestEmailVerify(platformId: string, email: string, type: EmailVerifyType) {
    const result = await getPostgresPool().query(
      `select * from ${tableName("odin_email_verify")}
       where platform_id = $1 and email = $2 and status = 0 and type = $3 and deleted = 0
       order by id desc limit 1`,
      [platformId, email, type],
    );
    return result.rows[0] ? mapEmailVerify(result.rows[0]) : null;
  }

  async markEmailVerifyUsed(id: number) {
    await getPostgresPool().query(
      `update ${tableName("odin_email_verify")}
       set status = 1, update_time = now()
       where id = $1`,
      [id],
    );
  }

  async getUserInfo(openId: string): Promise<UserInfoRecord | null> {
    const result = await getPostgresPool().query(
      `select
         ou.open_id,
         ou.union_id,
         ou.platform_id,
         ou.open_user_nickname,
         ou.open_username,
         ou.avatar,
         uu.email,
         uu.uni_user_nickname
       from ${tableName("odin_open_user")} ou
       join ${tableName("odin_union_user")} uu on uu.union_id = ou.union_id
       where ou.open_id = $1 and ou.deleted = 0 and uu.deleted = 0
       limit 1`,
      [openId],
    );

    return result.rows[0]
      ? {
          openId: String(result.rows[0].open_id),
          unionId: String(result.rows[0].union_id),
          platformId: String(result.rows[0].platform_id),
          openUserNickname: String(result.rows[0].open_user_nickname ?? ""),
          openUsername: String(result.rows[0].open_username ?? ""),
          avatar: result.rows[0].avatar ? String(result.rows[0].avatar) : null,
          email: result.rows[0].email ? String(result.rows[0].email) : null,
          uniUserNickname: String(result.rows[0].uni_user_nickname ?? ""),
        }
      : null;
  }
}
