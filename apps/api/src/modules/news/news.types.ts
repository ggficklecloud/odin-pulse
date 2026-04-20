import type { NewsRecord, NewsSentiment } from "@odin-pulse/shared";

export type DraftNewsRecord = {
  title: string;
  content: string;
  source: string;
  sourceUrl: string | null;
  externalId: string;
  author?: string | null;
  category: string | null;
  sentiment: NewsSentiment;
  aiSummary?: string | null;
  publishTime: Date;
};

export type PersistedNewsRecord = NewsRecord;

export type SearchNewsParams = {
  page: number;
  pageSize: number;
  keyword?: string;
  category?: string;
  source?: string;
  sentiment?: string;
};

export type SearchNewsResult = {
  items: PersistedNewsRecord[];
  total: number;
  sources: string[];
  categories: string[];
};

export type RelatedNewsParams = {
  id: string;
  source: string;
  category?: string | null;
  sentiment?: NewsSentiment;
  size?: number;
};

export type NewsFetchSummary = {
  fetched: number;
  inserted: number;
  indexed: number;
  skipped: number;
  errors: string[];
  startedAt: string;
  finishedAt: string;
};
