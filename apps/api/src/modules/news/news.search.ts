import { Client } from "@elastic/elasticsearch";
import type { NewsListResponse, NewsRecord, NewsStatsResponse } from "@odin-pulse/shared";

import { env } from "../../config/env.js";
import type {
  PersistedNewsRecord,
  RelatedNewsParams,
  SearchNewsParams,
  SearchNewsResult,
} from "./news.types.js";
import { normalizeEsRecord, toEsDocument } from "./news.utils.js";

export class NewsSearchRepository {
  private readonly client = new Client({
    node: env.ES_NODE,
    auth: {
      username: env.ES_USERNAME,
      password: env.ES_PASSWORD,
    },
  });

  async healthcheck() {
    await this.client.ping();
  }

  async ensureIndex() {
    const exists = await this.client.indices.exists({ index: env.ES_INDEX });
    if (exists) {
      return;
    }

    await this.client.indices.create({
      index: env.ES_INDEX,
      settings: {
        number_of_shards: 1,
        number_of_replicas: 1,
        max_result_window: 100000,
      },
      mappings: {
        properties: {
          id: { type: "keyword" },
          title: { type: "text", analyzer: "ik_max_word", search_analyzer: "ik_smart" },
          content: { type: "text", analyzer: "ik_max_word", search_analyzer: "ik_smart" },
          source: { type: "keyword" },
          sourceUrl: { type: "keyword" },
          externalId: { type: "keyword" },
          author: { type: "keyword" },
          category: { type: "keyword" },
          sentiment: { type: "keyword" },
          aiSummary: { type: "text" },
          publishTime: { type: "date" },
          createTime: { type: "long" },
          updateTime: { type: "long" },
        },
      },
    });
  }

  async indexNews(record: PersistedNewsRecord) {
    await this.ensureIndex();
    await this.client.index({
      index: env.ES_INDEX,
      id: record.id,
      document: toEsDocument(record),
      refresh: false,
    });
  }

  async getNewsById(id: string): Promise<NewsRecord | null> {
    await this.ensureIndex();

    const response = await this.client.get({
      index: env.ES_INDEX,
      id,
    });

    if (!response.found || !response._source) {
      return null;
    }

    return normalizeEsRecord(response._source as Record<string, unknown>);
  }

  async getNewsByExternalId(externalId: string): Promise<NewsRecord | null> {
    await this.ensureIndex();

    const response = await this.client.search({
      index: env.ES_INDEX,
      size: 1,
      query: {
        term: {
          "externalId.keyword": externalId,
        },
      } as never,
    });

    const hit = response.hits.hits[0] as { _source?: Record<string, unknown> } | undefined;
    if (!hit?._source) {
      return null;
    }

    return normalizeEsRecord(hit._source);
  }

  async getRelatedNews(params: RelatedNewsParams): Promise<NewsRecord[]> {
    await this.ensureIndex();

    const response = await this.client.search({
      index: env.ES_INDEX,
      size: params.size ?? 6,
      sort: [{ publishTime: { order: "desc" } }],
      collapse: { field: "externalId.keyword" },
      query: {
        bool: {
          filter: [
            { term: { source: params.source } },
            ...(params.category ? [{ term: { category: params.category } }] : []),
          ],
          should: params.sentiment
            ? [{ term: { sentiment: params.sentiment } }]
            : undefined,
          minimum_should_match: params.sentiment ? 0 : undefined,
          must_not: [{ term: { id: params.id } }],
        },
      } as never,
    });

    const hits = response.hits.hits as Array<{
      _source?: Record<string, unknown>;
    }>;

    const items = hits
      .map((hit) => (hit._source ? normalizeEsRecord(hit._source) : null))
      .filter((item): item is NewsRecord => Boolean(item));

    if (items.length >= (params.size ?? 6) || !params.category) {
      return items;
    }

    const fallback = await this.client.search({
      index: env.ES_INDEX,
      size: (params.size ?? 6) - items.length,
      sort: [{ publishTime: { order: "desc" } }],
      collapse: { field: "externalId.keyword" },
      query: {
        bool: {
          filter: [{ term: { category: params.category } }],
          must_not: [
            { term: { id: params.id } },
            ...items.map((item) => ({ term: { id: item.id } })),
          ],
        },
      } as never,
    });

    const fallbackHits = fallback.hits.hits as Array<{
      _source?: Record<string, unknown>;
    }>;

    return [
      ...items,
      ...fallbackHits
        .map((hit) => (hit._source ? normalizeEsRecord(hit._source) : null))
        .filter((item): item is NewsRecord => Boolean(item)),
    ];
  }

