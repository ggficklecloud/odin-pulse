import { Suspense } from "react";

import { OAuthCallbackHandler } from "@/components/oauth-callback-handler";

export const dynamic = "force-dynamic";

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<OAuthCallbackShell message="正在处理 Google 登录回调..." />}>
      <OAuthCallbackHandler provider="google" />
    </Suspense>
  );
}

function OAuthCallbackShell({ message }: { message: string }) {
  return (
    <main className="shell px-4 py-16 md:px-6">
      <div className="panel-strong rounded-[2rem] px-6 py-10 text-center md:px-8">
        <p className="eyebrow">OAuth Callback</p>
        <h1 className="headline mt-4 text-3xl font-semibold text-primary">{message}</h1>
      </div>
    </main>
  );
}
