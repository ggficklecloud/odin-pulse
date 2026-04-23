"use client";

import Link from "next/link";
import { Radar } from "lucide-react";
import { motion } from "framer-motion";
import { AuthStatus } from "@/components/auth-status";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const navLinks = [
  { name: "首页", href: "/" },
  { name: "新闻", href: "/news" },
  { name: "行情", href: "/markets" },
  { name: "账户", href: "/account" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 glass-slim h-14 flex items-center">
      <div className="container-slim flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white transition-all group-hover:rotate-[15deg]">
              <Radar className="h-5 w-5" />
            </div>
            <span className="headline-sharp text-lg font-black tracking-tight text-primary">
              ODIN
            </span>
          </Link>
          
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className={cn(
                    "text-[13px] font-bold px-3 py-1.5 rounded-md transition-colors relative",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
                  )}
                >
                  {link.name}
                  {isActive && (
                    <motion.div 
                      layoutId="nav-active"
                      className="absolute inset-0 bg-primary/5 rounded-md -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4 scale-90 origin-right">
          <AuthStatus />
        </div>
      </div>
    </header>
  );
}
