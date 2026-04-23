"use client";

import Link from "next/link";
import { ArrowLeft, Lock, ShieldCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";

import { LoginPanel } from "@/components/login-panel";

const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
};

export default function LoginPage() {
  return (
    <main className="container-slim py-12 md:py-24 min-h-[85vh] flex flex-col items-center justify-center">
      <motion.div 
        className="w-full max-w-[400px]"
        initial="initial"
        animate="animate"
      >
        <motion.div variants={fadeInUp} className="text-center mb-12">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white mb-6 shadow-xl shadow-primary/20">
             <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="headline-sharp text-3xl font-black text-primary mb-3">Welcome Back.</h1>
          <p className="text-sm text-muted-foreground font-medium">Access your private business intelligence hub.</p>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <LoginPanel />
        </motion.div>

        <motion.div 
          variants={fadeInUp}
          className="mt-12 flex flex-col items-center gap-6"
        >
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                 <Lock className="h-3 w-3" /> Encrypted
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                 <Zap className="h-3 w-3" /> Real-time
              </div>
           </div>
           
           <Link 
            href="/" 
            className="group inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
           >
             <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
             Back to Portal
           </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}
