import Link from "next/link";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  BellRing,
  BookOpenText,
  ChartNoAxesCombined,
  Clock3,
  DatabaseZap,
  Newspaper,
  Radar,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { FUTURE_MODULES } from "@odin-pulse/shared";

import { fetchNews, fetchNewsStats } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [preview, stats] = await Promise.all([
    fetchNews({ page: 1, pageSize: 7 }),
    fetchNewsStats(),
  ]);

  const leadStory = preview.items[0];
  const signalStories = preview.items.slice(1, 5);
  const previewStories = preview.items.slice(1, 7);

  return (
    <main className="pb-16">
      <section className="noise signal-line overflow-hidden border-b border-slate-200/70">
        <div className="shell relative px-4 py-6 md:px-6 md:py-8">
          <div className="hero-orb hero-orb-left" />
          <div className="hero-orb hero-orb-right" />

          <header className="panel rounded-[2rem] px-5 py-4 md:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="eyebrow">Odin Pulse</p>
                <h1 className="headline mt-2 text-2xl font-semibold text-primary md:text-3xl">
                  可扩展业务门户的一期新闻聚合台
                </h1>
              </div>
              <div className="flex flex-col gap-3 lg:items-end">
                <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                  <Link
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 hover:-translate-y-0.5 hover:border-secondary hover:text-secondary"
                    href="#overview"
                  >
                    总览
                  </Link>
                  <Link
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 hover:-translate-y-0.5 hover:border-secondary hover:text-secondary"
                    href="/news"
                  >
                    新闻中心
                  </Link>
                  <Link
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 hover:-translate-y-0.5 hover:border-secondary hover:text-secondary"
                    href="#modules"
                  >
                    业务入口
                  </Link>
                </div>
                <div className="kicker-chip">
                  <Activity className="h-4 w-4 text-emerald-600" />
                  最近同步 {stats.latestPublishTime ? formatTime(stats.latestPublishTime) : "暂无"}
                </div>
              </div>
            </div>
          </header>

          <div
            id="overview"
            className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]"
          >
            <div className="panel-strong relative overflow-hidden rounded-[2rem] px-6 py-7 md:px-8 md:py-10">
              <div className="max-w-3xl">
                <p className="eyebrow">Phase 1</p>
                <h2 className="headline mt-4 text-4xl font-semibold leading-tight text-primary md:text-6xl">
                  先把资讯流跑通，
                  <span className="text-secondary">再逐步接入市场、投研与告警模块。</span>
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
                  一期聚焦新闻聚合浏览，复用你现有的 MySQL 与 Elasticsearch 体系，按两分钟节奏自动抓取并写入。
                  首页同时预留多业务入口，后续接新模块时不需要重做产品骨架。
                </p>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <span className="kicker-chip">
                  <DatabaseZap className="h-4 w-4 text-secondary" />
                  MySQL + Elasticsearch 复用
                </span>
                <span className="kicker-chip">
                  <Clock3 className="h-4 w-4 text-secondary" />
                  2 分钟调度抓取
                </span>
                <span className="kicker-chip">
                  <Radar className="h-4 w-4 text-secondary" />
                  统一门户式信息架构
                </span>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/news"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  进入新闻中心
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#modules"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:-translate-y-0.5 hover:border-accent hover:text-accent"
                >
                  查看业务入口
                </a>
              </div>

              <div className="mt-10 grid gap-4 md:grid-cols-2">
                <MetricCard
                  icon={<Newspaper className="h-4 w-4" />}
                  label="已索引新闻"
                  value={stats.total.toLocaleString()}
                />
                <MetricCard
                  icon={<BellRing className="h-4 w-4" />}
                  label="重点资讯"
                  value={stats.importantCount.toLocaleString()}
                />
                <MetricCard
                  icon={<ShieldCheck className="h-4 w-4" />}
                  label="覆盖来源"
                  value={stats.sources.toLocaleString()}
                />
                <MetricCard
                  icon={<Sparkles className="h-4 w-4" />}
                  label="最新发布"
                  value={stats.latestPublishTime ? formatTime(stats.latestPublishTime) : "暂无"}
                />
              </div>
            </div>

            <aside className="grid gap-6">
              {leadStory ? (
                <article className="story-gradient rounded-[2rem] px-6 py-6 md:px-7">
                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-white/70">
                    <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1">
                      实时主线
                    </span>
                    <span>{leadStory.source}</span>
                    <span>{formatDateTime(leadStory.publishTime)}</span>
                  </div>
                  <h3 className="headline mt-5 text-3xl font-semibold leading-tight text-white">
                    {leadStory.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-white/78">{leadStory.content}</p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href="/news"
                      className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary hover:-translate-y-0.5"
                    >
                      浏览新闻流
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    {leadStory.sourceUrl ? (
                      <a
                        href={leadStory.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-4 py-2 text-sm font-semibold text-white hover:-translate-y-0.5"
                      >
                        查看原文
                      </a>
                    ) : null}
                  </div>
                </article>
              ) : null}

              <div className="panel rounded-[2rem] px-6 py-6 md:px-7">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="eyebrow">Signal Desk</p>
                    <h3 className="headline mt-2 text-2xl font-semibold text-primary">
                      最新信号带
                    </h3>
                  </div>
                  <Link
                    href="/news?sentiment=IMPORTANT"
                    className="text-sm font-semibold text-secondary hover:text-primary"
                  >
                    看重点
                  </Link>
                </div>
                <div className="mt-5 space-y-4">
                  {signalStories.map((item) => (
                    <Link
                      key={item.id}
                      href={`/news/${item.id}`}
                      className="panel-muted block rounded-[1.5rem] px-4 py-4 hover:-translate-y-0.5"
                    >
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                        <span className="rounded-full bg-white px-3 py-1">{item.source}</span>
                        {item.sentiment === "IMPORTANT" ? (
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-800">
                            重点
                          </span>
                        ) : null}
                        <span>{formatDateTime(item.publishTime)}</span>
                      </div>
                      <p className="headline mt-3 text-lg font-semibold text-primary">
                        {item.title}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="shell mt-10 px-4 md:px-6">
        <SectionHeader
          eyebrow="Operating Model"
          title="一期先把抓取链路、检索能力和门户结构做扎实"
          description="这里不是做纯内容站，而是先建立一个能持续接业务模块的平台外壳。"
        />
        <div className="grid gap-5 md:grid-cols-3">
          <InfoCard
            icon={<Clock3 className="h-5 w-5" />}
            title="两分钟抓取节奏"
            description="对齐 Odin 里的 FinanceNewsService 调度逻辑，后端采用 fixed-delay 风格递归执行。"
          />
          <InfoCard
            icon={<DatabaseZap className="h-5 w-5" />}
            title="同源数据基础设施"
            description="复用本机 `hfcloud_dev.odin_finance_news` 和 ES `finance_news`，减少迁移和双写成本。"
          />
          <InfoCard
            icon={<ChartNoAxesCombined className="h-5 w-5" />}
            title="面向扩展的门户首页"
            description="首页从一开始就保留扩展区块，避免后面加模块时把新闻首页整体推倒重来。"
          />
        </div>
      </section>

      <section id="modules" className="shell mt-12 px-4 md:px-6">
        <SectionHeader
          eyebrow="Business Modules"
          title="后续业务入口已经留好位"
          description="先占位，后续模块接入时延续同一套信息结构和视觉语言。"
          action={
            <div className="hidden items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800 md:flex">
              <BookOpenText className="h-4 w-4" />
              按模块逐块接入
            </div>
          }
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {FUTURE_MODULES.map((module, index) => (
            <article key={module.key} className="panel-strong rounded-[1.75rem] px-5 py-5">
              <div className="flex items-center justify-between gap-3">
                <span className="headline text-4xl font-semibold text-slate-200">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                  {module.status}
                </span>
              </div>
              <p className="headline mt-4 text-xl font-semibold text-primary">{module.title}</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">{module.description}</p>
              <div className="fade-divider mt-5" />
              <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-secondary">
                保留入口
                <ArrowRight className="h-4 w-4" />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="shell mt-12 px-4 md:px-6">
        <SectionHeader
          eyebrow="News Pulse"
          title="新闻中心预览"
          description="首页不塞满所有内容，只给你一眼看懂最新动态和跳转入口。"
          action={
            <Link
              href="/news"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:-translate-y-0.5 hover:border-secondary hover:text-secondary"
            >
              查看全部
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(340px,0.78fr)]">
          {leadStory ? (
            <article className="panel-strong rounded-[2rem] px-6 py-6 md:px-7">
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
                <span className="rounded-full bg-slate-100 px-3 py-1">{leadStory.source}</span>
                {leadStory.category ? (
                  <span className="rounded-full bg-white px-3 py-1">{leadStory.category}</span>
                ) : null}
                <span>{formatDateTime(leadStory.publishTime)}</span>
              </div>
              <h3 className="headline mt-4 text-3xl font-semibold text-primary">
                {leadStory.title}
              </h3>
              <p className="mt-4 max-w-4xl text-sm leading-8 text-slate-600">
                {leadStory.content}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/news/${leadStory.id}`}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  查看详情
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={`/news?keyword=${encodeURIComponent(leadStory.title.slice(0, 20))}`}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:-translate-y-0.5 hover:border-secondary hover:text-secondary"
                >
                  主线回查
                </Link>
                {leadStory.sourceUrl ? (
                  <a
                    href={leadStory.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:-translate-y-0.5 hover:border-secondary hover:text-secondary"
                  >
                    查看原文
                  </a>
                ) : null}
              </div>
            </article>
          ) : null}

          <div className="grid gap-4">
            {previewStories.map((item) => (
              <article key={item.id} className="panel rounded-[1.5rem] px-5 py-5">
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
                  <span className="rounded-full bg-slate-100 px-3 py-1">{item.source}</span>
                  {item.sentiment === "IMPORTANT" ? (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-800">
                      重点
                    </span>
                  ) : null}
                  <span>{formatDateTime(item.publishTime)}</span>
                </div>
                <Link href={`/news/${item.id}`} className="block">
                  <h4 className="headline mt-3 text-xl font-semibold text-primary">
                    {item.title}
                  </h4>
                </Link>
                <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">
                  {item.content}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href={`/news/${item.id}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:text-primary"
                  >
                    进入详情
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        <p className="eyebrow">{eyebrow}</p>
        <h3 className="headline mt-2 text-3xl font-semibold text-primary">{title}</h3>
        <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">{description}</p>
      </div>
      {action ?? null}
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="metric-glow panel-muted relative rounded-[1.5rem] px-4 py-4">
      <div className="relative">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          <span className="rounded-full bg-white p-2 text-secondary">{icon}</span>
          {label}
        </div>
        <p className="headline mt-4 text-2xl font-semibold text-primary">{value}</p>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <article className="panel-strong rounded-[1.75rem] px-5 py-5">
      <div className="inline-flex rounded-full bg-slate-100 p-2 text-secondary">{icon}</div>
      <h3 className="headline mt-4 text-xl font-semibold text-primary">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
    </article>
  );
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(value: string) {
  return new Date(value).toLocaleString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
