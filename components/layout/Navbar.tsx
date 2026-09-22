"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import posthog from "posthog-js";
import { signOutAction, checkAuthAction } from "@/app/actions/auth";
import { LogOut, LayoutGrid, Search, User } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    async function checkAuth() {
      const loggedIn = await checkAuthAction();
      setIsAuthenticated(loggedIn);
    }
    checkAuth();
  }, []);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutGrid },
    { name: "Find Jobs", href: "/find-jobs", icon: Search },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface px-6 h-16 flex items-center justify-between">
      <div className="flex items-center max-w-[1440px] w-full mx-auto justify-between h-full">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="JobPilot"
            width={118}
            height={40}
            priority
            className="h-8 md:h-9 w-auto object-contain"
          />
        </Link>

        {/* Navigation links & right actions */}
        <div className="flex items-center gap-6 md:gap-8 h-full">
          <nav className="flex items-center gap-6 md:gap-8 h-full">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative flex items-center gap-2 text-sm font-medium transition-colors h-full ${
                    isActive
                      ? "text-accent"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-accent" : "text-text-secondary"}`} />
                  <span className="hidden sm:inline">{item.name}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Auth Action */}
          <div className="flex items-center pl-2 border-l border-border-light">
            {isAuthenticated ? (
              <button
                onClick={async () => {
                  posthog.reset();
                  await signOutAction();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-md text-xs font-medium text-text-secondary bg-surface hover:bg-surface-secondary hover:text-error hover:border-error/30 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => posthog.capture("nav_cta_clicked", { label: "login" })}
                className="inline-flex items-center justify-center rounded-md bg-overlay px-4 py-1.5 text-xs font-medium text-white hover:bg-overlay-dark transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

