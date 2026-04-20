"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function OAuthCallbackHandler({
  provider,
}: {
  provider: "github" | "google";
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const [message, setMessage] = useState(
    code ? "正在处理登录回调..." : "回调缺少 code 参数。",
  );

  useEffect(() => {
    if (!code) {
      return;
    }

    fetch(`/api/v1/auth/${provider}-callback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ code }),
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(await response.text());
        }
        setMessage("登录成功，正在返回首页。");
        router.push("/");
        router.refresh();
      })
      .catch((error) => {
        setMessage(error instanceof Error ? error.message : "登录失败");
      });
  }, [code, provider, router]);

  return (
    <main className="shell px-4 py-16 md:px-6">
      <div className="panel-strong rounded-[2rem] px-6 py-10 text-center md:px-8">
        <p className="eyebrow">OAuth Callback</p>
        <h1 className="headline mt-4 text-3xl font-semibold text-primary">{message}</h1>
      </div>
    </main>
  );
}
