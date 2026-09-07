"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const NAV: { href: string; label: string; modules?: string[] }[] = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/livestock", label: "Livestock", modules: ["LIVESTOCK"] },
  {
    href: "/app/inventory",
    label: "Inventory",
    modules: ["INVENTORY", "FEED", "MEDICINE"],
  },
  { href: "/app/activities", label: "Activities" },
  { href: "/app/employees", label: "Employees", modules: ["EMPLOYEES"] },
  { href: "/app/finances", label: "Finances", modules: ["EXPENSES", "SALES"] },
  { href: "/app/reports", label: "Analytics" },
  { href: "/marketplace", label: "Buy Supplies" },
  { href: "/livestock-market", label: "Livestock Market" },
  { href: "/app/listings", label: "My Listings", modules: ["SALES"] },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data } = useSession();
  const modules = (data?.user?.modules ?? []) as string[];

  const visible = NAV.filter((item) => {
    if (!item.modules) return true;
    return item.modules.some((m) => modules.includes(m));
  });

  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-as-forest p-4 text-as-mint">
      <div className="mb-8 px-2">
        <p className="font-display text-xl tracking-tight text-white">
          AgroSolve
        </p>
        <p className="mt-1 truncate text-xs text-white/55">
          {data?.user?.email}
        </p>
        <p className="text-xs text-as-mint/70">{data?.user?.farmRole}</p>
      </div>
      <nav className="flex-1 space-y-0.5">
        {visible.map((item) => {
          const active =
            item.href === "/app"
              ? pathname === "/app"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm transition ${
                active
                  ? "border-l-2 border-as-gold bg-white/10 pl-[10px] font-medium text-white"
                  : "border-l-2 border-transparent text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={() => signOut({ callbackUrl: "/signin" })}
        className="mt-4 px-3 py-2 text-left text-sm text-white/55 hover:text-white"
      >
        Sign out
      </button>
    </aside>
  );
}
