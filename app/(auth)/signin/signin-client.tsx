"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
      return;
    }

    const me = await fetch("/api/auth/me").then((r) => r.json());
    const callback = params.get("callbackUrl");
    if (callback) {
      router.push(callback);
      return;
    }
    if (me?.farmRole === "WORKER") router.push("/worker");
    else if (!me?.onboarded && me?.platformRole === "OWNER")
      router.push("/onboarding");
    else if (me?.farmId) router.push("/app");
    else router.push("/marketplace");
  }

  return (
    <div className="min-h-screen bg-as-ink flex items-center justify-center p-4 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 20% 20%, #1f5c40 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, #c9a22733 0%, transparent 45%)",
        }}
      />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <p className="font-display text-lg tracking-tight text-as-forest">
          AgroSolve
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-as-ink">Sign in</h1>
        <p className="mt-1 text-stone-600 text-sm">
          Manage your livestock farm and marketplace.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="text-stone-700">Email</span>
            <input
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
              type="email"
              placeholder="you@farm.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm">
            <span className="text-stone-700">Password</span>
            <input
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-as-forest px-4 py-2.5 text-white font-medium hover:bg-as-moss disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-4 text-sm text-stone-600">
          No account?{" "}
          <Link href="/register" className="text-as-forest font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
