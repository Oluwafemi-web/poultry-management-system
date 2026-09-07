import { Suspense } from "react";
import SignInPage from "./signin-client";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading…</div>}>
      <SignInPage />
    </Suspense>
  );
}