  async searchNews(params: SearchNewsParams): Promise<SearchNewsResult> {
    await this.ensureIndex();

    const page = Math.max(1, params.page);
    const pageSize = Math.max(1, params.pageSize);
    const keyword = params.keyword?.trim();
    const category = params.category?.trim();
    const source = params.source?.trim();
    const sentiment = params.sentiment?.trim();

    const filters: Array<Record<string, unknown>> = [];
    if (category && category !== "all" && category !== "全部") {
      filters.push({ term: { category } });
    }
    if (source && source !== "all") {
      filters.push({
        terms: {
          source: source.split(",").map((item) => item.trim()).filter(Boolean),
        },
      });
    }
    if (sentiment && sentiment !== "all") {
      filters.push({ term: { sentiment } });
    }

    const query = keyword
      ? {
          bool: {
            must: [
              {
                multi_match: {
                  query: keyword,
                  fields: ["title", "content", "aiSummary"],
                  operator: "and",
                },
              },
            ],
            filter: filters,
          },
        }
      : {
          bool: {
            filter: filters,
          },
        };

    const response = await this.client.search({
      index: env.ES_INDEX,
      from: (page - 1) * pageSize,
      size: pageSize,
      track_total_hits: true,
      sort: [{ publishTime: { order: "desc" } }],
      collapse: { field: "externalId.keyword" },
      query: query as never,
      highlight: {
        fields: {
          title: { pre_tags: ["<mark>"], post_tags: ["</mark>"] },
          content: { pre_tags: ["<mark>"], post_tags: ["</mark>"] },
        },
      },
      aggs: {
        uniqueTotal: {
          cardinality: {
            field: "externalId.keyword",
            precision_threshold: 40000,
          },
        },
        sources: { terms: { field: "source", size: 20 } },
        categories: { terms: { field: "category", size: 20 } },
      },
    });

    const hits = response.hits.hits as Array<{
      _source?: Record<string, unknown>;
      highlight?: Record<string, string[]>;
    }>;
    const items = hits.map((hit) => normalizeEsRecord(hit._source ?? {}, hit.highlight));
    const total =
      response.aggregations?.uniqueTotal && "value" in response.aggregations.uniqueTotal
        ? Number(response.aggregations.uniqueTotal.value ?? 0)
        : typeof response.hits.total === "number"
          ? response.hits.total
          : response.hits.total?.value ?? 0;

    const sourceBuckets = (
      response.aggregations?.sources && "buckets" in response.aggregations.sources
        ? response.aggregations.sources.buckets
        : []
    ) as Array<{ key: string }>;

    const categoryBuckets = (
      response.aggregations?.categories && "buckets" in response.aggregations.categories
        ? response.aggregations.categories.buckets
        : []
    ) as Array<{ key: string }>;

    return {
      items,
      total,
      sources: sourceBuckets.map((bucket) => String(bucket.key)),
      categories: categoryBuckets.map((bucket) => String(bucket.key)),
    };
  }

  async getStats(): Promise<NewsStatsResponse> {
    await this.ensureIndex();

    const response = await this.client.search({
      index: env.ES_INDEX,
      size: 0,
      track_total_hits: true,
      aggs: {
        uniqueTotal: {
          cardinality: {
            field: "externalId.keyword",
            precision_threshold: 40000,
          },
        },
        importantCount: {
          filter: { term: { sentiment: "IMPORTANT" } },
          aggs: {
            uniqueImportant: {
              cardinality: {
                field: "externalId.keyword",
                precision_threshold: 40000,
              },
            },
          },
        },
        sources: { cardinality: { field: "source" } },
        latest: {
          max: { field: "publishTime" },
        },
      },
    });

    return {
      total:
        response.aggregations?.uniqueTotal && "value" in response.aggregations.uniqueTotal
          ? Number(response.aggregations.uniqueTotal.value ?? 0)
          : typeof response.hits.total === "number"
            ? response.hits.total
            : response.hits.total?.value ?? 0,
      importantCount:
        response.aggregations?.importantCount &&
        "uniqueImportant" in response.aggregations.importantCount &&
        response.aggregations.importantCount.uniqueImportant &&
        "value" in response.aggregations.importantCount.uniqueImportant
          ? Number(response.aggregations.importantCount.uniqueImportant.value ?? 0)
          : 0,
      sources:
        response.aggregations?.sources && "value" in response.aggregations.sources
          ? Number(response.aggregations.sources.value ?? 0)
          : 0,
      latestPublishTime:
        response.aggregations?.latest &&
        "value" in response.aggregations.latest &&
        response.aggregations.latest.value
          ? new Date(response.aggregations.latest.value).toISOString()
          : null,
    };
  }

  async toNewsListResponse(
    params: SearchNewsParams,
    refreshedAt: string | null,
  ): Promise<NewsListResponse> {
    const result = await this.searchNews(params);
    return {
      items: result.items,
      total: result.total,
      page: params.page,
      pageSize: params.pageSize,
      sources: result.sources,
      categories: result.categories,
      refreshedAt,
    };
  }
}
