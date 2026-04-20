import { snowflake } from "../../lib/snowflake.js";
import type { DraftNewsRecord, PersistedNewsRecord } from "./news.types.js";

const DEFAULT_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export const browserHeaders = {
  "User-Agent": DEFAULT_UA,
  Accept: "application/json, text/plain, */*",
};

export function cleanText(value: string | null | undefined): string {
  return (value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseRelativeTime(raw: string | null | undefined): Date {
  if (!raw) {
    return new Date();
  }

  const value = raw.trim();
  const now = new Date();

  const minuteMatch = value.match(/^(\d+)\s*分钟前$/);
  if (minuteMatch) {
    return new Date(now.getTime() - Number.parseInt(minuteMatch[1], 10) * 60_000);
  }

  const hourMatch = value.match(/^(\d+)\s*小时前$/);
  if (hourMatch) {
    return new Date(now.getTime() - Number.parseInt(hourMatch[1], 10) * 3_600_000);
  }

  const todayMatch = value.match(/^今天\s*(\d{1,2}:\d{2})$/);
  if (todayMatch) {
    const [hours, minutes] = todayMatch[1].split(":").map(Number);
    const date = new Date(now);
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  const yesterdayMatch = value.match(/^昨天\s*(\d{1,2}:\d{2})$/);
  if (yesterdayMatch) {
    const [hours, minutes] = yesterdayMatch[1].split(":").map(Number);
    const date = new Date(now);
    date.setDate(date.getDate() - 1);
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    const date = new Date(value.replace(" ", "T"));
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  if (/^\d{1,2}-\d{1,2}$/.test(value)) {
    const [month, day] = value.split("-").map(Number);
    return new Date(now.getFullYear(), month - 1, day, 0, 0, 0, 0);
  }

  return new Date();
}

export function toIso(value: Date | string | number | null | undefined): string {
  if (!value) {
    return new Date(0).toISOString();
  }
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? new Date(0).toISOString() : date.toISOString();
}

export function normalizeEsRecord(
  source: Record<string, unknown>,
  highlight?: Record<string, string[]>,
): PersistedNewsRecord {
  const titleHighlight = highlight?.title?.join("");
  const contentHighlight = highlight?.content?.join("");

  return {
    id: String(source.id ?? ""),
    title: titleHighlight ?? cleanText(String(source.title ?? "")),
    content: contentHighlight ?? cleanText(String(source.content ?? "")),
    source: cleanText(String(source.source ?? "")),
    sourceUrl: source.sourceUrl ? String(source.sourceUrl) : null,
    externalId: String(source.externalId ?? ""),
    author: source.author ? String(source.author) : null,
    category: source.category ? String(source.category) : null,
    sentiment:
      source.sentiment === "IMPORTANT" || source.sentiment === "NEUTRAL"
        ? (source.sentiment as PersistedNewsRecord["sentiment"])
        : null,
    aiSummary: source.aiSummary ? String(source.aiSummary) : null,
    publishTime: toIso(source.publishTime as string | number | undefined),
    createTime: toIso(source.createTime as string | number | undefined),
    updateTime: toIso(source.updateTime as string | number | undefined),
  };
}

export function normalizeDatabaseRecord(
  record: Record<string, unknown>,
): PersistedNewsRecord {
  return {
    id: String(record.id ?? ""),
    title: cleanText(String(record.title ?? "")),
    content: cleanText(String(record.content ?? "")),
    source: cleanText(String(record.source ?? "")),
    sourceUrl: record.source_url ? String(record.source_url) : null,
    externalId: String(record.external_id ?? ""),
    author: record.author ? String(record.author) : null,
    category: record.category ? String(record.category) : null,
    sentiment:
      record.sentiment === "IMPORTANT" || record.sentiment === "NEUTRAL"
        ? (record.sentiment as PersistedNewsRecord["sentiment"])
        : null,
    aiSummary: record.ai_summary ? String(record.ai_summary) : null,
    publishTime: toIso(record.publish_time as string | Date | undefined),
    createTime: toIso(record.create_time as string | Date | undefined),
    updateTime: toIso(record.update_time as string | Date | undefined),
  };
}

export function toEsDocument(record: PersistedNewsRecord) {
  return {
    ...record,
    publishTime: new Date(record.publishTime).getTime(),
    createTime: new Date(record.createTime).getTime(),
    updateTime: new Date(record.updateTime).getTime(),
  };
}

export function toInsertValues(id: string, draft: DraftNewsRecord, now: Date) {
  return [
    id,
    cleanText(draft.title),
    cleanText(draft.content),
    cleanText(draft.source),
    draft.sourceUrl,
    draft.externalId,
    draft.author ?? null,
    draft.category,
    draft.publishTime,
    draft.sentiment,
    draft.aiSummary ?? null,
    now,
    now,
  ];
}

export function buildPersistedNewsRecord(draft: DraftNewsRecord): PersistedNewsRecord {
  const now = new Date().toISOString();

  return {
    id: snowflake.nextId(),
    title: cleanText(draft.title),
    content: cleanText(draft.content),
    source: cleanText(draft.source),
    sourceUrl: draft.sourceUrl,
    externalId: draft.externalId,
    author: draft.author ?? null,
    category: draft.category,
    sentiment: draft.sentiment,
    aiSummary: draft.aiSummary ?? null,
    publishTime: draft.publishTime.toISOString(),
    createTime: now,
    updateTime: now,
  };
}
