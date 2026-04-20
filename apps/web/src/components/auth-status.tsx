"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle, LogIn, LogOut, ShieldCheck, UserRound } from "lucide-react";

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

export function AuthStatus() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    let active = true;

    fetch("/api/v1/user/get-user-info", {
      credentials: "include",
    })
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }
        return (await response.json()) as UserInfo;
      })
      .then((payload) => {
        if (active) {
          setUser(payload);
        }
      })
      .catch(() => {
        if (active) {
          setUser(null);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleLogout() {
    await fetch("/api/v1/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    startTransition(() => {
      router.refresh();
      router.push("/");
    });
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:-translate-y-0.5 hover:border-secondary hover:text-secondary"
      >
        <LogIn className="h-4 w-4" />
        登录
      </Link>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="kicker-chip">
        <UserRound className="h-4 w-4 text-secondary" />
        {user.openUserNickname || user.openUsername}
        {user.isAdmin ? <ShieldCheck className="h-4 w-4 text-emerald-600" /> : null}
      </div>
      <button
        type="button"
        onClick={handleLogout}
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:-translate-y-0.5 hover:border-secondary hover:text-secondary"
      >
        {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
        退出
      </button>
    </div>
  );
}
