import type {
  NewsDetailResponse,
  NewsListResponse,
  NewsQuery,
  NewsStatsResponse,
} from "@odin-pulse/shared";

function getApiBaseUrl() {
  if (typeof window === "undefined") {
    return process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function fetchNews(query: NewsQuery): Promise<NewsListResponse> {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  return fetchJson<NewsListResponse>(`/api/v1/news?${params.toString()}`);
}

export async function fetchNewsStats(): Promise<NewsStatsResponse> {
  return fetchJson<NewsStatsResponse>("/api/v1/news/stats");
}

export async function fetchNewsDetail(id: string): Promise<NewsDetailResponse> {
  return fetchJson<NewsDetailResponse>(`/api/v1/news/${id}`);
}
