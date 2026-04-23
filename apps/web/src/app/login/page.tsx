"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles, ShieldCheck, Fingerprint } from "lucide-react";
import { motion } from "framer-motion";

import { LoginPanel } from "@/components/login-panel";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const fadeInUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
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
    <motion.main 
      className="shell px-4 py-12 md:py-20 md:px-6 min-h-[90vh] flex flex-col justify-center"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      <motion.section 
        variants={fadeInUp}
        className="panel-strong rounded-[3rem] p-8 md:p-16 mb-12 shadow-2xl relative overflow-hidden group"
      >
        {/* Background Decorative Elements */}
        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-accent/10 blur-[80px] group-hover:bg-accent/15 transition-colors duration-700" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-primary/5 blur-[80px]" />
        
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-6 mb-10">
            <Link 
              href="/" 
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "rounded-full bg-white/50 backdrop-blur-md px-6 h-10 shadow-sm hover:shadow-md hover:border-secondary hover:text-secondary transition-all flex items-center gap-2 font-bold uppercase tracking-widest text-[10px]"
              )}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Pulse
            </Link>
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-accent backdrop-blur-sm">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secure Gateway
            </div>
          </div>

          <div className="max-w-4xl">
            <h1 className="headline text-5xl font-black leading-[1.1] text-primary md:text-7xl tracking-tighter">
              Login to <span className="text-secondary">Odin Pulse</span>
            </h1>
            <p className="mt-8 text-lg md:text-xl leading-relaxed text-slate-500 font-medium max-w-2xl">
              Welcome back to your private business intelligence portal. 
              Integrated with Redis-backed session management and PostgreSQL persistence.
            </p>
            
            <div className="mt-10 flex flex-wrap gap-4">
               <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                 <Fingerprint className="h-4 w-4 text-secondary" />
                 Encrypted
               </div>
               <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                 <Sparkles className="h-4 w-4 text-accent" />
                 Next-Gen UI
               </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section variants={fadeInUp} className="relative z-20">
        <LoginPanel />
      </motion.section>
      
      {/* Footer Branding */}
      <motion.div 
        variants={fadeInUp}
        className="mt-16 text-center"
      >
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
          Odin Pulse Platform © 2025 • Quantum Verified
        </p>
      </motion.div>
    </motion.main>
  );
}
