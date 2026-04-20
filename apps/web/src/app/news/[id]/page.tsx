import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BellRing,
  Clock3,
  Newspaper,
  Radar,
  ScanSearch,
} from "lucide-react";
import { notFound } from "next/navigation";

import { AuthStatus } from "@/components/auth-status";
import { fetchNewsDetail } from "@/lib/api";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const detail = await fetchNewsDetail(id);
    return {
      title: `${detail.item.title} | Odin Pulse`,
      description: detail.item.content.slice(0, 140),
    };
  } catch {
    return {
      title: "新闻详情 | Odin Pulse",
    };
  }
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { id } = await params;

  let detail;
  try {
    detail = await fetchNewsDetail(id);
  } catch {
    notFound();
  }

  if (!detail) {
    notFound();
  }

  const { item, related, refreshedAt } = detail;
  const keywordHref = `/news?keyword=${encodeURIComponent(item.title.slice(0, 20))}`;
  const sourceHref = `/news?source=${encodeURIComponent(item.source)}`;
  const categoryHref = item.category
    ? `/news?category=${encodeURIComponent(item.category)}`
    : null;
  const importantHref = item.sentiment === "IMPORTANT" ? "/news?sentiment=IMPORTANT" : null;

  return (
    <main className="shell px-4 py-8 md:px-6">
      <section className="panel-strong rounded-[2rem] px-6 py-6 md:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:-translate-y-0.5 hover:border-secondary hover:text-secondary"
          >
            <ArrowLeft className="h-4 w-4" />
            返回新闻流
          </Link>
          <span className="kicker-chip">
            <Clock3 className="h-4 w-4 text-secondary" />
            最近同步 {refreshedAt ? formatDateTime(refreshedAt) : "暂无"}
          </span>
          <AuthStatus />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.06fr)_360px]">
          <article className="story-gradient rounded-[2rem] px-6 py-6 md:px-7">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-white/72">
              <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1">
                新闻详情
              </span>
              <span>{item.source}</span>
              {item.category ? <span>{item.category}</span> : null}
              {item.sentiment === "IMPORTANT" ? <span>重点</span> : null}
              <span>{formatDateTime(item.publishTime)}</span>
            </div>

            <h1 className="headline mt-5 text-3xl font-semibold leading-tight text-white md:text-5xl">
              {item.title}
            </h1>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={sourceHref} className="rounded-full border border-white/16 bg-white/8 px-4 py-2 text-sm font-semibold text-white hover:-translate-y-0.5">
                同源继续看
              </Link>
              {categoryHref ? (
                <Link href={categoryHref} className="rounded-full border border-white/16 bg-white/8 px-4 py-2 text-sm font-semibold text-white hover:-translate-y-0.5">
                  同分类浏览
                </Link>
              ) : null}
              <Link href={keywordHref} className="rounded-full border border-white/16 bg-white/8 px-4 py-2 text-sm font-semibold text-white hover:-translate-y-0.5">
                主线回查
              </Link>
              {item.sourceUrl ? (
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary hover:-translate-y-0.5"
                >
                  查看原文
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          </article>

          <aside className="panel rounded-[2rem] px-6 py-6 md:px-7">
            <p className="eyebrow">Track Panel</p>
            <h2 className="headline mt-2 text-2xl font-semibold text-primary">主线追踪</h2>
            <div className="mt-5 space-y-4">
              <TrackCard
                icon={<Newspaper className="h-4 w-4" />}
                title="来源维度"
                body={`这条新闻来自 ${item.source}，适合继续沿同源快讯往下追。`}
                href={sourceHref}
                action="查看同源"
              />
              {categoryHref ? (
                <TrackCard
                  icon={<Radar className="h-4 w-4" />}
                  title="分类维度"
                  body={`当前归类在 ${item.category}，可以快速回到同类信息流。`}
                  href={categoryHref}
                  action="查看同类"
                />
              ) : null}
              <TrackCard
                icon={<ScanSearch className="h-4 w-4" />}
                title="标题回查"
                body="如果你要跟同一事件的后续报道，最有效的入口仍然是标题关键词回查。"
                href={keywordHref}
                action="回查主线"
              />
              {importantHref ? (
                <TrackCard
                  icon={<BellRing className="h-4 w-4" />}
                  title="重要级"
                  body="这条内容被标记为重点资讯，说明它属于需要优先阅读的流。"
                  href={importantHref}
                  action="查看重点"
                />
              ) : null}
            </div>
          </aside>
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <article className="panel-strong rounded-[2rem] px-6 py-6 md:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Full Read</p>
              <h2 className="headline mt-2 text-3xl font-semibold text-primary">
                正文内容
              </h2>
            </div>
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
              {formatDateTime(item.publishTime)}
            </span>
          </div>

          <div className="fade-divider mt-5" />

          <div
            className="mt-6 text-base leading-8 text-slate-700"
            dangerouslySetInnerHTML={{ __html: item.content }}
          />

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={sourceHref}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:-translate-y-0.5 hover:border-secondary hover:text-secondary"
            >
              查看同源更多
            </Link>
            <Link
              href={keywordHref}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:-translate-y-0.5 hover:border-secondary hover:text-secondary"
            >
              继续回查这条主线
            </Link>
          </div>
        </article>

        <aside className="grid gap-4">
          <div className="panel rounded-[1.75rem] px-5 py-5">
            <p className="eyebrow">Meta</p>
            <h3 className="headline mt-2 text-2xl font-semibold text-primary">
              阅读上下文
            </h3>
            <div className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
              <DetailMeta label="来源" value={item.source} />
              <DetailMeta label="分类" value={item.category ?? "未分类"} />
              <DetailMeta label="重要级" value={item.sentiment === "IMPORTANT" ? "重点" : "常规"} />
              <DetailMeta label="发布时间" value={formatDateTime(item.publishTime)} />
            </div>
          </div>

          <div className="panel rounded-[1.75rem] px-5 py-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Related Reads</p>
                <h3 className="headline mt-2 text-2xl font-semibold text-primary">
                  关联阅读
                </h3>
              </div>
              <Link href="/news" className="text-sm font-semibold text-secondary hover:text-primary">
                返回列表
              </Link>
            </div>
            <div className="mt-5 space-y-4">
              {related.map((relatedItem) => (
                <Link
                  key={relatedItem.id}
                  href={`/news/${relatedItem.id}`}
                  className="panel-muted block rounded-[1.5rem] px-4 py-4 hover:-translate-y-0.5"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                    <span className="rounded-full bg-white px-3 py-1">{relatedItem.source}</span>
                    {relatedItem.sentiment === "IMPORTANT" ? (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-800">
                        重点
                      </span>
                    ) : null}
                    <span>{formatDateTime(relatedItem.publishTime)}</span>
                  </div>
                  <p className="headline mt-3 text-lg font-semibold text-primary">
                    {relatedItem.title}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function TrackCard({
  icon,
  title,
  body,
  href,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  href: string;
  action: string;
}) {
  return (
    <article className="panel-muted rounded-[1.5rem] px-4 py-4">
      <div className="flex items-center gap-2 text-secondary">
        {icon}
        <p className="headline text-lg font-semibold text-primary">{title}</p>
      </div>
      <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
      <Link
        href={href}
        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:text-primary"
      >
        {action}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}

function DetailMeta({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-3 last:border-b-0 last:pb-0">
      <span className="font-semibold text-slate-500">{label}</span>
      <span className="text-right text-slate-700">{value}</span>
    </div>
  );
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
