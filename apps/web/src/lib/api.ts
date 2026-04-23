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

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
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

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return (await response.json()) as ShortLink;
}

export async function deleteShortLink(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/short-links/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return (await response.json()) as { success: boolean };
}
