"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck, UserRound, Settings, Activity } from "lucide-react";
import { motion } from "framer-motion";

import { AccountPanel } from "@/components/account-panel";
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

export default function AccountPage() {
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
        {/* Decorative elements */}
        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-secondary/10 blur-[80px]" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-accent/5 blur-[80px]" />
        
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
            <div className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/5 px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-secondary backdrop-blur-sm">
              <Settings className="h-3.5 w-3.5" />
              Account Management
            </div>
          </div>

          <div className="max-w-4xl">
            <h1 className="headline text-5xl font-black leading-[1.1] text-primary md:text-7xl tracking-tighter">
              Account <span className="text-secondary">Intelligence</span>
            </h1>
            <p className="mt-8 text-lg md:text-xl leading-relaxed text-slate-500 font-medium max-w-2xl">
              Manage your digital identity, security credentials, and personalized configurations. 
              All profile changes are encrypted and synchronized with the PostgreSQL core.
            </p>

            <div className="mt-10 flex flex-wrap gap-4 text-sm">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-5 py-2.5 font-black text-[10px] uppercase tracking-widest text-slate-500 border border-slate-100 shadow-sm">
                <UserRound className="h-4 w-4 text-secondary" />
                Identity Profile
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-5 py-2.5 font-black text-[10px] uppercase tracking-widest text-slate-500 border border-slate-100 shadow-sm">
                <ShieldCheck className="h-4 w-4 text-secondary" />
                Security Access
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-5 py-2.5 font-black text-[10px] uppercase tracking-widest text-slate-500 border border-slate-100 shadow-sm">
                <Activity className="h-4 w-4 text-accent" />
                Real-time Sync
              </span>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section variants={fadeInUp} className="relative z-20">
        <AccountPanel />
      </motion.section>
      
      {/* Footer Branding */}
      <motion.div 
        variants={fadeInUp}
        className="mt-16 text-center"
      >
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
          Odin Pulse Platform © 2025 • High-Availability Data Center
        </p>
      </motion.div>
    </motion.main>
  );
}
