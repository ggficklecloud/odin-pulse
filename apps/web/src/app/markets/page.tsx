"use client";

import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3, 
  Globe, 
  Zap, 
  Clock,
  ChevronRight,
  Search,
  ArrowUpRight
} from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { AuthStatus } from "@/components/auth-status";

const fadeInUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

export default function MarketsPage() {
  return (
    <motion.main 
      className="shell px-4 py-8 md:py-16 md:px-6"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      {/* Header Section */}
      <motion.div 
        variants={fadeInUp}
        className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20 px-3 py-1 font-black uppercase tracking-widest text-[10px]">
               Beta Access
             </Badge>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
               <Clock className="h-3 w-3" />
               Real-time Data Active
             </span>
          </div>
          <h1 className="headline text-4xl font-black text-primary md:text-5xl tracking-tighter">
            Markets <span className="text-secondary">Terminal</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <AuthStatus />
          <Button variant="outline" size="icon" className="rounded-full h-11 w-11">
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </motion.div>

      {/* Hero / Coming Soon Banner */}
      <motion.section 
        variants={fadeInUp}
        className="relative overflow-hidden rounded-[3rem] bg-primary p-8 md:p-14 text-white shadow-2xl mb-12"
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-accent/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-secondary/20 blur-[100px]" />
        
        <div className="relative z-10 grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest backdrop-blur-md mb-8">
              <Zap className="h-3.5 w-3.5 text-accent" />
              Under Construction
            </div>
            <h2 className="headline text-5xl font-black leading-tight tracking-tighter md:text-6xl">
              The Future of <br />
              <span className="text-accent">Quant Analysis</span>
            </h2>
            <p className="mt-8 text-lg text-slate-300 font-medium leading-relaxed max-w-lg">
              We&apos;re building a state-of-the-art terminal for multi-asset market intelligence. 
              Soon, you&apos;ll be able to track global indices, crypto, and commodities with AI-driven sentiment overlays.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
               <Button className="rounded-full bg-white text-primary hover:bg-slate-100 h-12 px-8 font-black uppercase tracking-widest text-xs">
                 Notify Me
               </Button>
               <Button variant="outline" className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10 h-12 px-8 font-black uppercase tracking-widest text-xs backdrop-blur-md">
                 Explore API
               </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <MetricCard label="SPX 500" value="5,984.22" change="+1.24%" trend="up" />
            <MetricCard label="BTC / USD" value="$94,210.50" change="-0.42%" trend="down" />
            <MetricCard label="GOLD" value="$2,742.10" change="+0.85%" trend="up" />
            <MetricCard label="DXY" value="106.42" change="+0.12%" trend="up" />
          </div>
        </div>
      </motion.section>

      {/* Main Dashboard Grid Placeholder */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Market Sentiment Overview */}
        <motion.div variants={fadeInUp} className="lg:col-span-8">
          <Card className="panel-strong border-none rounded-[2.5rem] p-8 md:p-12 shadow-xl h-full">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-10">
              <div>
                <p className="eyebrow flex items-center gap-2">
                  <Activity className="h-3 w-3" />
                  Global Pulse
                </p>
                <h3 className="headline mt-2 text-2xl font-black text-primary">Sentiment Map</h3>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-4 py-1.5 rounded-full font-bold">Bullish 64%</Badge>
                <Badge className="bg-slate-100 text-slate-400 border-slate-200 px-4 py-1.5 rounded-full font-bold">Neutral 21%</Badge>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50">
              <div className="h-20 w-20 rounded-full bg-white shadow-xl flex items-center justify-center mb-6">
                <BarChart3 className="h-10 w-10 text-secondary animate-pulse" />
              </div>
              <h4 className="headline text-xl font-bold text-primary">Advanced Charting Coming Soon</h4>
              <p className="mt-2 text-slate-400 font-medium max-w-sm">
                High-frequency data visualization with sentiment correlation is currently in internal testing.
              </p>
              <Button variant="link" className="mt-4 text-secondary font-black uppercase tracking-widest text-[10px] group">
                View Roadmap
                <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Sidebar / Top Movers */}
        <aside className="lg:col-span-4 space-y-8">
          <motion.div variants={fadeInUp}>
            <Card className="panel border-none rounded-[2.5rem] p-8 shadow-xl bg-white/70 backdrop-blur-xl h-full border border-white/40">
              <CardHeader className="p-0 mb-8">
                <p className="eyebrow flex items-center gap-2">
                  <TrendingUp className="h-3 w-3" />
                  Market Leaders
                </p>
                <CardTitle className="headline mt-2 text-2xl font-black text-primary">Top Movers</CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                 <MoverRow symbol="NVDA" name="NVIDIA Corp" price="145.22" change="+3.42%" trend="up" />
                 <MoverRow symbol="TSLA" name="Tesla Inc" price="342.10" change="+2.15%" trend="up" />
                 <MoverRow symbol="AAPL" name="Apple Inc" price="224.15" change="-0.84%" trend="down" />
                 <MoverRow symbol="AMZN" name="Amazon.com" price="198.42" change="+1.05%" trend="up" />
                 <MoverRow symbol="GOOGL" name="Alphabet Inc" price="176.32" change="-1.24%" trend="down" />
              </CardContent>
              <CardFooter className="p-0 mt-8 pt-8 border-t border-slate-100">
                 <Button variant="ghost" className="w-full rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] text-slate-400 hover:text-primary transition-all">
                   Full Screener
                 </Button>
              </CardFooter>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
             <Card className="panel border-none rounded-[2.5rem] p-8 bg-gradient-to-br from-secondary to-primary text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Globe className="h-24 w-24" />
                </div>
                <h3 className="headline text-xl font-bold mb-4">API Documentation</h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  Access our low-latency market data feeds and intelligence endpoints directly via GraphQL or WebSockets.
                </p>
                <Button className="w-full rounded-full bg-accent text-white hover:bg-accent/90 border-none h-11 font-black uppercase tracking-widest text-[10px]">
                  Request API Key
                </Button>
             </Card>
          </motion.div>
        </aside>
      </div>

      {/* Footer Meta */}
      <motion.div variants={fadeInUp} className="mt-16 text-center border-t border-slate-100 pt-12">
        <div className="flex flex-wrap justify-center gap-8 mb-8">
           <StatusItem label="API Status" value="Operational" color="text-emerald-500" />
           <StatusItem label="Data Source" value="Multi-Feed" color="text-secondary" />
           <StatusItem label="Last Update" value="Just Now" color="text-slate-400" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
          Odin Pulse Markets Terminal • System Version 2.0.0-beta
        </p>
      </motion.div>
    </motion.main>
  );
}

