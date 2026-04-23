"use client";

import Link from "next/link";
import { ArrowLeft, Database, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

import { AccountPanel } from "@/components/account-panel";

const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
};

export default function AccountPage() {
  return (
    <main className="container-slim py-12 md:py-24">
      <motion.div 
        className="max-w-4xl mx-auto"
        initial="initial"
        animate="animate"
      >
        <motion.div variants={fadeInUp} className="mb-16">
          <Link 
            href="/" 
            className="group inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors mb-12"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
            Back to Portal
          </Link>
          
          <div className="flex items-center gap-4 mb-6">
             <div className="h-0.5 w-8 bg-accent" />
             <span className="text-[10px] font-black uppercase tracking-widest text-primary">Identity Hub</span>
          </div>
          <h1 className="headline-sharp text-4xl md:text-6xl font-black text-primary tracking-tighter mb-8">
            Manage your <span className="text-accent">Security.</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium max-w-2xl leading-relaxed">
            Configure your professional profile and security parameters. 
            All modifications are hardware-encrypted and persistent.
          </p>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <AccountPanel />
        </motion.div>

        <motion.div 
          variants={fadeInUp} 
          className="mt-24 border-t border-border/40 pt-12 flex flex-col md:flex-row justify-between items-center gap-8"
        >
           <div className="flex gap-8">
              <div className="flex items-center gap-3">
                 <ShieldCheck className="h-4 w-4 text-emerald-500" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Quantum Verified</span>
              </div>
              <div className="flex items-center gap-3">
                 <Database className="h-4 w-4 text-primary" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Postgres Core</span>
              </div>
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30">
             ODIN PULSE IDENTITY OS v1.0
           </p>
        </motion.div>
      </motion.div>
    </main>
  );
}
