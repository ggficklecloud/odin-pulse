import type {
  AuthCurrentUser,
  UserInfo,
  NewsDetailResponse,
  NewsListResponse,
  NewsQuery,
  NewsStatsResponse,
  ShortLink,
  ShortLinkListResponse,
  CreateShortLinkRequest,
  MarketListResponse,
} from "@odin-pulse/shared";

function getApiBaseUrl() {
  if (typeof window === "undefined") {
    return (
      process.env.API_BASE_URL ??
      (process.env.NODE_ENV === "production" ? "http://api:3101" : "http://127.0.0.1:3001")
    );
  }
  return "";
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `Request failed: ${response.status}`;
    try {
      const body = await response.json();
      message = body.message || message;
    } catch (e) {
      // Ignore parse error
    }
    throw new Error(message);
  }
  return (await response.json()) as T;
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return handleResponse<T>(response);
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

export async function fetchCurrentUser(): Promise<AuthCurrentUser | null> {
  return fetchJson<AuthCurrentUser>("/api/v1/auth/me");
}

export async function fetchUserInfo(): Promise<UserInfo> {
  return fetchJson<UserInfo>("/api/v1/user/get-user-info");
}

export async function fetchShortLinks(): Promise<ShortLinkListResponse> {
  return fetchJson<ShortLinkListResponse>("/api/v1/short-links");
}

export async function createShortLink(data: CreateShortLinkRequest): Promise<ShortLink> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/short-links`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<ShortLink>(response);
}

export async function deleteShortLink(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/short-links/${id}`, {
    method: "DELETE",
  });
  return handleResponse<{ success: boolean }>(response);
}

export async function fetchMarketQuotes(symbols?: string[]): Promise<MarketListResponse> {
  const path = symbols ? `/api/v1/market/quotes?symbols=${symbols.join(",")}` : "/api/v1/market/quotes";
  return fetchJson<MarketListResponse>(path);
}
