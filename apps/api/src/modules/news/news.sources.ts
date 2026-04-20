import { load } from "cheerio";

import type { DraftNewsRecord } from "./news.types.js";
import { browserHeaders, cleanText, parseRelativeTime } from "./news.utils.js";

async function safeJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

function buildRecord(record: DraftNewsRecord): DraftNewsRecord | null {
  const title = cleanText(record.title);
  const content = cleanText(record.content || record.title);

  if (!title && !content) {
    return null;
  }

  return {
    ...record,
    title: title || content,
    content: content || title,
  };
}

export async function fetchCls(): Promise<DraftNewsRecord[]> {
  const url =
    "https://www.cls.cn/nodeapi/updateTelegraphList?appName=CailianpressWeb&os=web&sv=7.7.5&sign=9c11221af4f6b47b253098a8b9957b8f";
  const response = await fetch(url, { headers: browserHeaders });
  if (!response.ok) {
    throw new Error(`CLS fetch failed with ${response.status}`);
  }

  const json = await safeJson<{
    data?: { roll_data?: Array<Record<string, unknown>> };
  }>(response);

  return (json.data?.roll_data ?? [])
    .filter((item) => Number(item.is_ad ?? 0) !== 1)
    .map((item) =>
      buildRecord({
        title: String(item.title ?? item.brief ?? ""),
        content: String(item.brief ?? item.title ?? ""),
        source: "财联社",
        sourceUrl: `https://www.cls.cn/detail/${item.id ?? ""}`,
        externalId: `cls_${item.id ?? ""}`,
        category: "快讯",
        sentiment:
          ["A", "B"].includes(String(item.level ?? "").toUpperCase()) ? "IMPORTANT" : null,
        publishTime: new Date(Number(item.ctime ?? Date.now() / 1000) * 1000),
      }),
    )
    .filter((item): item is DraftNewsRecord => Boolean(item));
}

export async function fetchThePaper(): Promise<DraftNewsRecord[]> {
  const response = await fetch("https://cache.thepaper.cn/contentapi/wwwIndex/rightSidebar", {
    headers: browserHeaders,
  });
  if (!response.ok) {
    throw new Error(`ThePaper fetch failed with ${response.status}`);
  }

  const json = await safeJson<{
    data?: { hotNews?: Array<Record<string, unknown>> };
  }>(response);

  return (json.data?.hotNews ?? [])
    .map((item) =>
      buildRecord({
        title: String(item.name ?? ""),
        content: String(item.name ?? ""),
        source: "澎湃新闻",
        sourceUrl: `https://www.thepaper.cn/newsDetail_forward_${item.contId ?? ""}`,
        externalId: `thepaper_${item.contId ?? ""}`,
        category: "新闻",
        sentiment: null,
        publishTime: new Date(),
      }),
    )
    .filter((item): item is DraftNewsRecord => Boolean(item));
}

export async function fetchIfeng(): Promise<DraftNewsRecord[]> {
  const response = await fetch("https://www.ifeng.com/", { headers: browserHeaders });
  if (!response.ok) {
    throw new Error(`Ifeng fetch failed with ${response.status}`);
  }

  const html = await response.text();
  const match = html.match(/var\s+allData\s*=\s*(\{[\s\S]*?\});/);
  if (!match) {
    return [];
  }

  const root = JSON.parse(match[1]) as { hotNews1?: Array<Record<string, unknown>> };
  return (root.hotNews1 ?? [])
    .map((item) => {
      const url = String(item.url ?? "");
      return buildRecord({
        title: String(item.title ?? ""),
        content: String(item.title ?? ""),
        source: "凤凰网",
        sourceUrl: url,
        externalId: `ifeng_${url.replace(/[^a-zA-Z0-9]/g, "")}`,
        category: "新闻",
        sentiment: null,
        publishTime: new Date(),
      });
    })
    .filter((item): item is DraftNewsRecord => Boolean(item));
}

export async function fetch36KrQuick(): Promise<DraftNewsRecord[]> {
  const response = await fetch("https://www.36kr.com/newsflashes", {
    headers: browserHeaders,
  });
  if (!response.ok) {
    throw new Error(`36Kr fetch failed with ${response.status}`);
  }

  const html = await response.text();
  const $ = load(html);
  return $(".newsflash-item")
    .toArray()
    .map((element) => {
      const titleAnchor = $(element).find("a.item-title").first();
      const href = titleAnchor.attr("href");
      if (!href) {
        return null;
      }

      return buildRecord({
        title: titleAnchor.text(),
        content: $(element).find(".item-desc").text() || titleAnchor.text(),
        source: "36氪",
        sourceUrl: `https://www.36kr.com${href}`,
        externalId: `36kr_${href.replace(/[^a-zA-Z0-9]/g, "")}`,
        category: "快讯",
        sentiment: null,
        publishTime: parseRelativeTime($(element).find(".time").text()),
      });
    })
    .filter((item): item is DraftNewsRecord => Boolean(item));
}

