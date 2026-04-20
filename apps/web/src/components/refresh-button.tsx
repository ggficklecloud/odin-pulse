"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, LoaderCircle, RefreshCw, TriangleAlert } from "lucide-react";

export function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function handleRefresh() {
    setStatus("idle");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/news/refresh`,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        throw new Error(`refresh failed: ${response.status}`);
      }

      setStatus("success");
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    if (status === "idle") {
      return;
    }

    const timer = window.setTimeout(() => {
      setStatus("idle");
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [status]);

  const content =
    isPending ? (
      <>
        <LoaderCircle className="h-4 w-4 animate-spin" />
        刷新中
      </>
    ) : status === "success" ? (
      <>
        <CheckCircle2 className="h-4 w-4" />
        已提交
      </>
    ) : status === "error" ? (
      <>
        <TriangleAlert className="h-4 w-4" />
        刷新失败
      </>
    ) : (
      <>
        <RefreshCw className="h-4 w-4" />
        手动刷新
      </>
    );

  return (
    <button
      type="button"
      onClick={handleRefresh}
      className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-white hover:-translate-y-0.5 hover:bg-amber-600"
      disabled={isPending}
    >
      {content}
    </button>
  );
}
