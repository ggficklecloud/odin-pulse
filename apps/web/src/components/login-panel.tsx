"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Github, LoaderCircle, Mail, ShieldCheck, UserRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type LoginMode = "password" | "code";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export function LoginPanel() {
  const router = useRouter();
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

      router.push("/account");
      router.refresh();
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
    <motion.div 
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid gap-8 lg:grid-cols-2 lg:items-center"
    >
      <motion.div variants={fadeInUp} className="space-y-6">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-2xl shadow-primary/20">
          <ShieldCheck className="h-10 w-10" />
        </div>
        <h1 className="headline text-4xl font-extrabold text-primary md:text-6xl lg:text-7xl">
          安全网关<br />
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            受信访问控制
          </span>
        </h1>
        <p className="max-w-md text-lg text-slate-600 leading-relaxed">
          Odin Pulse 采用企业级身份验证基建，支持多因素认证与 OAuth 2.0 协议，确保您的数据访问安全无虞。
        </p>
        
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="p-4 rounded-2xl bg-white/50 border border-slate-100 backdrop-blur-sm shadow-sm">
            <div className="text-2xl font-bold text-primary">AES-256</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">数据加密</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/50 border border-slate-100 backdrop-blur-sm shadow-sm">
            <div className="text-2xl font-bold text-primary">OAuth 2.0</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">授权协议</div>
          </div>
        </div>
      </motion.div>

      <motion.aside variants={fadeInUp} className="relative">
        {/* Background decorative elements */}
        <div className="absolute -top-10 -right-10 h-64 w-64 rounded-full bg-secondary/5 blur-3xl -z-10" />
        <div className="absolute -bottom-10 -left-10 h-64 w-64 rounded-full bg-accent/5 blur-3xl -z-10" />

        <Card className="rounded-[2.5rem] p-4 md:p-6 shadow-2xl border-white/60 bg-white/70 backdrop-blur-xl overflow-hidden relative">
          <CardHeader className="space-y-1 pb-8">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">身份验证</CardTitle>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 px-2 py-0 shadow-none">
                Encrypted
              </Badge>
            </div>
            <p className="text-sm text-slate-500">选择您偏好的方式登录 Odin Pulse 平台</p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
              <button 
                onClick={() => setLoginMode("code")}
                className={cn(
                  "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                  mode === "code" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-primary"
                )}
              >
                验证码登录
              </button>
              <button 
                onClick={() => setLoginMode("password")}
                className={cn(
                  "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                  mode === "password" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-primary"
                )}
              >
                密码登录
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">电子邮箱</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="pl-11 h-12 rounded-xl border-slate-200 bg-white focus:bg-white transition-all shadow-none"
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
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">验证码</label>
                    <div className="flex gap-2">
                      <Input
                        required
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="000000"
                        className="h-12 rounded-xl border-slate-200 bg-white focus:bg-white transition-all shadow-none"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        disabled={!isEmailValid || countdown > 0 || loading}
                        onClick={sendCode}
                        className="h-12 rounded-xl px-4 font-bold border-slate-200 shadow-none"
                      >
                        {countdown > 0 ? `${countdown}s` : "获取验证码"}
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
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">登录密码</label>
                    <Input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-12 rounded-xl border-slate-200 bg-white focus:bg-white transition-all shadow-none"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-medium">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-primary font-bold shadow-lg shadow-primary/20 hover:bg-slate-800 transition-all mt-2"
              >
                {loading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : "立即登录系统"}
              </Button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
                <span className="bg-white px-4 text-slate-400">快速第三方授权</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => redirectToProvider("github")}
                className="h-12 rounded-xl border-slate-200 font-bold transition-all hover:border-primary shadow-none"
              >
                <Github className="h-4 w-4 mr-2" />
                GitHub
              </Button>
              <Button
                variant="outline"
                onClick={() => redirectToProvider("google")}
                className="h-12 rounded-xl border-slate-200 font-bold transition-all hover:border-primary shadow-none"
              >
                <ShieldCheck className="h-4 w-4 mr-2" />
                Google
              </Button>
            </div>
            
            <p className="mt-4 text-[10px] leading-relaxed text-slate-400 text-center italic">
              &quot;工业级认证基建，授权受控于后端环境变量，确保数据主权。&quot;
            </p>
            
            <Link 
              href="/account" 
              className={cn(
                buttonVariants({ variant: "link" }),
                "mt-4 w-full font-bold text-secondary hover:text-primary flex items-center justify-center gap-2"
              )}
            >
              <UserRound className="h-4 w-4" />
              已登录？进入账户中心
            </Link>
          </CardContent>
        </Card>
      </motion.aside>
    </motion.div>
  );
}

function normalizeError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};