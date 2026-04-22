"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  DatabaseZap,
  Filter,
  Newspaper,
  Radar,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { AuthStatus } from "@/components/auth-status";
import { RefreshButton } from "@/components/refresh-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchNews } from "@/lib/api";
import { useEffect, useState, ReactNode } from "react";
import { NewsListResponse } from "@odin-pulse/shared";

const quickFilters = [
  { label: "全部资讯", value: "all" },
  { label: "重点关注", value: "important" },
  { label: "实时快讯", value: "flash" },
  { label: "深度新闻", value: "news" },
] as const;

export default function NewsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<NewsListResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const page = searchParams.get("page") ?? "1";
  const keyword = searchParams.get("keyword") ?? "";
  const category = searchParams.get("category") ?? "";
  const source = searchParams.get("source") ?? "";
  const sentiment = searchParams.get("sentiment") ?? "";

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await fetchNews({
        page: Number(page),
        pageSize: 20,
        keyword,
        category,
        source,
        sentiment,
      });
      setData(res);
      setLoading(false);
    }
    loadData();
  }, [page, keyword, category, source, sentiment]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const currentPage = Number(page);

  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "none") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`/news?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/news");
  };

  if (!data && loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Radar className="h-12 w-12 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      {/* 🟢 Navigation & Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden pt-12 pb-10"
      >
        <div className="hero-orb hero-orb-left opacity-20" />
        <div className="shell px-4 md:px-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors">
              <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              返回首页门户
            </Link>
            <div className="flex items-center gap-4">
              <AuthStatus />
              <RefreshButton />
            </div>
          </div>

          <div className="mt-10">
            <Badge variant="outline" className="px-3 py-1 text-secondary border-secondary/20 bg-secondary/5 font-bold tracking-widest uppercase">
              News Aggregator
            </Badge>
            <h1 className="headline mt-4 text-4xl font-extrabold text-primary md:text-6xl">
              新闻聚合中心
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-600 leading-relaxed">
              通过高级组件与实时检索，为您在海量信息中过滤出真正有价值的信号。
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard icon={<Newspaper className="h-4 w-4" />} label="已索引资讯" value={data?.total.toLocaleString() ?? "0"} />
            <StatCard icon={<DatabaseZap className="h-4 w-4" />} label="活跃数据源" value={data?.sources.length.toString() ?? "0"} />
            <StatCard icon={<CalendarClock className="h-4 w-4" />} label="当前页码" value={`${currentPage} / ${totalPages}`} />
            <StatCard icon={<Radar className="h-4 w-4" />} label="同步状态" value={data?.refreshedAt ? formatTime(data.refreshedAt) : "在线"} />
          </div>
        </div>
      </motion.div>

      {/* 🔵 Filter & Search Bar - Shadcn UI Integration */}
      <section className="shell px-4 md:px-6 mb-10">
        <Card className="rounded-[2.5rem] p-6 shadow-xl border-slate-200/60 overflow-visible">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {quickFilters.map((filter) => (
                <Button
                  key={filter.value}
                  variant="outline"
                  size="sm"
                  className="rounded-full font-bold transition-all hover:-translate-y-0.5"
                  onClick={() => {
                    if (filter.value === "important") handleFilter("sentiment", "IMPORTANT");
                    else if (filter.value === "flash") handleFilter("category", "快讯");
                    else if (filter.value === "news") handleFilter("category", "新闻");
                    else clearFilters();
                  }}
                >
                  {filter.label}
                </Button>
              ))}
            </div>

            <AnimatePresence>
              {(keyword || category || source || sentiment) && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-wrap items-center gap-2"
                >
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs font-bold text-slate-400 hover:text-red-500">
                    <X className="h-3 w-3 mr-1" /> 清空筛选
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-8 fade-divider" />

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2 lg:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-4">关键词搜索</label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input
                  defaultValue={keyword}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleFilter("keyword", (e.target as HTMLInputElement).value);
                  }}
                  placeholder="搜索标题、内容或实体..."
                  className="pl-11 rounded-2xl h-12 border-slate-200 bg-slate-50/50 focus:bg-white transition-all shadow-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-4">分类筛选</label>
              <Select value={category || "none"} onValueChange={(v) => handleFilter("category", v)}>
                <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all shadow-none">
                  <SelectValue placeholder="全部类别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">全部类别</SelectItem>
                  {data?.categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-4">数据来源</label>
              <Select value={source || "none"} onValueChange={(v) => handleFilter("source", v)}>
                <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all shadow-none">
                  <SelectValue placeholder="全部来源" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">全部来源</SelectItem>
                  {data?.sources.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                className="w-full h-12 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-1"
              >
                立即检索
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* 🟠 Content Area with Motion */}
      <section className="shell px-4 md:px-6">
        <div className="flex flex-col gap-10 lg:flex-row">
          <div className="flex-1 space-y-6">
            <AnimatePresence mode="popLayout">
              {loading ? (
                <div key="loading" className="space-y-6">
                   {[1,2,3].map(i => <div key={i} className="h-48 rounded-[2rem] bg-slate-100 animate-pulse" />)}
                </div>
              ) : (
                <div className="space-y-6">
                  {data?.items.map((item, index) => (
                    <motion.article 
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`group relative overflow-hidden rounded-[2rem] border transition-all hover:shadow-2xl hover:-translate-y-1 ${
                        index === 0 && currentPage === 1 
                          ? "panel-strong border-slate-200/60 p-8 md:p-10" 
                          : "bg-white border-transparent p-6 md:p-8 hover:border-slate-200"
                      }`}
                    >
                      {item.sentiment === "IMPORTANT" && (
                        <div className="absolute top-0 right-0">
                          <Badge className="rounded-none rounded-bl-2xl px-4 py-1.5 bg-accent text-white border-none font-bold uppercase tracking-widest">
                            Significant
                          </Badge>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <span className="flex items-center gap-1.5 text-secondary">
                          <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                          {item.source}
                        </span>
                        {item.category && <Badge variant="secondary" className="text-[10px] font-bold">{item.category}</Badge>}
                        <span className="flex items-center gap-1.5">
                          <CalendarClock className="h-3.5 w-3.5" />
                          {formatDateTime(item.publishTime)}
                        </span>
                      </div>

                      <Link href={`/news/${item.id}`} className="block mt-5 group-hover:text-secondary transition-colors text-inherit no-underline">
                        <h2 className={`headline font-extrabold text-primary leading-tight ${
                          index === 0 && currentPage === 1 ? "text-3xl md:text-4xl" : "text-2xl"
                        }`}>
                          {item.title}
                        </h2>
                      </Link>

                      <p className={`mt-5 text-slate-600 leading-relaxed line-clamp-3 ${
                        index === 0 && currentPage === 1 ? "text-base" : "text-sm"
                      }`} dangerouslySetInnerHTML={{ __html: item.content }} />

                      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Button asChild size="sm" className="rounded-full font-bold shadow-md transition-all hover:bg-slate-800">
                            <Link href={`/news/${item.id}`}>
                              详情分析 <ArrowRight className="h-3.5 w-3.5 ml-1" />
                            </Link>
                          </Button>
                          <Button asChild variant="outline" size="sm" className="rounded-full font-bold">
                            <Link href={`/news?keyword=${encodeURIComponent(item.title.slice(0, 20))}`}>
                              全网关联
                            </Link>
                          </Button>
                        </div>

                        {item.sourceUrl && (
                          <a
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-secondary transition-colors no-underline"
                          >
                            查看原文
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </motion.article>
                  ))}
                </div>
              )}
            </AnimatePresence>

            {/* Pagination Control */}
            {!loading && (
              <nav className="flex items-center justify-between rounded-[2rem] border border-slate-200/60 bg-white/60 backdrop-blur-md p-4 shadow-sm">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={currentPage <= 1}
                  className="h-12 w-12 rounded-2xl transition-all"
                  onClick={() => handleFilter("page", String(currentPage - 1))}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-primary">第 {currentPage} 页</span>
                  <div className="h-1 w-1 rounded-full bg-slate-300" />
                  <span className="text-sm font-bold text-slate-400">共 {totalPages} 页</span>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  disabled={currentPage >= totalPages}
                  className="h-12 w-12 rounded-2xl transition-all"
                  onClick={() => handleFilter("page", String(currentPage + 1))}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </nav>
            )}
          </div>

          {/* Right Sidebar */}
          <aside className="w-full lg:w-[320px]">
             <div className="sticky top-28 space-y-6">
              <Card className="rounded-[2rem] p-6 border-slate-200/60">
                <div className="flex items-center gap-2 mb-6">
                  <Radar className="h-5 w-5 text-secondary" />
                  <h3 className="headline font-bold text-primary">情报看板</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">阅读重点</p>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      当前视图展示了最新的市场动态。建议关注标记为 <Badge variant="secondary" className="bg-accent/10 text-accent border-none">Significant</Badge> 的资讯。
                    </p>
                  </div>
                  
                  <div className="fade-divider" />
                  
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">热门来源</p>
                    <div className="flex flex-wrap gap-2">
                      {data?.sources.slice(0, 5).map(s => (
                        <Badge key={s} variant="outline" className="text-[10px] font-bold bg-slate-50/50">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-primary to-secondary rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 transition-transform group-hover:scale-110">
                  <Radar className="h-20 w-20" />
                </div>
                <h4 className="headline text-xl font-bold relative z-10">需要更深度的研报？</h4>
                <p className="mt-4 text-xs text-white/70 leading-relaxed relative z-10">
                  “投研中心”模块正在规划中，后续将接入更多专业机构的深度分析。
                </p>
                <Button variant="secondary" size="sm" className="mt-6 rounded-full font-bold bg-white/10 text-white border-white/20 hover:bg-white/20">
                  敬请期待
                </Button>
              </motion.div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function StatCard({ icon, label, value }: { icon: ReactNode, label: string, value: string }) {
  return (
    <Card className="bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-3xl p-5 transition-all hover:bg-white hover:shadow-lg">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        <span className="text-secondary">{icon}</span>
        {label}
      </div>
      <p className="headline mt-3 text-2xl font-extrabold text-primary">{value}</p>
    </Card>
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
