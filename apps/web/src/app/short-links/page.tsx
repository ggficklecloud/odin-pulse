"use client";

import { useEffect, useState } from "react";
import { 
  Link as LinkIcon, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Copy, 
  Check,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchShortLinks, createShortLink, deleteShortLink } from "@/lib/api";
import { ShortLink } from "@odin-pulse/shared";

const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
};

export default function ShortLinksPage() {
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setLoadingCreate] = useState(false);
  const [url, setUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLinks();
  }, []);

  async function loadLinks() {
    setLoading(true);
    try {
      const res = await fetchShortLinks();
      setLinks(res.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoadingCreate(true);
    setError(null);
    try {
      await createShortLink({ originalUrl: url, slug: slug || undefined, description });
      setUrl("");
      setSlug("");
      setDescription("");
      await loadLinks();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "创建失败";
      setError(message);
    } finally {
      setLoadingCreate(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("确定要删除这个短链吗？")) return;
    try {
      await deleteShortLink(id);
      await loadLinks();
    } catch (err) {
      console.error(err);
    }
  }

  function handleCopy(slug: string, id: string) {
    const shortUrl = `${process.env.NEXT_PUBLIC_SHORT_LINK_DOMAIN || window.location.origin + "/s"}/${slug}`;
    navigator.clipboard.writeText(shortUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

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
             <span className="text-[10px] font-black uppercase tracking-widest text-primary">System Utilities</span>
          </div>
          <h1 className="headline-sharp text-4xl md:text-5xl font-black text-primary tracking-tighter">
            短链管理 <span className="italic font-serif text-accent">Studio.</span>
          </h1>
          <p className="mt-4 text-muted-foreground font-medium max-w-xl leading-relaxed">
            高效地缩短您的业务链接。支持自定义 Slug、访问统计与实时重定向。
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* 🔵 Creation Form */}
        <div className="lg:col-span-4">
           <motion.div {...fadeInUp}>
              <Card className="p-8 border-border/60 bg-background shadow-none rounded-2xl sticky top-24">
                 <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-8 flex items-center gap-2">
                    <Plus className="h-3.5 w-3.5 text-accent" />
                    新建短链接
                 </h3>
                 
                 <form onSubmit={handleCreate} className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">原始链接 (URL)</label>
                       <Input 
                        required
                        type="url"
                        placeholder="https://example.com/very/long/path"
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        className="rounded-xl border-border/60 bg-secondary/30 h-11 focus:bg-white transition-all shadow-none"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">自定义 Slug (可选)</label>
                       <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground opacity-40">/s/</span>
                          <Input 
                            placeholder="my-link"
                            value={slug}
                            onChange={e => setSlug(e.target.value)}
                            className="rounded-xl border-border/60 bg-secondary/30 h-11 pl-10 focus:bg-white transition-all shadow-none"
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">描述 (可选)</label>
                       <Input 
                        placeholder="项目说明..."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="rounded-xl border-border/60 bg-secondary/30 h-11 focus:bg-white transition-all shadow-none"
                       />
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/5 text-destructive text-[11px] font-bold border border-destructive/10">
                         <AlertCircle className="h-3.5 w-3.5" />
                         {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={creating}
                      className="w-full h-11 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/10"
                    >
                       {creating ? "正在创建..." : "确认生成"}
                    </Button>
                 </form>
              </Card>
           </motion.div>
        </div>

        {/* 🟠 Link List */}
        <div className="lg:col-span-8">
           <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" className="space-y-4">
                   {[1,2,3].map(i => <div key={i} className="h-24 bg-secondary/30 animate-pulse rounded-2xl" />)}
                </motion.div>
              ) : (
                <motion.div 
                  key="list"
                  className="space-y-4"
                  initial="initial"
                  animate="animate"
                  variants={{
                    animate: { transition: { staggerChildren: 0.05 } }
                  }}
                >
                   {links.length === 0 ? (
                     <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-border/40 rounded-[2rem] bg-secondary/10">
                        <LinkIcon className="h-12 w-12 text-muted-foreground/20 mb-4" />
                        <p className="text-sm font-bold text-muted-foreground tracking-tight uppercase opacity-40">暂无短链记录</p>
                     </div>
                   ) : (
                     links.map(item => (
                       <motion.div key={item.id} variants={fadeInUp}>
                          <Card className="bento-card p-6 rounded-2xl flex items-center justify-between group">
                             <div className="flex-1 overflow-hidden pr-8">
                                <div className="flex items-center gap-3 mb-2">
                                   <span className="text-sm font-black text-primary hover:text-accent transition-colors cursor-pointer" onClick={() => handleCopy(item.slug, item.id)}>
                                      /s/{item.slug}
                                   </span>
                                   <Badge variant="outline" className="text-[9px] font-black px-2 py-0 border-border/60 bg-secondary/50 text-muted-foreground uppercase shadow-none">
                                      {item.visitCount} Hits
                                   </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground truncate opacity-60">
                                   <ExternalLink className="h-3 w-3 shrink-0" />
                                   {item.originalUrl}
                                </div>
                                {item.description && (
                                  <p className="mt-2 text-[11px] font-bold text-slate-400 italic">“{item.description}”</p>
                                )}
                             </div>

                             <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleCopy(item.slug, item.id)}
                                  className="h-9 w-9 rounded-xl hover:bg-primary/5 text-muted-foreground hover:text-primary transition-colors"
                                >
                                   {copiedId === item.id ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleDelete(item.id)}
                                  className="h-9 w-9 rounded-xl hover:bg-destructive/5 text-muted-foreground hover:text-destructive transition-colors"
                                >
                                   <Trash2 className="h-4 w-4" />
                                </Button>
                             </div>
                          </Card>
                       </motion.div>
                     ))
                   )}
                </motion.div>
              )}
           </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
