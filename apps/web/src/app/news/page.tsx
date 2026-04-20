import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  DatabaseZap,
  Filter,
  Newspaper,
  Radar,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { fetchNews } from "@/lib/api";
import { RefreshButton } from "@/components/refresh-button";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const quickFilters = [
  { label: "全部", href: "/news" },
  { label: "重点资讯", href: "/news?sentiment=IMPORTANT" },
  { label: "快讯流", href: "/news?category=%E5%BF%AB%E8%AE%AF" },
  { label: "新闻稿", href: "/news?category=%E6%96%B0%E9%97%BB" },
] as const;

export const dynamic = "force-dynamic";

export default async function NewsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolved = await searchParams;
  const page = pickSingle(resolved.page) ?? "1";
  const pageSize = pickSingle(resolved.pageSize) ?? "20";
  const keyword = pickSingle(resolved.keyword) ?? "";
  const category = pickSingle(resolved.category) ?? "";
  const source = pickSingle(resolved.source) ?? "";
  const sentiment = pickSingle(resolved.sentiment) ?? "";

  const data = await fetchNews({
    page: Number(page),
    pageSize: Number(pageSize),
    keyword,
    category,
    source,
    sentiment,
  });

  const currentPage = Number(page);
  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));
  const startIndex = Math.max(1, (currentPage - 1) * data.pageSize + 1);
  const endIndex = Math.min(data.total, currentPage * data.pageSize);
  const prevHref = buildPageHref(currentPage - 1, resolved);
  const nextHref = buildPageHref(currentPage + 1, resolved);
  const leadItem = data.items[0];
  const remainingItems = data.items.slice(1);
  const activeFilters = [
    keyword ? `关键词：${keyword}` : null,
    category ? `分类：${category}` : null,
    source ? `来源：${source}` : null,
    sentiment ? `重要级：${sentiment === "IMPORTANT" ? "重点" : sentiment}` : null,
  ].filter(Boolean) as string[];

  return (
    <main className="shell px-4 py-8 md:px-6">
      <section className="panel-strong rounded-[2rem] px-6 py-6 md:px-8 md:py-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-4xl">
            <Link href="/" className="eyebrow">
              Odin Pulse
            </Link>
            <h1 className="headline mt-3 text-4xl font-semibold text-primary md:text-5xl">
              新闻聚合中心
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
              这里直接读取 Elasticsearch 聚合结果。重点是让检索、筛选、跳转和阅读密度更适合连续浏览，而不是只把原始列表平铺出来。
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <StatusPill icon={<Radar className="h-4 w-4" />} text={`当前显示 ${startIndex}-${endIndex} / ${data.total.toLocaleString()}`} />
              <StatusPill
                icon={<DatabaseZap className="h-4 w-4" />}
                text={`最近同步 ${data.refreshedAt ? formatDateTime(data.refreshedAt) : "暂无"}`}
              />
              <StatusPill icon={<SlidersHorizontal className="h-4 w-4" />} text={`${data.sources.length} 个来源 / ${data.categories.length} 个分类`} />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <RefreshButton />
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:-translate-y-0.5 hover:border-secondary hover:text-secondary"
            >
              返回首页
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          <MiniStat
            icon={<Newspaper className="h-4 w-4" />}
            label="结果规模"
            value={`${data.total.toLocaleString()} 条`}
          />
          <MiniStat
            icon={<CalendarClock className="h-4 w-4" />}
            label="当前分页"
            value={`${currentPage} / ${totalPages}`}
          />
          <MiniStat
            icon={<DatabaseZap className="h-4 w-4" />}
            label="来源覆盖"
            value={`${data.sources.length} 个`}
          />
          <MiniStat
            icon={<Filter className="h-4 w-4" />}
            label="激活筛选"
            value={activeFilters.length ? `${activeFilters.length} 个` : "无"}
          />
        </div>
      </section>

      <section className="panel mt-8 rounded-[2rem] px-6 py-6 md:px-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-secondary">
              <Search className="h-4 w-4" />
              URL 即筛选状态，便于分享和后续扩展
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {quickFilters.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:-translate-y-0.5 hover:border-secondary hover:text-secondary"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {activeFilters.length ? (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-accent-soft px-3 py-2 text-sm font-semibold text-accent"
                >
                  {item}
                </span>
              ))}
              <Link
                href="/news"
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:-translate-y-0.5 hover:border-secondary hover:text-secondary"
              >
                清空筛选
              </Link>
            </div>
          ) : null}
        </div>

        <form
          action="/news"
          className="mt-6 grid gap-4 xl:grid-cols-[2fr_1fr_1fr_1fr_auto]"
        >
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            关键词
            <input
              name="keyword"
              defaultValue={keyword}
              placeholder="如：美联储、黄金、特斯拉"
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            分类
            <select
              name="category"
              defaultValue={category}
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
            >
              <option value="">全部</option>
              {data.categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            来源
            <select
              name="source"
              defaultValue={source}
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
            >
              <option value="">全部</option>
              {data.sources.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            重要级
            <select
              name="sentiment"
              defaultValue={sentiment}
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
            >
              <option value="">全部</option>
              <option value="IMPORTANT">重点</option>
            </select>
          </label>

          <div className="flex items-end gap-3">
            <input type="hidden" name="page" value="1" />
            <input type="hidden" name="pageSize" value={pageSize} />
            <button className="h-12 rounded-2xl bg-primary px-5 text-sm font-semibold text-white hover:-translate-y-0.5 hover:bg-slate-800">
              查询
            </button>
          </div>
        </form>
      </section>

      {leadItem ? (
        <section className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <article className="story-gradient rounded-[2rem] px-6 py-6 md:px-7">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-white/70">
              <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1">
                当前焦点
              </span>
              <span>{leadItem.source}</span>
              {leadItem.category ? <span>{leadItem.category}</span> : null}
              <span>{formatDateTime(leadItem.publishTime)}</span>
            </div>
            <h2 className="headline mt-5 text-3xl font-semibold leading-tight text-white md:text-4xl">
              {leadItem.title}
            </h2>
            <p
              className="mt-4 text-sm leading-8 text-white/82"
              dangerouslySetInnerHTML={{ __html: leadItem.content }}
            />
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/news/${leadItem.id}`}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary hover:-translate-y-0.5"
              >
                查看详情
                <ArrowRight className="h-4 w-4" />
              </Link>
              {leadItem.sourceUrl ? (
                <a
                  href={leadItem.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-4 py-2 text-sm font-semibold text-white hover:-translate-y-0.5"
                >
                  查看原文
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              ) : null}
              <Link
                href={buildKeywordHref(leadItem.title)}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-4 py-2 text-sm font-semibold text-white hover:-translate-y-0.5"
              >
                关联搜索
              </Link>
            </div>
          </article>

          <aside className="panel rounded-[2rem] px-6 py-6 md:px-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Focus View</p>
                <h3 className="headline mt-2 text-2xl font-semibold text-primary">
                  追踪提示
                </h3>
              </div>
              <Filter className="h-5 w-5 text-secondary" />
            </div>
            <div className="mt-5 space-y-4">
              <InsightCard
                title="筛选状态"
                body={activeFilters.length ? activeFilters.join(" / ") : "当前为默认视图，适合从最新结果开始浏览。"}
              />
              <InsightCard
                title="来源分布"
                body={`当前结果覆盖 ${data.sources.length} 个来源，优先活跃来源包括 ${data.sources.slice(0, 3).join("、")}。`}
              />
              <InsightCard
                title="浏览建议"
                body="先看焦点卡片，再顺着列表看来源和重要级。需要复盘某一条主线时，直接用关键词回查。"
              />
            </div>
          </aside>
        </section>
      ) : null}

      <section className="mt-8 grid gap-4">
        {remainingItems.map((item) => (
          <article key={item.id} className="panel-strong rounded-[1.75rem] px-5 py-5 md:px-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
                  <span className="rounded-full bg-slate-100 px-3 py-1">{item.source}</span>
                  {item.category ? (
                    <span className="rounded-full bg-white px-3 py-1">{item.category}</span>
                  ) : null}
                  {item.sentiment === "IMPORTANT" ? (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-800">
                      重点
                    </span>
                  ) : null}
                  <span>{formatDateTime(item.publishTime)}</span>
                </div>

                <h3 className="headline mt-4 text-2xl font-semibold text-primary">
                  {item.title}
                </h3>
                <p
                  className="mt-3 text-sm leading-8 text-slate-600"
                  dangerouslySetInnerHTML={{ __html: item.content }}
                />
              </div>

                <div className="flex shrink-0 flex-wrap gap-3 lg:w-[220px] lg:justify-end">
                <Link
                  href={`/news/${item.id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:-translate-y-0.5 hover:border-secondary hover:text-secondary"
                >
                  查看详情
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={buildKeywordHref(item.title)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:-translate-y-0.5 hover:border-secondary hover:text-secondary"
                >
                  关联搜索
                </Link>
                {item.sourceUrl ? (
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:-translate-y-0.5 hover:bg-slate-800"
                  >
                    查看原文
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </section>

      <nav className="mt-8 flex flex-col gap-4 rounded-[1.75rem] border border-slate-200 bg-white/85 px-5 py-5 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-slate-500">
          当前展示第 {startIndex}-{endIndex} 条，共 {data.total.toLocaleString()} 条
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={prevHref}
            aria-disabled={currentPage <= 1}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
              currentPage <= 1
                ? "pointer-events-none border border-slate-200 bg-slate-100 text-slate-400"
                : "border border-slate-300 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-secondary hover:text-secondary"
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            上一页
          </Link>
          <span className="text-sm text-slate-500">
            第 {currentPage} 页，共 {totalPages} 页
          </span>
          <Link
            href={nextHref}
            aria-disabled={currentPage >= totalPages}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
              currentPage >= totalPages
                ? "pointer-events-none border border-slate-200 bg-slate-100 text-slate-400"
                : "border border-slate-300 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-secondary hover:text-secondary"
            }`}
          >
            下一页
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </main>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="panel-muted rounded-[1.5rem] px-4 py-4">
      <div className="flex items-center gap-2 text-secondary">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-[0.18em]">
          {label}
        </span>
      </div>
      <p className="headline mt-3 text-xl font-semibold text-primary">{value}</p>
    </div>
  );
}

function InsightCard({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <article className="panel-muted rounded-[1.5rem] px-4 py-4">
      <p className="headline text-lg font-semibold text-primary">{title}</p>
      <p className="mt-2 text-sm leading-7 text-slate-600">{body}</p>
    </article>
  );
}

function StatusPill({
  icon,
  text,
}: {
  icon: ReactNode;
  text: string;
}) {
  return (
    <span className="kicker-chip">
      {icon}
      {text}
    </span>
  );
}

function pickSingle(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildPageHref(
  page: number,
  searchParams: Record<string, string | string[] | undefined>,
) {
  const next = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    const resolved = pickSingle(value);
    if (resolved) {
      next.set(key, resolved);
    }
  });
  next.set("page", String(Math.max(1, page)));
  return `/news?${next.toString()}`;
}

function buildKeywordHref(title: string) {
  return `/news?keyword=${encodeURIComponent(title.slice(0, 20))}`;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
