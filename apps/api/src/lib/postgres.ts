import { Pool } from "pg";

import { env } from "../config/env.js";

let pool: Pool | null = null;

export function getPostgresPool() {
  if (!pool) {
    pool = new Pool({
      host: env.POSTGRES_HOST,
      port: env.POSTGRES_PORT,
      user: env.POSTGRES_USER,
      password: env.POSTGRES_PASSWORD,
      database: env.POSTGRES_DATABASE,
      max: env.POSTGRES_POOL_MAX,
      ssl: env.POSTGRES_SSL ? { rejectUnauthorized: false } : false,
    });
  }

  return pool;
}

export async function postgresHealthcheck() {
  const client = await getPostgresPool().connect();
  try {
    await client.query("select current_database(), current_schema()");
  } finally {
    client.release();
  }
}
