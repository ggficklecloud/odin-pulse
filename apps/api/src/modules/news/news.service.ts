import type {
  NewsDetailResponse,
  NewsListResponse,
  NewsRecord,
  NewsQuery,
  NewsStatsResponse,
  RefreshResponse,
} from "@odin-pulse/shared";

import { env } from "../../config/env.js";
import { NewsSearchRepository } from "./news.search.js";
import { newsSources } from "./news.sources.js";
import type { DraftNewsRecord, NewsFetchSummary, SearchNewsParams } from "./news.types.js";
import { buildPersistedNewsRecord } from "./news.utils.js";

export class NewsService {
  private readonly searchRepository = new NewsSearchRepository();
  private readonly refreshLock = {
    inFlight: false,
    lastStartedAt: 0,
    lastFinishedAt: 0,
  };

  async healthcheck() {
    await this.searchRepository.healthcheck();
  }

  getSchedulerState() {
    return {
      inFlight: this.refreshLock.inFlight,
      lastStartedAt: this.refreshLock.lastStartedAt
        ? new Date(this.refreshLock.lastStartedAt).toISOString()
        : null,
      lastFinishedAt: this.refreshLock.lastFinishedAt
        ? new Date(this.refreshLock.lastFinishedAt).toISOString()
        : null,
    };
  }

  async getNews(query: NewsQuery): Promise<NewsListResponse> {
    const params: SearchNewsParams = {
      page: Math.max(1, Number(query.page ?? 1)),
      pageSize: Math.min(50, Math.max(1, Number(query.pageSize ?? 20))),
      keyword: query.keyword,
      category: query.category,
      source: query.source,
      sentiment: query.sentiment,
    };

    return this.searchRepository.toNewsListResponse(
      params,
      this.getSchedulerState().lastFinishedAt,
    );
  }

  async getStats(): Promise<NewsStatsResponse> {
    return this.searchRepository.getStats();
  }

  async getNewsDetail(id: string): Promise<NewsDetailResponse | null> {
    const item = await this.searchRepository.getNewsById(id);

    if (!item) {
      return null;
    }

    const related = await this.searchRepository.getRelatedNews({
      id: item.id,
      source: item.source,
      category: item.category,
      sentiment: item.sentiment,
      size: 6,
    });

    return {
      item,
      related,
      refreshedAt: this.getSchedulerState().lastFinishedAt,
    };
  }

  async syncLatestToEs(limit = 200): Promise<{ synced: number }> {
    return { synced: 0 };
  }

  async triggerRefresh(trigger: "manual" | "scheduled"): Promise<RefreshResponse & { summary?: NewsFetchSummary }> {
    const now = Date.now();

    if (this.refreshLock.inFlight) {
      return {
        accepted: false,
        startedAt: new Date(now).toISOString(),
        message: "refresh already in progress",
      };
    }

    if (now - this.refreshLock.lastStartedAt < env.REFRESH_GUARD_MS) {
      return {
        accepted: false,
        startedAt: new Date(now).toISOString(),
        message: `refresh ignored: last run started less than ${env.REFRESH_GUARD_MS / 1000}s ago`,
      };
    }

    this.refreshLock.inFlight = true;
    this.refreshLock.lastStartedAt = now;

    try {
      const summary = await this.fetchAndIndexAll(trigger);
      this.refreshLock.lastFinishedAt = Date.now();
      return {
        accepted: true,
        startedAt: new Date(now).toISOString(),
        message: `${trigger} refresh completed`,
        summary,
      };
    } finally {
      this.refreshLock.inFlight = false;
    }
  }

  private async fetchAndIndexAll(trigger: "manual" | "scheduled"): Promise<NewsFetchSummary> {
    const startedAt = new Date().toISOString();
    let fetched = 0;
    let inserted = 0;
    let indexed = 0;
    let skipped = 0;
    const errors: string[] = [];

    const results = await Promise.allSettled(
      newsSources.map(async (source) => ({
        source: source.name,
        items: await source.fetch(),
      })),
    );

    const drafts: DraftNewsRecord[] = [];
    for (const result of results) {
      if (result.status === "fulfilled") {
        drafts.push(...result.value.items);
      } else {
        errors.push(result.reason instanceof Error ? result.reason.message : String(result.reason));
      }
    }

    fetched = drafts.length;

    for (const draft of drafts) {
      try {
        const existing = await this.searchRepository.getNewsByExternalId(draft.externalId);
        if (existing) {
          skipped += 1;
          continue;
        }

        const record = buildPersistedNewsRecord(draft);
        await this.searchRepository.indexNews(record);
        inserted += 1;
        indexed += 1;
      } catch (error) {
        errors.push(
          `[${trigger}] ${draft.externalId}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    return {
      fetched,
      inserted,
      indexed,
      skipped,
      errors,
      startedAt,
      finishedAt: new Date().toISOString(),
    };
  }
}
