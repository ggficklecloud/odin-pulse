"use client";

import Link from "next/link";
import { ArrowLeft, Lock, ShieldCheck, Zap, Globe, Layers } from "lucide-react";
import { motion } from "framer-motion";

import { LoginPanel } from "@/components/login-panel";

const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function LoginPage() {
  return (
    <main className="container-slim py-12 md:py-24 min-h-[85vh] flex items-center justify-center">
      <motion.div 
        className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        {/* Left Side: Branding & Info (Hidden on small mobile if needed, but here we keep it) */}
        <motion.div variants={fadeInUp} className="space-y-8 text-center lg:text-left">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-xl shadow-primary/20 mb-4">
             <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="headline-sharp text-5xl md:text-6xl font-black text-primary leading-tight tracking-tighter">
            Access the <br />
            <span className="text-accent">Intelligence Core.</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium max-w-md mx-auto lg:mx-0 leading-relaxed">
            欢迎回到 Odin Pulse。请验证您的身份以访问实时行情数据、深度研报与量化交易信号。
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 max-w-md mx-auto lg:mx-0">
             <div className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-secondary/30">
                <Lock className="h-4 w-4 text-primary opacity-40" />
                <span className="text-[11px] font-black uppercase tracking-widest text-primary/60">AES-256 Auth</span>
             </div>
             <div className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-secondary/30">
                <Globe className="h-4 w-4 text-primary opacity-40" />
                <span className="text-[11px] font-black uppercase tracking-widest text-primary/60">Global Cluster</span>
             </div>
          </div>

          <div className="pt-8">
            <Link 
              href="/" 
              className="group inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
              Back to System Portal
            </Link>
          </div>
        </motion.div>

        {/* Right Side: Login Panel */}
        <motion.div variants={fadeInUp} className="relative w-full max-w-[440px] mx-auto lg:ml-auto lg:mr-0">
          {/* Subtle background decoration */}
          <div className="absolute -inset-10 bg-gradient-to-tr from-accent/5 to-primary/5 rounded-[3rem] blur-3xl -z-10" />
          
          <LoginPanel />
          
          <div className="mt-8 flex justify-center items-center gap-6 opacity-30">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest">
                <Zap className="h-3 w-3" /> Real-time
            </div>
            <div className="h-1 w-1 rounded-full bg-border" />
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest">
                <Layers className="h-3 w-3" /> Encrypted
            </div>
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}
