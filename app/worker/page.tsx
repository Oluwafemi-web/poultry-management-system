"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function WorkerHome() {
  const { data } = useSession();

  return (
    <div className="min-h-screen bg-stone-100">
      <header className="bg-emerald-950 text-white px-4 py-4 flex justify-between items-center">
        <div>
          <p className="font-display tracking-tight">AgroSolve Worker</p>
          <p className="text-xs text-emerald-200">{data?.user?.name}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/signin" })}
          className="text-sm text-emerald-100"
        >
          Sign out
        </button>
      </header>
      <main className="p-4 max-w-lg mx-auto space-y-4">
        <h1 className="text-xl font-semibold text-stone-900 mt-2">
          Today&apos;s work
        </h1>
        <p className="text-sm text-stone-600">
          Log farm activities quickly from your phone.
        </p>
        <Link
          href="/worker/activities"
          className="block rounded-2xl bg-emerald-800 text-white text-center py-4 text-lg font-medium"
        >
          Log daily activity
        </Link>
        <Link
          href="/worker/activities?type=FEED"
          className="block rounded-2xl bg-white border p-4 text-stone-900"
        >
          Record feed given
        </Link>
        <Link
          href="/worker/activities?type=MORTALITY"
          className="block rounded-2xl bg-white border p-4 text-stone-900"
        >
          Record mortality
        </Link>
        <Link
          href="/worker/activities?type=PRODUCTION"
          className="block rounded-2xl bg-white border p-4 text-stone-900"
        >
          Record production
        </Link>
      </main>
    </div>
  );
}
