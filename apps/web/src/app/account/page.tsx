import Link from "next/link";
import { ArrowLeft, ShieldCheck, UserRound } from "lucide-react";

import { AccountPanel } from "@/components/account-panel";

export const dynamic = "force-dynamic";

export default function AccountPage() {
  return (
    <main className="shell px-4 py-8 md:px-6">
      <section className="panel-strong rounded-[2rem] px-6 py-6 md:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:-translate-y-0.5 hover:border-secondary hover:text-secondary"
          >
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Link>
          <p className="eyebrow">Account Center</p>
        </div>
        <h1 className="headline mt-5 text-4xl font-semibold text-primary md:text-5xl">
          账户与认证中心
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
          在这里查看当前登录状态、更新昵称与头像，以及修改登录密码。OAuth 与邮箱验证码仍走服务端配置，不在前端暴露敏感信息。
        </p>

        <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-600">
          <span className="kicker-chip">
            <UserRound className="h-4 w-4 text-secondary" />
            当前用户资料
          </span>
          <span className="kicker-chip">
            <ShieldCheck className="h-4 w-4 text-secondary" />
            密码与会话管理
          </span>
        </div>
      </section>

      <section className="mt-8">
        <AccountPanel />
      </section>
    </main>
  );
}