function MetricCard({ label, value, change, trend }: { label: string, value: string, change: string, trend: 'up' | 'down' }) {
  return (
    <div className="rounded-[2rem] bg-white/5 border border-white/10 p-6 backdrop-blur-md hover:bg-white/10 transition-all cursor-default group">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{label}</p>
      <p className="headline text-xl font-black text-white mb-2">{value}</p>
      <div className={cn(
        "flex items-center gap-1.5 text-xs font-black",
        trend === 'up' ? "text-emerald-400" : "text-rose-400"
      )}>
        {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {change}
      </div>
    </div>
  );
}

function MoverRow({ symbol, name, price, change, trend }: { symbol: string, name: string, price: string, change: string, trend: 'up' | 'down' }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors group">
      <div className="flex items-center gap-4">
         <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-[10px] text-primary group-hover:bg-white group-hover:shadow-md transition-all">
           {symbol.slice(0, 2)}
         </div>
         <div>
           <p className="text-sm font-black text-primary">{symbol}</p>
           <p className="text-[10px] font-medium text-slate-400">{name}</p>
         </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-black text-primary">${price}</p>
        <p className={cn(
          "text-[10px] font-bold flex items-center justify-end gap-1",
          trend === 'up' ? "text-emerald-500" : "text-rose-500"
        )}>
          {change}
          <ArrowUpRight className={cn("h-2.5 w-2.5", trend === 'down' && "rotate-90")} />
        </p>
      </div>
    </div>
  );
}

function StatusItem({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{label}:</span>
      <span className={cn("text-[10px] font-black uppercase tracking-widest", color)}>{value}</span>
    </div>
  );
}

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
