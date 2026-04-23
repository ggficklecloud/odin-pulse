"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BellRing,
  Clock3,
  Newspaper,
  Radar,
  ScanSearch,
  Share2,
  Bookmark,
  ChevronRight,
} from "lucide-react";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { AuthStatus } from "@/components/auth-status";
import { fetchNewsDetail } from "@/lib/api";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type NewsDetail = {
  item: {
    id: string;
    title: string;
    content: string;
    source: string;
    sourceUrl: string | null;
    publishTime: string;
    category?: string;
    sentiment?: string;
  };
  related: Array<{
    id: string;
    title: string;
    source: string;
    publishTime: string;
    sentiment?: string;
  }>;
  refreshedAt: string;
};

const fadeInUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

export default function NewsDetailPage() {
  const { id } = useParams() as { id: string };
  const [detail, setDetail] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDetail() {
      try {
        const data = await fetchNewsDetail(id);
        // @ts-expect-error detail structure mismatch
        setDetail(data);
      } catch {
        // Error handling
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [id]);

  if (loading) {
    return (
      <main className="shell flex min-h-[70vh] items-center justify-center px-4 py-12 md:px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 text-slate-400"
        >
          <div className="relative">
            <Radar className="h-10 w-10 animate-pulse text-secondary" />
            <div className="absolute inset-0 h-10 w-10 animate-ping rounded-full bg-secondary/20" />
          </div>
          <span className="text-sm font-medium tracking-widest uppercase">Initializing Intelligence...</span>
        </motion.div>
      </main>
    );
  }

  if (!detail) {
    notFound();
  }

  const { item, related, refreshedAt } = detail;
  const keywordHref = `/news?keyword=${encodeURIComponent(item.title.slice(0, 20))}`;
  const sourceHref = `/news?source=${encodeURIComponent(item.source)}`;
  
  return (
    <motion.main 
      className="shell px-4 py-6 md:py-12 md:px-6"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      {/* Top Navigation & Status */}
      <motion.div 
        variants={fadeInUp}
        className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex flex-wrap items-center gap-3">
          <Link 
            href="/news" 
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "rounded-full bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all h-10 px-5 flex items-center gap-2"
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden xs:inline">返回新闻流</span>
          </Link>
          <Badge variant="secondary" className="bg-secondary/5 text-secondary border-secondary/10 px-4 py-1.5 h-10 rounded-full font-medium">
            <Clock3 className="h-3.5 w-3.5 mr-2 opacity-70" />
            最近同步 {refreshedAt ? formatDateTime(refreshedAt) : "暂无"}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <AuthStatus />
        </div>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          {/* Article Header Card */}
          <motion.article 
            variants={fadeInUp}
            className="relative overflow-hidden rounded-[2.5rem] bg-primary p-8 md:p-14 text-white shadow-2xl shadow-primary/20"
          >
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
            
            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-wider text-white/60">
                <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-white backdrop-blur-md">
                  <Newspaper className="h-3 w-3" />
                  {item.source}
                </span>
                {item.category && (
                  <span className="rounded-full bg-accent/20 px-3 py-1 text-accent border border-accent/20">
                    {item.category}
                  </span>
                )}
                <span className="hidden xs:inline opacity-40">•</span>
                <span className="hidden xs:inline">{formatDateTime(item.publishTime)}</span>
              </div>

              <h1 className="headline mt-8 text-4xl font-black leading-[1.15] text-white md:text-5xl lg:text-6xl tracking-tight">
                {item.title}
              </h1>

              <div className="mt-12 flex flex-wrap gap-3">
                {item.sourceUrl && (
                  <a 
                    href={item.sourceUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className={cn(
                      buttonVariants({ variant: "default" }),
                      "rounded-full bg-white text-primary hover:bg-slate-100 shadow-xl px-6 h-12 font-bold group flex items-center"
                    )}
                  >
                    查看原文
                    <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                )}
                <Link 
                  href={sourceHref}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/40 backdrop-blur-sm px-6 h-12 font-bold flex items-center"
                  )}
                >
                  同源追踪
                </Link>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10 h-12 w-12 shadow-none">
                    <Share2 className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10 h-12 w-12 shadow-none">
                    <Bookmark className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.article>

          {/* Article Body */}
          <motion.section variants={fadeInUp}>
            <Card className="panel-strong border-none rounded-[2.5rem] p-8 md:p-14 overflow-hidden shadow-none">
              <div className="relative">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-1 bg-accent rounded-full" />
                    <h2 className="headline text-2xl font-black text-primary uppercase tracking-tight">
                      Intelligence Report
                    </h2>
                  </div>
                  <div className="hidden sm:block">
                     <Badge variant="outline" className="border-slate-200 text-slate-400 font-bold px-4 py-1.5 rounded-full shadow-none">
                       Published: {formatDateTime(item.publishTime)}
                     </Badge>
                  </div>
                </div>

                <div
                  className="article-content prose prose-slate max-w-none 
                    text-lg md:text-xl leading-[1.8] text-slate-700 
                    [&>p]:mb-8 [&>p:last-child]:mb-0
                    [&>h2]:text-3xl [&>h2]:font-black [&>h2]:text-primary [&>h2]:mt-12 [&>h2]:mb-6
                    [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-8
                    first-letter:text-5xl first-letter:font-black first-letter:text-primary first-letter:mr-3 first-letter:float-left first-letter:leading-[1]"
                  dangerouslySetInnerHTML={{ __html: item.content }}
                />

                <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                     <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Metadata</span>
                     <Badge variant="outline" className="rounded-full border-slate-200 text-slate-600 bg-slate-50 font-bold shadow-none">
                       {item.source}
                     </Badge>
                     {item.category && (
                       <Badge variant="outline" className="rounded-full border-slate-200 text-slate-600 bg-slate-50 font-bold shadow-none">
                         {item.category}
                       </Badge>
                     )}
                  </div>
                  <Link 
                    href={keywordHref} 
                    className="text-sm font-black text-secondary hover:text-primary transition-colors flex items-center gap-2 group no-underline"
                  >
                    继续回查这条主线
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </Card>
          </motion.section>
        </div>

        {/* Sidebar / Contextual Data */}
        <aside className="lg:col-span-4 space-y-8">
          <motion.div variants={fadeInUp}>
            <Card className="panel border-none rounded-[2.5rem] p-8 shadow-xl bg-white/70 backdrop-blur-xl border border-white/40 overflow-visible">
              <CardHeader className="p-0 mb-8">
                <p className="eyebrow flex items-center gap-2">
                  <Radar className="h-3 w-3" />
                  Contextual Matrix
                </p>
                <CardTitle className="headline mt-2 text-2xl font-black text-primary">深度追踪</CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-5">
                <TrackCard
                  icon={<Newspaper className="h-4 w-4" />}
                  title="来源维度"
                  body={`来自 ${item.source}，适合追查该机构的后续研报与实时动态。`}
                  href={sourceHref}
                  action="查看同源"
                />
                <TrackCard
                  icon={<ScanSearch className="h-4 w-4" />}
                  title="主线关联"
                  body="通过核心关键词回溯本条资讯的发展脉络与历史背景。"
                  href={keywordHref}
                  action="回查主线"
                />
                {item.sentiment === "IMPORTANT" && (
                  <div className="rounded-3xl bg-accent/10 border border-accent/20 p-6">
                    <div className="flex items-center gap-3 text-accent mb-2">
                      <BellRing className="h-5 w-5" />
                      <span className="font-black uppercase tracking-widest text-sm">Critical Alert</span>
                    </div>
                    <p className="text-sm text-accent/80 leading-relaxed font-medium">
                      此项资讯已被标记为重点。建议密切关注其对二级市场的潜在波动影响。
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card className="panel border-none rounded-[2.5rem] p-8 shadow-xl bg-white/70 backdrop-blur-xl overflow-visible">
              <CardHeader className="p-0 mb-6 flex flex-row items-center justify-between">
                <div>
                  <p className="eyebrow">Related News</p>
                  <CardTitle className="headline mt-2 text-2xl font-black text-primary">关联阅读</CardTitle>
                </div>
              </CardHeader>
              
              {/* Desktop Grid / Mobile Horizontal Scroll */}
              <CardContent className="p-0">
                <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide -mx-2 px-2 snap-x sm:flex-col sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0">
                  {related.map((relatedItem) => (
                    <Link
                      key={relatedItem.id}
                      href={`/news/${relatedItem.id}`}
                      className="group block min-w-[280px] sm:min-w-0 snap-start no-underline"
                    >
                      <div className="panel-muted rounded-3xl p-6 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:bg-white group-hover:shadow-xl border border-transparent group-hover:border-slate-100 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-3">
                           <span className="text-[10px] font-black uppercase tracking-widest text-secondary bg-secondary/10 px-2.5 py-1 rounded-full">
                             {relatedItem.source}
                           </span>
                           <span className="text-[10px] font-bold text-slate-400">
                             {formatDateTime(relatedItem.publishTime)}
                           </span>
                        </div>
                        <p className="headline text-lg font-black leading-snug text-primary group-hover:text-secondary transition-colors line-clamp-2">
                          {relatedItem.title}
                        </p>
                        <div className="mt-4 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronRight className="h-4 w-4 text-secondary" />
                        </div>
                      </div>
                    </Link>
                  ))}
                  {related.length === 0 && (
                    <div className="py-8 text-center text-slate-400">
                      <p className="text-sm font-medium">暂无关联资讯</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-0 mt-6 pt-6 border-t border-slate-100 flex justify-center">
                <Link href="/news" className="text-sm font-black text-slate-400 hover:text-primary transition-colors uppercase tracking-widest no-underline">
                  View All News
                </Link>
              </CardFooter>
            </Card>
          </motion.div>
        </aside>
      </div>
    </motion.main>
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
    <div className="panel-muted rounded-3xl p-6 border border-transparent transition-all duration-300 hover:bg-white hover:shadow-lg hover:border-slate-100 group">
      <div className="flex items-center gap-4 text-secondary mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary/10 group-hover:bg-secondary group-hover:text-white transition-colors">
          {icon}
        </div>
        <p className="headline text-xl font-black text-primary">{title}</p>
      </div>
      <p className="text-sm leading-relaxed text-slate-500 line-clamp-3 font-medium mb-5">{body}</p>
      <Link
        href={href}
        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-secondary transition-all hover:gap-3 group/link no-underline"
      >
        {action}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
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