export async function fetchWallstreetcnLive(): Promise<DraftNewsRecord[]> {
  const response = await fetch(
    "https://api-one.wallstcn.com/apiv1/content/lives?channel=global-channel&limit=30",
  );
  if (!response.ok) {
    throw new Error(`Wallstreetcn live fetch failed with ${response.status}`);
  }

  const json = await safeJson<{
    data?: { items?: Array<Record<string, unknown>> };
  }>(response);

  return (json.data?.items ?? [])
    .map((item) =>
      buildRecord({
        title: String(item.title ?? item.content_text ?? ""),
        content: String(item.content_text ?? item.title ?? ""),
        source: "华尔街见闻-快讯",
        sourceUrl: String(item.uri ?? ""),
        externalId: `wsc_live_${item.id ?? ""}`,
        category: "快讯",
        sentiment: Number(item.score ?? 1) > 1 ? "IMPORTANT" : null,
        publishTime: new Date(Number(item.display_time ?? Date.now() / 1000) * 1000),
      }),
    )
    .filter((item): item is DraftNewsRecord => Boolean(item));
}

export async function fetchWallstreetcnNews(): Promise<DraftNewsRecord[]> {
  const response = await fetch(
    "https://api-one.wallstcn.com/apiv1/content/information-flow?channel=global-channel&accept=article&limit=30",
  );
  if (!response.ok) {
    throw new Error(`Wallstreetcn news fetch failed with ${response.status}`);
  }

  const json = await safeJson<{
    data?: { items?: Array<Record<string, unknown>> };
  }>(response);

  return (json.data?.items ?? [])
    .map((wrapper) => {
      const resourceType = String(wrapper.resource_type ?? "");
      const resource = (wrapper.resource ?? {}) as Record<string, unknown>;
      if (
        resourceType === "ad" ||
        resourceType === "theme" ||
        String(resource.type ?? "") === "live"
      ) {
        return null;
      }

      return buildRecord({
        title: String(resource.title ?? resource.content_short ?? ""),
        content: String(resource.content_short ?? resource.title ?? ""),
        source: "华尔街见闻",
        sourceUrl: String(resource.uri ?? ""),
        externalId: `wsc_news_${resource.id ?? ""}`,
        category: "新闻",
        sentiment: null,
        publishTime: new Date(Number(resource.display_time ?? Date.now() / 1000) * 1000),
      });
    })
    .filter((item): item is DraftNewsRecord => Boolean(item));
}

export async function fetchJin10(): Promise<DraftNewsRecord[]> {
  const response = await fetch(`https://www.jin10.com/flash_newest.js?t=${Date.now()}`, {
    headers: {
      ...browserHeaders,
      Referer: "https://www.jin10.com/",
    },
  });
  if (!response.ok) {
    throw new Error(`Jin10 fetch failed with ${response.status}`);
  }

  const raw = await response.text();
  const normalized = raw.replace(/^var\s+newest\s*=\s*/, "").replace(/;*\s*$/, "");
  const items = JSON.parse(normalized) as Array<Record<string, unknown>>;

  return items
    .map((item) => {
      const data = (item.data ?? {}) as Record<string, unknown>;
      const title = String(data.title ?? "");
      const content = String(data.content ?? "");
      const text = cleanText(title || content);
      if (!text) {
        return null;
      }

      const time = String(item.time ?? "");
      const publishTime = /^\d{4}-\d{2}-\d{2}/.test(time)
        ? new Date(time.replace(" ", "T"))
        : new Date();

      return buildRecord({
        title: text,
        content: text,
        source: "金十数据",
        sourceUrl: `https://flash.jin10.com/detail/${item.id ?? ""}`,
        externalId: `jin10_${item.id ?? ""}`,
        category: "快讯",
        sentiment: Number(item.important ?? 0) > 0 ? "IMPORTANT" : null,
        publishTime,
      });
    })
    .filter((item): item is DraftNewsRecord => Boolean(item));
}

export const newsSources = [
  { name: "wallstreetcn-live", fetch: fetchWallstreetcnLive },
  { name: "wallstreetcn-news", fetch: fetchWallstreetcnNews },
  { name: "jin10", fetch: fetchJin10 },
  { name: "36kr", fetch: fetch36KrQuick },
  { name: "cls", fetch: fetchCls },
  { name: "thepaper", fetch: fetchThePaper },
  { name: "ifeng", fetch: fetchIfeng },
] as const;
