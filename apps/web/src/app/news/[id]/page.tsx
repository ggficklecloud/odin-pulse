"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Clock,
  Radar,
  Share2,
  Bookmark,
} from "lucide-react";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { fetchNewsDetail } from "@/lib/api";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

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
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
};

export default function NewsDetailPage() {
  const { id } = useParams() as { id: string };
  const [detail, setDetail] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDetail() {
      try {
        const data = await fetchNewsDetail(id);
        // @ts-expect-error detail mismatch
        setDetail(data);
      } catch {
        // Handle error
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Radar className="h-8 w-8 animate-pulse text-muted-foreground/20" />
      </div>
    );
  }

  if (!detail) notFound();

  const { item, related } = detail;

  return (
    <main className="container-slim pt-12 pb-24">
      {/* 🟢 Back Navigation */}
      <motion.div 
        className="mb-12"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Link 
          href="/news" 
          className="group inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
          Back to Feed
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* 🔵 Main Article */}
        <div className="lg:col-span-8">
          <motion.article 
            initial="initial"
            animate="animate"
            variants={{
              animate: { transition: { staggerChildren: 0.1 } }
            }}
          >
            <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-8">
               <span className="mono-tag">{item.source}</span>
               <Separator orientation="vertical" className="h-4" />
               <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDateTime(item.publishTime)}
               </span>
               {item.sentiment === "IMPORTANT" && (
                  <Badge className="bg-accent text-white border-none font-black text-[9px] uppercase tracking-widest px-2 py-0.5 ml-auto">Important</Badge>
               )}
            </motion.div>

            <motion.h1 
              variants={fadeInUp}
              className="headline-sharp text-4xl md:text-6xl font-black text-primary mb-12 tracking-tighter leading-[1.1]"
            >
              {item.title}
            </motion.h1>

            <motion.div 
              variants={fadeInUp}
              className="flex flex-wrap items-center gap-3 mb-16"
            >
               {item.sourceUrl && (
                  <Link 
                    href={item.sourceUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className={cn(buttonVariants({ size: "sm" }), "rounded-full h-10 px-6 font-black uppercase tracking-widest text-[10px] flex items-center")}
                  >
                    View Original <ArrowUpRight className="ml-2 h-3.5 w-3.5" />
                  </Link>
               )}
               <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-border/60">
                  <Share2 className="h-4 w-4" />
               </Button>
               <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-border/60">
                  <Bookmark className="h-4 w-4" />
               </Button>
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              className="prose prose-slate max-w-none 
                text-lg md:text-xl leading-[1.8] text-slate-700 font-medium
                first-letter:text-5xl first-letter:font-black first-letter:text-primary first-letter:mr-3 first-letter:float-left first-letter:leading-[1]"
              dangerouslySetInnerHTML={{ __html: item.content }}
            />
            
            <Separator className="my-20 bg-border/40" />
            
            <motion.div variants={fadeInUp} className="flex justify-center">
               <Link 
                href={`/news?keyword=${encodeURIComponent(item.title.slice(0, 10))}`}
                className={cn(buttonVariants({ variant: "secondary" }), "rounded-full px-12 h-12 font-black uppercase tracking-widest text-[11px] shadow-none")}
               >
                 Continue investigating this topic
               </Link>
            </motion.div>
          </motion.article>
        </div>

        {/* 🟠 Sidebar */}
        <aside className="lg:col-span-4 space-y-16">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-8">Related Signals</h3>
            <div className="space-y-4">
              {related.map(r => (
                <Link key={r.id} href={`/news/${r.id}`} className="group block">
                  <Card className="bento-card p-5 rounded-xl border-border/40 bg-white group-hover:bg-slate-50">
                    <div className="flex items-center gap-3 mb-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                       <span>{r.source}</span>
                       <span>•</span>
                       <span>{formatDateTime(r.publishTime)}</span>
                    </div>
                    <p className="headline-sharp text-[15px] font-black leading-snug group-hover:text-accent transition-colors line-clamp-2">
                       {r.title}
                    </p>
                  </Card>
                </Link>
              ))}
              {related.length === 0 && (
                <p className="text-xs font-bold text-muted-foreground opacity-40 uppercase tracking-widest italic">No related signals found.</p>
              )}
            </div>
          </div>

          <Card className="p-8 bg-slate-50 border-border/40 rounded-[2rem] shadow-none">
             <Radar className="h-8 w-8 text-primary/10 mb-6" />
             <h4 className="headline-sharp text-xl font-black mb-4 uppercase tracking-tighter">Odin Signal Matrix</h4>
             <p className="text-xs text-muted-foreground font-medium leading-relaxed">
               This intelligence report is processed through our high-availability indexing core. 
               All entities mentioned are cross-referenced for quantitative analysis.
             </p>
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
