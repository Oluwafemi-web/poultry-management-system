"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [intent, setIntent] = useState<"farm" | "buyer" | "supplier">("farm");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, intent }),
    });
    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      setError(data.error || "Registration failed");
      return;
    }
    await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (intent === "farm") router.push("/onboarding");
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
        <h1 className="mt-2 text-3xl font-semibold text-as-ink">
          Create account
        </h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="text-stone-700">Full name</span>
            <input
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
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
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </label>
          <fieldset className="text-sm">
            <legend className="text-stone-700 mb-2">I want to</legend>
            {(
              [
                ["farm", "Set up my farm"],
                ["buyer", "Buy farm supplies"],
                ["supplier", "Sell as a supplier"],
              ] as const
            ).map(([value, label]) => (
              <label key={value} className="flex items-center gap-2 mb-1">
                <input
                  type="radio"
                  name="intent"
                  checked={intent === value}
                  onChange={() => setIntent(value)}
                />
                {label}
              </label>
            ))}
          </fieldset>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-as-forest px-4 py-2.5 text-white font-medium hover:bg-as-moss disabled:opacity-60"
          >
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>
        <p className="mt-4 text-sm text-stone-600">
          Already have an account?{" "}
          <Link href="/signin" className="text-as-forest font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
