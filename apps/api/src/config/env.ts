import "dotenv/config";

import { z } from "zod";

const booleanFromEnv = z.preprocess((value) => {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value !== "string") {
    return undefined;
  }
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}, z.boolean());

const envSchema = z.object({
  API_HOST: z.string().default("0.0.0.0"),
  API_PORT: z.coerce.number().default(3001),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  POSTGRES_HOST: z.string().default("127.0.0.1"),
  POSTGRES_PORT: z.coerce.number().default(5432),
  POSTGRES_USER: z.string().default("odin"),
  POSTGRES_PASSWORD: z.string().default(""),
  POSTGRES_DATABASE: z.string().default("quant_db"),
  POSTGRES_SCHEMA: z.string().default("public"),
  POSTGRES_SSL: booleanFromEnv.default(false),
  POSTGRES_POOL_MAX: z.coerce.number().default(10),
  ES_NODE: z.string().default("http://127.0.0.1:9200"),
  ES_USERNAME: z.string().default("elastic"),
  ES_PASSWORD: z.string().default(""),
  ES_INDEX: z.string().default("finance_news"),
  FETCH_INTERVAL_MS: z.coerce.number().default(120_000),
  REFRESH_GUARD_MS: z.coerce.number().default(60_000),
  SCHEDULE_ENABLED: booleanFromEnv.default(true),
});

export const env = envSchema.parse(process.env);
