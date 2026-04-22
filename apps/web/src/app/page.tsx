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
  LayoutDashboard,
  Newspaper,
  Radar,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { FUTURE_MODULES } from "@odin-pulse/shared";

import { AuthStatus } from "@/components/auth-status";
import { fetchNews, fetchNewsStats } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [preview, stats] = await Promise.all([
    fetchNews({ page: 1, pageSize: 5 }),
    fetchNewsStats(),
  ]);

  const leadStory = preview.items[0];
  const secondaryStories = preview.items.slice(1, 4);

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-accent-soft selection:text-accent">
      {/* 🟢 Top Navigation Bar - Clean & Floating */}
      <div className="sticky top-6 z-50 px-4 md:px-0 mx-auto w-full max-w-5xl">
        <nav className="panel flex items-center justify-between rounded-full px-6 py-3 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
              <Radar className="h-6 w-6" />
            </div>
            <span className="headline text-xl font-bold tracking-tight text-primary">
              Odin Pulse
            </span>
          </div>
          
          <div className="hidden items-center gap-8 md:flex">
            <Link href="#modules" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">业务模块</Link>
            <Link href="/news" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">新闻中心</Link>
            <Link href="#infrastructure" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">基础设施</Link>
          </div>

          <div className="flex items-center gap-4">
            <AuthStatus />
          </div>
        </nav>
      </div>

      {/* 🔵 Hero Section - Focused & Premium */}
      <section className="relative overflow-hidden pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="hero-orb hero-orb-left opacity-30" />
        <div className="hero-orb hero-orb-right opacity-20" />
        
        <div className="shell px-4 text-center md:px-6">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-accent-soft bg-accent-soft/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-accent">
            <Sparkles className="h-3.5 w-3.5" />
            One-Stop Business Portal
          </div>
          
          <h1 className="headline mx-auto mt-8 max-w-4xl text-5xl font-extrabold leading-[1.15] text-primary md:text-7xl lg:text-8xl">
            资讯聚合只是开始，<br />
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              业务决策由此律动。
            </span>
          </h1>
          
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl">
            Odin Pulse 是面向未来的可扩展业务门户。一期深度整合多源实时资讯流，
            复用高性能数据基建，为您提供精准、敏捷的决策信号。
          </p>
          
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/news"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-bold text-white shadow-2xl shadow-primary/25 transition-all hover:-translate-y-1 hover:bg-slate-800"
            >
              进入新闻中心
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="#modules"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/50 px-8 py-4 text-lg font-bold text-slate-700 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-accent hover:text-accent"
            >
              查看后续模块
            </Link>
          </div>

          {/* Live Status Bar */}
          <div className="mx-auto mt-20 max-w-5xl">
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-slate-200 bg-slate-200 shadow-sm md:grid-cols-4">
              <LiveMetric
                label="已索引新闻"
                value={stats.total.toLocaleString()}
                icon={<Newspaper className="h-4 w-4" />}
              />
              <LiveMetric
                label="重点资讯"
                value={stats.importantCount.toLocaleString()}
                icon={<TrendingUp className="h-4 w-4" />}
              />
              <LiveMetric
                label="覆盖来源"
                value={stats.sources.toLocaleString()}
                icon={<ShieldCheck className="h-4 w-4" />}
              />
              <LiveMetric
                label="最新同步"
                value={stats.latestPublishTime ? formatTime(stats.latestPublishTime) : "暂无"}
                icon={<Activity className="h-4 w-4" />}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 🟠 Pulse Center - Featured News & Signal */}
      <section className="shell py-20 px-4 md:px-6">
        <div className="flex flex-col gap-12 lg:flex-row">
          <div className="flex-1">
            <div className="mb-8">
              <span className="eyebrow">Real-time Pulse</span>
              <h2 className="headline mt-3 text-4xl font-bold text-primary">当前市场脉动</h2>
            </div>

            {leadStory ? (
              <Link href={`/news/${leadStory.id}`} className="group block">
                <article className="panel-strong relative overflow-hidden rounded-[2.5rem] p-8 md:p-12">
                  <div className="absolute top-0 right-0 p-8 text-slate-100 opacity-50 transition-opacity group-hover:opacity-100">
                    <Radar className="h-24 w-24" />
                  </div>
                  
                  <div className="relative">
                    <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-secondary">
                      <span className="rounded-full bg-secondary/10 px-3 py-1">{leadStory.source}</span>
                      <span>{formatDateTime(leadStory.publishTime)}</span>
                    </div>
                    
                    <h3 className="headline mt-6 text-3xl font-extrabold leading-tight text-primary transition-colors group-hover:text-secondary md:text-4xl">
                      {leadStory.title}
                    </h3>
                    
                    <p className="mt-6 line-clamp-4 text-lg leading-relaxed text-slate-600">
                      {leadStory.content}
                    </p>
                    
                    <div className="mt-8 inline-flex items-center gap-2 text-base font-bold text-primary">
                      阅读全文
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </article>
              </Link>
            ) : (
              <div className="panel-muted flex h-64 items-center justify-center rounded-[2.5rem]">
                <p className="text-slate-500">暂无实时主线新闻</p>
              </div>
            )}
          </div>

          <aside className="w-full lg:w-[380px]">
            <div className="mb-8">
              <span className="eyebrow">Recent Signals</span>
              <h2 className="headline mt-3 text-4xl font-bold text-primary">信号带</h2>
            </div>

            <div className="space-y-4">
              {secondaryStories.map((item) => (
                <Link
                  key={item.id}
                  href={`/news/${item.id}`}
                  className="group block rounded-3xl border border-transparent bg-white/40 p-5 backdrop-blur-sm transition-all hover:border-slate-200 hover:bg-white hover:shadow-xl"
                >
                  <div className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <div className="h-1 w-1 rounded-full bg-slate-300" />
                      {item.source}
                    </span>
                    <span>{formatDateTime(item.publishTime)}</span>
                  </div>
                  <h4 className="headline mt-3 text-lg font-bold leading-snug text-primary group-hover:text-secondary">
                    {item.title}
                  </h4>
                  {item.sentiment === "IMPORTANT" && (
                    <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-600 border border-amber-100 uppercase">
                      Significant
                    </div>
                  )}
                </Link>
              ))}
              
              <Link 
                href="/news" 
                className="flex items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-slate-200 py-6 text-sm font-bold text-slate-500 transition-colors hover:border-primary hover:text-primary"
              >
                查看完整流
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* 🟣 Future Modules - Clean & Structured */}
      <section id="modules" className="bg-primary py-24 text-white">
        <div className="shell px-4 md:px-6">
          <div className="mb-16 text-center">
            <span className="eyebrow !text-accent-soft">Scalable Architecture</span>
            <h2 className="headline mt-4 text-4xl font-extrabold md:text-5xl">多业务入口已就绪</h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
              采用统一的信息架构，支持模块化平滑接入，为您构建一个持续生长的业务门户。
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {FUTURE_MODULES.map((module) => (
              <div key={module.key} className="group relative overflow-hidden rounded-[2rem] bg-white/5 p-8 transition-all hover:bg-white/10 hover:shadow-2xl">
                <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-accent/10 blur-2xl group-hover:bg-accent/20" />
                
                <div className="relative">
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                    {module.key === 'markets' && <ChartNoAxesCombined className="h-6 w-6" />}
                    {module.key === 'research' && <BookOpenText className="h-6 w-6" />}
                    {module.key === 'alerts' && <BellRing className="h-6 w-6" />}
                    {module.key === 'knowledge' && <LayoutDashboard className="h-6 w-6" />}
                  </div>
                  
                  <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold uppercase text-white/50">
                    {module.status}
                  </div>
                  
                  <h3 className="headline text-2xl font-bold">{module.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-slate-400">
                    {module.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🟡 Infrastructure - Technical Credibility */}
      <section id="infrastructure" className="shell py-24 px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="eyebrow">Enterprise Core</span>
            <h2 className="headline mt-4 text-4xl font-extrabold text-primary md:text-5xl">
              工业级抓取与检索架构
            </h2>
            <p className="mt-8 text-lg leading-relaxed text-slate-600">
              复用 Odin 系统的成熟逻辑，整合 Fastify 高性能后端与 Elasticsearch 实时索引。
              每 120 秒自动执行多源抓取，确保您获取的每一条资讯都是新鲜的。
            </p>
            
            <div className="mt-10 space-y-6">
              <FeatureItem
                icon={<Clock3 className="h-5 w-5 text-accent" />}
                title="120s 自动同步"
                description="对齐生产级 FinanceNewsService 调度逻辑"
              />
              <FeatureItem
                icon={<DatabaseZap className="h-5 w-5 text-accent" />}
                iconBg="bg-accent-soft/20"
                title="同源基建复用"
                description="统一 PostgreSQL + Redis + ES 存储体系"
              />
            </div>
          </div>
          
          <div className="relative lg:pl-12">
            <div className="panel-strong relative z-10 rounded-[2.5rem] p-4 shadow-2xl">
              <div className="overflow-hidden rounded-2xl bg-slate-950 p-6 text-sm font-mono text-emerald-400">
                <div className="mb-2 text-slate-500">{"// Odin Pulse Sync Log"}</div>
                <div className="flex gap-4">
                  <span className="text-slate-600">[10:24:01]</span>
                  <span>Fetching wallstreet-cn...</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-slate-600">[10:24:03]</span>
                  <span className="text-blue-400">Indexed 12 new items to ES.</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-slate-600">[10:26:01]</span>
                  <span>Pulse check: OK. Memory: 142MB.</span>
                </div>
                <div className="mt-4 animate-pulse">_</div>
              </div>
            </div>
            {/* Background decoration */}
            <div className="absolute -top-10 -right-10 h-64 w-64 rounded-full bg-secondary/5 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-64 w-64 rounded-full bg-accent/5 blur-3xl" />
          </div>
        </div>
      </section>

      {/* 🟢 Footer - Professional & Simple */}
      <footer className="shell py-12 border-t border-slate-200">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <Radar className="h-5 w-5 text-primary" />
            <span className="headline font-bold text-primary">Odin Pulse</span>
          </div>
          
          <div className="flex gap-8 text-sm text-slate-500">
            <Link href="/news" className="hover:text-primary transition-colors">新闻流</Link>
            <Link href="/login" className="hover:text-primary transition-colors">认证入口</Link>
            <a href="https://codego.eu.org" className="hover:text-primary transition-colors">关于平台</a>
          </div>
          
          <p className="text-xs text-slate-400">
            © 2026 Odin Pulse. All signals reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}

function LiveMetric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="bg-white p-6 transition-colors hover:bg-slate-50 md:p-8">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
        <span className="text-secondary">{icon}</span>
        {label}
      </div>
      <div className="headline mt-3 text-3xl font-extrabold text-primary">{value}</div>
    </div>
  );
}

function FeatureItem({
  icon,
  iconBg = "bg-white shadow-sm",
  title,
  description,
}: {
  icon: ReactNode;
  iconBg?: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-5">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconBg}`}>
        {icon}
      </div>
      <div>
        <h4 className="headline text-lg font-bold text-primary">{title}</h4>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </div>
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
