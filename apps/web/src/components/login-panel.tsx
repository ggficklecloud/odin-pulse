"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Github, LoaderCircle, Mail, ShieldCheck } from "lucide-react";

type LoginMode = "password" | "code";

export function LoginPanel() {
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);

  const submitLabel = useMemo(() => {
    return mode === "password" ? "邮箱密码登录" : "验证码登录";
  }, [mode]);

  async function handlePasswordLogin(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/v1/auth/email-verify/login-by-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setMessage("登录成功，正在跳转。");
      router.push("/");
      router.refresh();
    } catch (requestError) {
      setError(normalizeError(requestError));
    } finally {
      setLoading(false);
    }
  }

  async function handleCodeLogin(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/v1/auth/email-verify/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          verifyCode,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setMessage("登录成功，正在跳转。");
      router.push("/");
      router.refresh();
    } catch (requestError) {
      setError(normalizeError(requestError));
    } finally {
      setLoading(false);
    }
  }

  async function sendCode() {
    setSendingCode(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/v1/auth/email-verify/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          type: "login",
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setMessage("验证码已发送。");
    } catch (requestError) {
      setError(normalizeError(requestError));
    } finally {
      setSendingCode(false);
    }
  }

  async function redirectToProvider(provider: "github" | "google") {
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const response = await fetch(`/api/v1/auth/${provider}-oauth-url`);
      const payload = (await response.json()) as { url: string | null };
      if (!payload.url) {
        throw new Error(`${provider} oauth not configured`);
      }
      window.location.href = payload.url;
    } catch (requestError) {
      setError(normalizeError(requestError));
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="panel-strong rounded-[2rem] px-6 py-6 md:px-8">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setMode("password")}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              mode === "password"
                ? "bg-primary text-white"
                : "border border-slate-300 bg-white text-slate-700"
            }`}
          >
            邮箱密码
          </button>
          <button
            type="button"
            onClick={() => setMode("code")}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              mode === "code"
                ? "bg-primary text-white"
                : "border border-slate-300 bg-white text-slate-700"
            }`}
          >
            邮箱验证码
          </button>
        </div>

        <form
          onSubmit={mode === "password" ? handlePasswordLogin : handleCodeLogin}
          className="mt-6 grid gap-4"
        >
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            邮箱
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
              placeholder="you@example.com"
              required
            />
          </label>

          {mode === "password" ? (
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              密码
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                placeholder="请输入密码"
                required
              />
            </label>
          ) : (
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                验证码
                <input
                  value={verifyCode}
                  onChange={(event) => setVerifyCode(event.target.value)}
                  className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                  placeholder="6 位验证码"
                  required
                />
              </label>
              <button
                type="button"
                onClick={sendCode}
                disabled={sendingCode || !email}
                className="mt-7 h-12 rounded-2xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sendingCode ? "发送中" : "发送验证码"}
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-70"
          >
            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            {submitLabel}
          </button>
        </form>

        {message ? <p className="mt-4 text-sm font-medium text-emerald-700">{message}</p> : null}
        {error ? <p className="mt-4 text-sm font-medium text-rose-700">{error}</p> : null}
      </section>

      <aside className="panel rounded-[2rem] px-6 py-6">
        <p className="eyebrow">OAuth</p>
        <h2 className="headline mt-2 text-2xl font-semibold text-primary">第三方登录</h2>
        <div className="mt-5 grid gap-3">
          <button
            type="button"
            onClick={() => redirectToProvider("github")}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700"
          >
            <Github className="h-4 w-4" />
            GitHub 登录
          </button>
          <button
            type="button"
            onClick={() => redirectToProvider("google")}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700"
          >
            <ShieldCheck className="h-4 w-4" />
            Google 登录
          </button>
        </div>
        <p className="mt-5 text-sm leading-7 text-slate-600">
          GitHub / Google 的 client id 和 secret 不在公开仓库里，运行时配置来自数据库和服务器环境。
        </p>
      </aside>
    </div>
  );
}

function normalizeError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return "请求失败";
}
