export const NEWS_CATEGORIES = ["全部", "快讯", "新闻", "宏观", "公司"] as const;

export const NEWS_SENTIMENTS = ["all", "IMPORTANT", "NEUTRAL"] as const;

export const FUTURE_MODULES = [
  {
    key: "markets",
    title: "市场看板",
    description: "后续接入行情、异动与宏观指标概览。",
    status: "规划中",
  },
  {
    key: "research",
    title: "投研中心",
    description: "沉淀研报、专题观点与跟踪观察。",
    status: "规划中",
  },
  {
    key: "alerts",
    title: "事件告警",
    description: "面向策略和运营的实时提醒入口。",
    status: "规划中",
  },
  {
    key: "knowledge",
    title: "知识库",
    description: "后续纳入结构化资料与业务文档检索。",
    status: "规划中",
  },
] as const;

export type FutureModule = (typeof FUTURE_MODULES)[number];

export type NewsCategory = "快讯" | "新闻" | "宏观" | "公司" | string;

export type NewsSentiment = "IMPORTANT" | "NEUTRAL" | null;

export type NewsRecord = {
  id: string;
  title: string;
  content: string;
  source: string;
  sourceUrl: string | null;
  externalId: string;
  author: string | null;
  category: NewsCategory | null;
  sentiment: NewsSentiment;
  aiSummary: string | null;
  publishTime: string;
  createTime: string;
  updateTime: string;
};

export type NewsQuery = {
  page?: number;
  pageSize?: number;
  keyword?: string;
  category?: string;
  source?: string;
  sentiment?: string;
};

export type NewsListResponse = {
  items: NewsRecord[];
  total: number;
  page: number;
  pageSize: number;
  sources: string[];
  categories: string[];
  refreshedAt: string | null;
};

export type RefreshResponse = {
  accepted: boolean;
  startedAt: string;
  message: string;
};

export type NewsStatsResponse = {
  total: number;
  importantCount: number;
  sources: number;
  latestPublishTime: string | null;
};

export type NewsDetailResponse = {
  item: NewsRecord;
  related: NewsRecord[];
  refreshedAt: string | null;
};
