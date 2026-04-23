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
    <div className="flex items-center gap-3">
      <Link
        href="/account"
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-bold transition-all hover:bg-primary/5 hover:text-primary border border-transparent hover:border-primary/10"
      >
        <UserRound className="h-3.5 w-3.5 text-primary" />
        <span className="max-w-[100px] truncate">{user.openUserNickname || user.openUsername}</span>
        {user.isAdmin ? <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> : null}
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        disabled={isPending}
        className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors border border-transparent hover:border-destructive/10"
        title="退出登录"
      >
        {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
      </button>
    </div>
  );
}
