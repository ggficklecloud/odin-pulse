"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Radar,
  Search,
} from "lucide-react";

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
import { Separator } from "@/components/ui/separator";
import { fetchNews } from "@/lib/api";
import { Suspense, useEffect, useState } from "react";
import { NewsListResponse } from "@odin-pulse/shared";
import { cn } from "@/lib/utils";

const quickFilters = [
  { label: "最新资讯", value: "all" },
  { label: "重点关注", value: "important" },
  { label: "快讯", value: "flash" },
  { label: "新闻", value: "news" },
] as const;

const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
};

export default function NewsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[70vh] items-center justify-center">
          <Radar className="h-8 w-8 animate-pulse text-muted-foreground/20" />
        </div>
      }
    >
      <NewsPageContent />
    </Suspense>
  );
}

function NewsPageContent() {
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

  return (
    <main className="container-slim pt-12 pb-24">
      {/* 🟢 Header */}
      <motion.div 
        className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <div className="flex items-center gap-3 mb-4">
             <div className="h-0.5 w-6 bg-accent" />
             <span className="text-[10px] font-black uppercase tracking-widest text-primary">Intelligence Flow</span>
          </div>
          <h1 className="headline-sharp text-4xl md:text-5xl font-black text-primary tracking-tighter">
            新闻聚合 <span className="italic font-serif text-accent">Center.</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <RefreshButton />
          <Button variant="outline" size="sm" className="rounded-full font-bold border-border/60 h-9">
            <Radar className="h-3.5 w-3.5 mr-2 text-emerald-500" />
            Live Sync
          </Button>
        </div>
      </motion.div>

      {/* 🔵 Search & Filter Bar (Ultra Slim) */}
      <motion.div 
        className="mb-12 sticky top-20 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-slim border-border/60 shadow-sm rounded-2xl p-2 flex flex-col md:flex-row items-center gap-2">
           <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="搜索关键词、公司或实体..." 
                className="border-none bg-transparent shadow-none h-11 pl-11 text-sm font-medium focus-visible:ring-0"
                defaultValue={keyword}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleFilter("keyword", (e.target as HTMLInputElement).value);
                }}
              />
           </div>
           <Separator orientation="vertical" className="h-6 hidden md:block opacity-40" />
           <div className="flex items-center gap-2 w-full md:w-auto p-1 md:p-0">
              <Select value={category || "none"} onValueChange={(v: string | null) => handleFilter("category", v ?? "none")}>
                <SelectTrigger className="border-none shadow-none bg-transparent h-11 px-4 font-bold text-[13px] hover:bg-secondary rounded-xl transition-colors">
                  <SelectValue placeholder="所有类别" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/60">
                   <SelectItem value="none">所有类别</SelectItem>
                   {data?.categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={source || "none"} onValueChange={(v: string | null) => handleFilter("source", v ?? "none")}>
                <SelectTrigger className="border-none shadow-none bg-transparent h-11 px-4 font-bold text-[13px] hover:bg-secondary rounded-xl transition-colors">
                  <SelectValue placeholder="所有来源" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/60">
                   <SelectItem value="none">所有来源</SelectItem>
                   {data?.sources.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button size="sm" className="rounded-xl px-6 h-11 font-black uppercase tracking-widest text-[10px] hidden md:flex">
                检索
              </Button>
           </div>
        </Card>
        
        {/* Quick Filter Tags */}
        <div className="flex items-center gap-2 mt-4 px-2">
           <Filter className="h-3 w-3 text-muted-foreground mr-2" />
           {quickFilters.map(f => (
             <button
               key={f.value}
               onClick={() => {
                  if (f.value === "important") handleFilter("sentiment", "IMPORTANT");
                  else if (f.value === "flash") handleFilter("category", "快讯");
                  else if (f.value === "news") handleFilter("category", "新闻");
                  else router.push("/news");
               }}
               className={cn(
                 "text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full border transition-all",
                 (f.value === "important" && sentiment === "IMPORTANT") ||
                 (f.value === "flash" && category === "快讯") ||
                 (f.value === "news" && category === "新闻") ||
                 (f.value === "all" && !sentiment && !category)
                  ? "bg-primary text-white border-primary"
                  : "bg-secondary/50 text-muted-foreground border-transparent hover:border-border"
               )}
             >
               {f.label}
             </button>
           ))}
        </div>
      </motion.div>

      {/* 🟠 Content Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
           <AnimatePresence mode="wait">
             {loading ? (
               <motion.div key="loading" className="space-y-4">
                  {[1,2,3,4,5].map(i => <div key={i} className="h-32 bg-secondary/30 animate-pulse rounded-2xl" />)}
               </motion.div>
             ) : (
               <motion.div 
                 key="content" 
                 className="space-y-4"
                 initial="initial"
                 animate="animate"
               >
                 {data?.items.map((item, idx) => (
                   <motion.article 
                     key={item.id} 
                     variants={fadeInUp}
                     transition={{ delay: idx * 0.02 }}
                   >
                     <Link href={`/news/${item.id}`} className="group block">
                       <Card className="bento-card p-6 rounded-2xl flex flex-col md:flex-row gap-6">
                          <div className="flex-1">
                             <div className="flex items-center gap-4 mb-3">
                                <span className="mono-tag">{item.source}</span>
                                <span className="text-[11px] font-bold text-muted-foreground">{formatDateTime(item.publishTime)}</span>
                                {item.sentiment === "IMPORTANT" && (
                                   <Badge className="bg-accent/10 text-accent border-none text-[9px] font-black uppercase tracking-widest px-2 py-0">Signal</Badge>
                                )}
                             </div>
                             <h2 className="headline-sharp text-xl font-black text-primary mb-3 group-hover:text-accent transition-colors leading-snug">
                               {item.title}
                             </h2>
                             <p className="text-sm text-muted-foreground font-medium line-clamp-2 leading-relaxed opacity-80">
                               {item.content.replace(/<[^>]*>/g, '')}
                             </p>
                          </div>
                          <div className="hidden md:flex flex-col justify-between items-end shrink-0">
                             <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronRight className="h-4 w-4 text-primary" />
                             </div>
                             <span className="text-[10px] font-black text-muted-foreground/30">ID: {item.id.slice(0,6)}</span>
                          </div>
                       </Card>
                     </Link>
                   </motion.article>
                 ))}
               </motion.div>
             )}
           </AnimatePresence>

           {/* Pagination */}
           {!loading && totalPages > 1 && (
             <div className="mt-12 flex items-center justify-between border-t border-border/40 pt-8">
                <Button 
                  variant="ghost" 
                  disabled={currentPage <= 1}
                  onClick={() => handleFilter("page", String(currentPage - 1))}
                  className="font-black text-[11px] uppercase tracking-[0.2em]"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Prev
                </Button>
                <span className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em]">
                  {currentPage} / {totalPages}
                </span>
                <Button 
                  variant="ghost" 
                  disabled={currentPage >= totalPages}
                  onClick={() => handleFilter("page", String(currentPage + 1))}
                  className="font-black text-[11px] uppercase tracking-[0.2em]"
                >
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
             </div>
           )}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-12">
           <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6">Trending Sources</h3>
              <div className="flex flex-wrap gap-2">
                 {data?.sources.slice(0, 10).map(s => (
                   <button 
                    key={s} 
                    onClick={() => handleFilter("source", s)}
                    className="px-3 py-1.5 rounded-lg border border-border/60 text-[11px] font-bold text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                   >
                     {s}
                   </button>
                 ))}
              </div>
           </div>

           <Card className="p-8 bg-primary text-white rounded-[2rem] border-none relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                 <Radar className="h-24 w-24" />
              </div>
              <Badge variant="outline" className="border-white/20 text-white/60 font-black text-[9px] uppercase tracking-widest mb-6">Upcoming</Badge>
              <h4 className="headline-sharp text-2xl font-black mb-4">投研中心</h4>
              <p className="text-sm text-white/50 font-medium leading-relaxed mb-8">
                正在接入量化机构的深度研报与 AI 驱动的波动率预测。
              </p>
              <Button className="w-full bg-white text-primary hover:bg-slate-100 font-black text-[10px] uppercase tracking-widest rounded-xl">
                 敬请期待
              </Button>
           </Card>
        </aside>
      </div>
    </main>
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
