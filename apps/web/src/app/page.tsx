import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ChevronRight,
  Database,
  Globe,
  Layers,
  Newspaper,
  TrendingUp,
} from "lucide-react";
import * as motion from "framer-motion/client";

import { fetchNews, fetchNewsStats } from "@/lib/api";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
};

export default async function HomePage() {
  const [preview, stats] = await Promise.all([
    fetchNews({ page: 1, pageSize: 4 }),
    fetchNewsStats(),
  ]);

  const leadStory = preview.items[0];
  const otherStories = preview.items.slice(1, 4);

  return (
    <main className="flex-1">
      {/* 🟢 Minimalist Hero */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 border-b border-border/40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-white to-white">
        <div className="container-slim text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="rounded-full px-4 py-1 text-[11px] font-black uppercase tracking-[0.2em] mb-8 bg-primary/5 text-primary border-none shadow-none">
              Intelligence OS v0.1
            </Badge>
          </motion.div>
          
          <motion.h1 
            className="headline-sharp text-5xl md:text-7xl lg:text-8xl font-black text-primary mb-8"
            initial="initial"
            animate="animate"
            variants={fadeInUp}
          >
            Decoding the <br />
            <span className="italic font-serif text-accent">Pulse of Business.</span>
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 font-medium leading-relaxed"
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            transition={{ delay: 0.1 }}
          >
            Odin Pulse 是为专业决策者打造的资讯聚合与业务中枢。
            通过实时检索与量化基建，将杂乱的噪音转化为清晰的信号。
          </motion.p>
          
          <motion.div 
            className="flex flex-wrap items-center justify-center gap-4"
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
          >
            <Link 
              href="/news"
              className={cn(buttonVariants({ size: "lg" }), "rounded-full px-8 h-12 font-bold shadow-none flex items-center")}
            >
              立即开始探索 <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
            <Link 
              href="#infra"
              className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "rounded-full px-8 h-12 font-bold flex items-center")}
            >
              查看技术架构
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 🔵 Bento Dashboard Grid */}
      <section className="py-24 bg-white">
        <div className="container-slim">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-[180px]">
            
            {/* Lead News Bento (Large) */}
            <motion.div 
              className="md:col-span-8 md:row-span-2 relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Link href={leadStory ? `/news/${leadStory.id}` : "/news"} className="block h-full group">
                <Card className="bento-card h-full p-8 md:p-12 flex flex-col border-none bg-primary text-white overflow-hidden">
                   <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Newspaper className="h-48 w-48 rotate-12" />
                   </div>
                   <div className="flex items-center gap-3 mb-6 relative z-10">
                     <span className="mono-tag bg-white/10 text-white border-none">{leadStory?.source || "Featured"}</span>
                     <span className="text-xs font-bold text-white/40">{formatDateTime(leadStory?.publishTime || new Date().toISOString())}</span>
                   </div>
                   <div className="flex-1 flex flex-col justify-center relative z-10">
                      <h2 className="headline-sharp text-3xl md:text-5xl font-black mb-6 leading-tight group-hover:text-accent transition-colors">
                        {leadStory?.title || "探索实时的市场宏观脉动"}
                      </h2>
                      <p className="text-white/60 font-medium line-clamp-3 md:line-clamp-4 leading-relaxed mb-8 max-w-2xl">
                        {leadStory?.content.replace(/<[^>]*>/g, '') || "加载中..."}
                      </p>
                      <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-accent group-hover:translate-x-2 transition-transform">
                        阅读全文 <ArrowRight className="h-4 w-4" />
                      </div>
                   </div>
                </Card>
              </Link>
            </motion.div>

            {/* Stats Bento (Small) */}
            <motion.div 
              className="md:col-span-4 md:row-span-1"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="bento-card bg-white h-full p-8 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                   <div className="p-2.5 rounded-xl bg-secondary text-primary">
                      <Activity className="h-5 w-5" />
                   </div>
                   <Badge variant="outline" className="text-[10px] font-black border-emerald-500/20 text-emerald-600 bg-emerald-500/5 uppercase tracking-tighter shadow-none">Live</Badge>
                </div>
                <div>
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">已索引资讯</p>
                   <p className="headline-sharp text-4xl font-black text-primary">{stats.total.toLocaleString()}</p>
                </div>
              </Card>
            </motion.div>

            {/* Signal Bento (Small) */}
            <motion.div 
              className="md:col-span-4 md:row-span-1"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bento-card bg-white h-full p-8 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                   <div className="p-2.5 rounded-xl bg-secondary text-accent">
                      <TrendingUp className="h-5 w-5" />
                   </div>
                </div>
                <div>
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">重点信号</p>
                   <p className="headline-sharp text-4xl font-black text-primary">{stats.importantCount.toLocaleString()}</p>
                </div>
              </Card>
            </motion.div>

            {/* News Feed Bento (Horizontal) */}
            <motion.div 
              className="md:col-span-12 md:row-span-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="bento-card bg-white h-full p-8 md:p-12 overflow-hidden">
                 <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                       <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                       <span className="text-[11px] font-black uppercase tracking-widest text-primary">Latest Flow</span>
                    </div>
                    <Link 
                      href="/news"
                      className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary")}
                    >
                      View All Feed <ChevronRight className="ml-1 h-3 w-3" />
                    </Link>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {otherStories.map((item, i) => (
                      <Link key={item.id} href={`/news/${item.id}`} className="group block">
                        <div className="flex flex-col h-full">
                           <div className="flex items-center gap-2 mb-4">
                              <span className="text-primary/20 font-black text-xs tracking-tighter">0{i+1}</span>
                              <span className="mono-tag text-[9px] bg-secondary/50">{item.source}</span>
                           </div>
                           <h3 className="text-sm font-black text-primary group-hover:text-accent transition-colors leading-snug line-clamp-2 mb-3">
                              {item.title}
                           </h3>
                           <p className="text-xs text-muted-foreground font-medium line-clamp-2 leading-relaxed opacity-60">
                             {item.content.replace(/<[^>]*>/g, '')}
                           </p>
                        </div>
                      </Link>
                    ))}
                 </div>
              </Card>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 🟠 Infrastructure - Minimalist & Sharp */}
      <section id="infra" className="py-24 bg-slate-50/50 border-t border-border/40">
        <div className="container-slim">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                 <div className="h-0.5 w-6 bg-accent" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-primary">Architecture</span>
              </div>
              <h2 className="headline-sharp text-4xl md:text-5xl font-black text-primary mb-8 tracking-tighter">
                工业级数据同步与 <br />
                <span className="text-accent">实时索引系统</span>
                </h2>              <div className="space-y-8">
                <InfraItem 
                  icon={<Database className="h-5 w-5" />}
                  title="多源统一存储"
                  desc="整合 PostgreSQL 与 Redis，确保高并发下的会话安全与数据持久性。"
                />
                <InfraItem 
                  icon={<Layers className="h-5 w-5" />}
                  title="Elasticsearch 核心"
                  desc="毫秒级全文字文本检索，支持实体识别与维度聚合。"
                />
                <InfraItem 
                  icon={<Globe className="h-5 w-5" />}
                  title="2min 自动同步"
                  desc="完全复刻生产级 FinanceNewsService 抓取调度逻辑。"
                />
              </div>
            </div>
            
            <div className="relative">
              <Card className="border-none shadow-2xl rounded-2xl overflow-hidden bg-primary p-1">
                <div className="bg-slate-950 rounded-xl p-6 font-mono text-[13px] text-emerald-400/90 leading-relaxed shadow-inner">
                  <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-4 text-white/40">
                     <div className="flex gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-red-500/20" />
                        <div className="h-2.5 w-2.5 rounded-full bg-amber-500/20" />
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/20" />
                     </div>
                     <span className="text-[10px] font-black tracking-widest uppercase">System Terminal</span>
                  </div>
                  <div className="space-y-1">
                    <p><span className="text-white/30">[$]</span> <span className="text-white">odin-pulse</span> sync --verbose</p>
                    <p className="text-blue-400">INFO: Initializing multithreaded fetcher...</p>
                    <p>FETCH: wallstreet-cn [OK] - 12 items</p>
                    <p>INDEX: elasticsearch-node-1 [DONE]</p>
                    <p className="text-white/30">...</p>
                    <p>SYNC: postgres-replica-A [COMMIT]</p>
                    <p className="mt-4 flex items-center gap-2">
                       <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                       <span className="text-accent font-black uppercase tracking-widest text-[11px]">Heartbeat: 42ms</span>
                    </p>
                  </div>
                </div>
              </Card>
              {/* Subtle light effect */}
              <div className="absolute -top-12 -right-12 h-64 w-64 bg-accent/10 rounded-full blur-[100px] -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* 🟣 Compact Footer */}
      <footer className="py-12 border-t border-border/40">
        <div className="container-slim flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-6">
              <span className="headline-sharp text-sm font-black tracking-widest text-primary">ODIN PULSE</span>
              <span className="text-muted-foreground/30 text-xs">/</span>
              <div className="flex gap-6">
                <Link href="/news" className="text-xs font-bold text-muted-foreground hover:text-primary">NEWS</Link>
                <Link href="/markets" className="text-xs font-bold text-muted-foreground hover:text-primary">MARKETS</Link>
                <Link href="/login" className="text-xs font-bold text-muted-foreground hover:text-primary">AUTH</Link>
              </div>
           </div>
           <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
             © 2026 GG FICKLE CLOUD • High Availability
           </p>
        </div>
      </footer>
    </main>
  );
}

function InfraItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex gap-6 group">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
        {icon}
      </div>
      <div>
        <h4 className="text-[13px] font-black uppercase tracking-widest text-primary mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed font-medium">{desc}</p>
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
