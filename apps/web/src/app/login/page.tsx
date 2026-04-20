import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { LoginPanel } from "@/components/login-panel";

export const dynamic = "force-dynamic";

export default function LoginPage() {
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
          <p className="eyebrow">Account Access</p>
        </div>
        <h1 className="headline mt-5 text-4xl font-semibold text-primary md:text-5xl">
          登录 Odin Pulse
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
          当前已迁入邮箱登录、GitHub、Google 和 Redis session 机制。新闻仍然只写 ES，关系型数据后续统一落 PostgreSQL。
        </p>
      </section>

      <section className="mt-8">
        <LoginPanel />
      </section>
    </main>
  );
}
