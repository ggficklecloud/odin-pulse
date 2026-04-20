"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LoaderCircle, LogIn, Mail, ShieldCheck, UserRound } from "lucide-react";

type UserInfo = {
  openId: string;
  unionId: string;
  platformId: string;
  openUserNickname: string;
  openUsername: string;
  email: string | null;
  uniUserNickname: string;
  avatar: string | null;
  isAdmin: boolean;
};

type LoadState = "loading" | "ready" | "unauthorized" | "error";

export function AccountPanel() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [user, setUser] = useState<UserInfo | null>(null);
  const [nickname, setNickname] = useState("");
  const [avatar, setAvatar] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch("/api/v1/user/get-user-info", {
          credentials: "include",
          cache: "no-store",
        });

        if (response.status === 401) {
          if (active) {
            setLoadState("unauthorized");
          }
          return;
        }

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const payload = (await response.json()) as UserInfo;
        if (!active) {
          return;
        }

        setUser(payload);
        setNickname(payload.openUserNickname || payload.uniUserNickname || "");
        setAvatar(payload.avatar || "");
        setLoadState("ready");
      } catch (error) {
        if (active) {
          setLoadState("error");
          setProfileError(normalizeError(error));
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  const displayName = useMemo(() => {
    if (!user) {
      return "";
    }
    return user.openUserNickname || user.uniUserNickname || user.openUsername || user.email || user.openId;
  }, [user]);

  async function handleProfileSubmit(event: FormEvent) {
    event.preventDefault();
    setProfileLoading(true);
    setProfileError(null);
    setProfileMessage(null);

    try {
      const response = await fetch("/api/v1/user/update-user-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          nickname: nickname.trim(),
          avatar: avatar.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const nextUser = user
        ? {
            ...user,
            openUserNickname: nickname.trim(),
            uniUserNickname: nickname.trim() || user.uniUserNickname,
            avatar: avatar.trim() || null,
          }
        : user;
      setUser(nextUser);
      setProfileMessage("资料已更新。");
    } catch (error) {
      setProfileError(normalizeError(error));
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault();
    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordMessage(null);

    try {
      const response = await fetch("/api/v1/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setOldPassword("");
      setNewPassword("");
      setPasswordMessage("密码已更新。");
    } catch (error) {
      setPasswordError(normalizeError(error));
    } finally {
      setPasswordLoading(false);
    }
  }

  if (loadState === "loading") {
    return (
      <section className="panel rounded-[2rem] px-6 py-8 text-sm text-slate-600">
        <div className="inline-flex items-center gap-2">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          正在读取当前账户信息…
        </div>
      </section>
    );
  }

  if (loadState === "unauthorized") {
    return (
      <section className="panel rounded-[2rem] px-6 py-8">
        <p className="eyebrow">Not signed in</p>
        <h2 className="headline mt-3 text-2xl font-semibold text-primary">你还没有登录</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          先登录后，才能查看账户资料、修改昵称头像和更新密码。
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:-translate-y-0.5 hover:bg-slate-800"
        >
          <LogIn className="h-4 w-4" />
          去登录
        </Link>
      </section>
    );
  }

  if (loadState === "error" || !user) {
    return (
      <section className="panel rounded-[2rem] px-6 py-8">
        <p className="eyebrow">Load failed</p>
        <h2 className="headline mt-3 text-2xl font-semibold text-primary">账户信息读取失败</h2>
        <p className="mt-3 text-sm leading-7 text-rose-700">{profileError || "请稍后重试。"}</p>
      </section>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
      <section className="panel-strong rounded-[2rem] px-6 py-6 md:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Current account</p>
            <h2 className="headline mt-2 text-3xl font-semibold text-primary">{displayName}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              当前登录账户的基础资料来自 PostgreSQL；会话状态由 Redis session 托管。
            </p>
          </div>
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={displayName}
              width={80}
              height={80}
              className="h-20 w-20 rounded-full border border-slate-200 object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400">
              <UserRound className="h-8 w-8" />
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <InfoPill icon={<Mail className="h-4 w-4 text-secondary" />} label="邮箱" value={user.email || "未绑定邮箱"} />
          <InfoPill icon={<UserRound className="h-4 w-4 text-secondary" />} label="用户名" value={user.openUsername || "未设置"} />
          <InfoPill icon={<ShieldCheck className="h-4 w-4 text-secondary" />} label="平台 ID" value={user.platformId} />
          <InfoPill icon={<ShieldCheck className="h-4 w-4 text-secondary" />} label="权限" value={user.isAdmin ? "管理员" : "普通用户"} />
        </div>

        <form onSubmit={handleProfileSubmit} className="mt-8 grid gap-4">
          <div>
            <p className="eyebrow">Profile</p>
            <h3 className="headline mt-2 text-2xl font-semibold text-primary">更新资料</h3>
          </div>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            昵称
            <input
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
              placeholder="输入新的展示昵称"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            头像 URL
            <input
              value={avatar}
              onChange={(event) => setAvatar(event.target.value)}
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
              placeholder="https://example.com/avatar.png"
            />
          </label>

          <button
            type="submit"
            disabled={profileLoading}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-70"
          >
            {profileLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <UserRound className="h-4 w-4" />}
            保存资料
          </button>

          {profileMessage ? <p className="text-sm font-medium text-emerald-700">{profileMessage}</p> : null}
          {profileError ? <p className="text-sm font-medium text-rose-700">{profileError}</p> : null}
        </form>
      </section>

      <aside className="grid gap-6">
        <section className="panel rounded-[2rem] px-6 py-6">
          <p className="eyebrow">Security</p>
          <h3 className="headline mt-2 text-2xl font-semibold text-primary">修改密码</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            这里仅更新登录密码。OAuth 的 client secret 仍只保存在服务端配置，不会出现在前端页面里。
          </p>

          <form onSubmit={handlePasswordSubmit} className="mt-5 grid gap-4">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              当前密码
              <input
                type="password"
                value={oldPassword}
                onChange={(event) => setOldPassword(event.target.value)}
                className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                placeholder="请输入当前密码"
                required
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              新密码
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                placeholder="至少 6 位"
                minLength={6}
                required
              />
            </label>

            <button
              type="submit"
              disabled={passwordLoading}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 hover:border-secondary hover:text-secondary disabled:opacity-70"
            >
              {passwordLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              更新密码
            </button>

            {passwordMessage ? <p className="text-sm font-medium text-emerald-700">{passwordMessage}</p> : null}
            {passwordError ? <p className="text-sm font-medium text-rose-700">{passwordError}</p> : null}
          </form>
        </section>

        <section className="panel rounded-[2rem] px-6 py-6">
          <p className="eyebrow">Session notes</p>
          <h3 className="headline mt-2 text-2xl font-semibold text-primary">认证说明</h3>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
            <li>• 当前页面只展示非敏感用户资料，不回显任何密码、token 或第三方密钥。</li>
            <li>• 邮箱验证码登录仍依赖 SMTP 服务端配置；未配置 SMTP 时，验证码链路不会真正发信。</li>
            <li>• GitHub / Google OAuth 回调页仍使用服务端生成的授权 URL 与数据库配置。</li>
          </ul>
        </section>
      </aside>
    </div>
  );
}

function InfoPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="panel-muted rounded-[1.5rem] px-4 py-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {icon}
        {label}
      </div>
      <p className="headline mt-3 text-sm font-semibold text-primary break-all">{value}</p>
    </div>
  );
}

function normalizeError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return "请求失败";
}
