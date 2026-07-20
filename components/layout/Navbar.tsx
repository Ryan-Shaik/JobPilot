"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";
import { signOutAction } from "@/app/actions/auth";
import { LogOut } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Find Jobs", href: "/find-jobs" },
    { name: "Profile", href: "/profile" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface px-6 h-16 flex items-center justify-between">
      <div className="flex items-center max-w-[1440px] w-full mx-auto justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-[36px] w-[36px] rounded-[10px] bg-gradient-to-br from-[#7C5CFC] to-[#4A2EC5]" />
          <span className="text-[19px] font-bold text-text-darkest leading-[28px]">
            JobPilot
          </span>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  isActive
                    ? "text-accent"
                    : "text-[#4A5565] hover:text-text-primary"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div>
          <button
            onClick={async () => {
              posthog.reset();
              await signOutAction();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-md text-sm font-medium text-text-secondary bg-surface hover:bg-surface-secondary hover:text-error hover:border-error/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
