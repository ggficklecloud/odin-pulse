"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { Github, LoaderCircle, Mail, UserRound, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type LoginMode = "password" | "code";

export function LoginPanel() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [mode, setLoginMode] = useState<LoginMode>("code");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const isEmailValid = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, [email]);

  const sendCode = async () => {
    if (!isEmailValid || countdown > 0) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/auth/email-verify/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "发送失败");

      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url =
        mode === "password"
          ? "/api/v1/auth/email-verify/login-by-password"
          : "/api/v1/auth/email-verify/login";

      const body =
        mode === "password" ? { email, password } : { email, code };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "登录失败");

      // 登录成功后强制物理刷新，确保 Navbar 等组件状态同步
      window.location.href = "/account";
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setLoading(false);
    }
  };

  const redirectToProvider = async (provider: "github" | "google") => {
    try {
      const res = await fetch(`/api/v1/auth/${provider}-oauth-url`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      window.location.href = data.url;
    } catch (err) {
      setError(normalizeError(err));
    }
  };

  return (
    <Card className="rounded-[2rem] p-4 md:p-8 shadow-2xl border-border/40 bg-white relative overflow-hidden">
      <CardHeader className="space-y-1 pb-8 px-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-black tracking-tight">身份验证</CardTitle>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 px-2 py-0 shadow-none text-[9px] font-black uppercase">
            Encrypted
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground font-medium">请选择您的登录方式</p>
      </CardHeader>
      
      <CardContent className="space-y-6 px-0">
        <div className="flex p-1 bg-secondary rounded-xl">
          <button 
            onClick={() => setLoginMode("code")}
            className={cn(
              "flex-1 py-2 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all",
              mode === "code" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-primary"
            )}
          >
            验证码登录
          </button>
          <button 
            onClick={() => setLoginMode("password")}
            className={cn(
              "flex-1 py-2 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all",
              mode === "password" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-primary"
            )}
          >
            密码登录
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">电子邮箱</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="pl-11 h-12 rounded-xl border-border/60 bg-background/50 focus:bg-white transition-all shadow-none font-medium"
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {mode === "code" ? (
              <motion.div
                key="code"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-2"
              >
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">验证码</label>
                <div className="flex gap-2">
                  <Input
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="000000"
                    className="h-12 rounded-xl border-border/60 bg-background/50 focus:bg-white transition-all shadow-none font-medium"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!isEmailValid || countdown > 0 || loading}
                    onClick={sendCode}
                    className="h-12 rounded-xl px-6 font-black uppercase tracking-widest text-[10px] border-border/60 shadow-none"
                  >
                    {countdown > 0 ? `${countdown}s` : "获取"}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="password"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-2"
              >
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">登录密码</label>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 rounded-xl border-border/60 bg-background/50 focus:bg-white transition-all shadow-none font-medium"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/10 text-destructive text-[11px] font-bold">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-primary font-black uppercase tracking-widest text-[11px] shadow-xl shadow-primary/10 hover:shadow-primary/20 transition-all"
          >
            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "立即登录系统"}
          </Button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/40" />
          </div>
          <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.2em]">
            <span className="bg-white px-4 text-muted-foreground">快速授权</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={() => redirectToProvider("github")}
            className="h-11 rounded-xl border-border/60 font-bold transition-all hover:border-primary shadow-none text-xs"
          >
            <Github className="h-4 w-4 mr-2" />
            GitHub
          </Button>
          <Button
            variant="outline"
            onClick={() => redirectToProvider("google")}
            className="h-11 rounded-xl border-border/60 font-bold transition-all hover:border-primary shadow-none text-xs"
          >
            <ShieldCheck className="h-4 w-4 mr-2 text-accent" />
            Google
          </Button>
        </div>
        
        <Link 
          href="/account" 
          className={cn(
            buttonVariants({ variant: "link" }),
            "mt-4 w-full font-bold text-muted-foreground hover:text-primary flex items-center justify-center gap-2 text-xs no-underline"
          )}
        >
          <UserRound className="h-3.5 w-3.5" />
          已登录？进入账户中心
        </Link>
      </CardContent>
    </Card>
  );
}

function normalizeError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
