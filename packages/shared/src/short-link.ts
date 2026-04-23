export interface ShortLink {
  id: string;
  slug: string;
  originalUrl: string;
  description?: string;
  visitCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CreateShortLinkRequest {
  originalUrl: string;
  slug?: string;
  description?: string;
}

export interface ShortLinkListResponse {
  items: ShortLink[];
  total: number;
}
