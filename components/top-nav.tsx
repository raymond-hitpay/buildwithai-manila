"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CONTENT } from "@/lib/content";
import { useAuth } from "@/components/auth-provider";

function hrefFor(id: string) {
  if (id === "home") return "/";
  return `/${id}`;
}

export function TopNav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { configured, user, displayName, openSignIn, signOut } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const initial = (displayName ?? "?").trim().charAt(0).toUpperCase() || "?";

  function activeId(): string {
    if (pathname === "/") return "home";
    if (pathname.startsWith("/resources")) return "resources";
    if (pathname.startsWith("/showcase")) return "showcase";
    return "";
  }
  const current = activeId();

  return (
    <nav
      aria-label="Primary"
      className={`fixed inset-x-0 top-0 z-[60] border-b backdrop-blur-md transition-colors ${
        isHome
          ? "border-transparent bg-white/35"
          : "border-line bg-beige/80"
      }`}
    >
      <div className="wrap flex h-[var(--topnav-h)] items-center justify-between px-4">
        <Link href="/" aria-label="HitPay — Home" className="flex items-center gap-2.5">
          <Image
            src="/hitpay-mark.svg"
            alt="HitPay"
            width={30}
            height={30}
            className="h-[30px] w-auto"
            priority
          />
          <span className="hidden text-[1.02rem] font-extrabold tracking-tight text-navy sm:inline">
            Build with AI
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="flex items-center gap-0.5">
            {CONTENT.topnav.map((n) => {
              const active = current === n.id;
              return (
                <Link
                  key={n.id}
                  href={hrefFor(n.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[0.9rem] font-bold transition-colors sm:px-[15px] sm:text-[0.95rem] ${
                    active
                      ? "bg-blue-soft text-blue"
                      : "text-muted hover:bg-[#eef1f7] hover:text-navy"
                  }`}
                >
                  {n.label}
                  {n.comingSoon && (
                    <span className="hidden rounded-full bg-blue-soft px-[7px] py-0.5 text-[0.6em] font-extrabold uppercase tracking-wider text-blue sm:inline">
                      Soon
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {configured &&
            (user ? (
              <div className="relative ml-1" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-label="Account"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[0.95rem] font-extrabold text-white shadow-[0_4px_12px_rgba(14,40,89,0.28)] ring-2 ring-white transition-transform hover:-translate-y-0.5 active:scale-95"
                  style={{ background: "linear-gradient(135deg,#2f6bf2 0%,#143a7e 100%)" }}
                >
                  {initial}
                </button>
                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-[calc(100%+8px)] w-56 overflow-hidden rounded-2xl border border-line bg-white shadow-lg"
                  >
                    <div className="border-b border-line px-4 py-3">
                      <div className="text-[0.7rem] font-bold uppercase tracking-wide text-muted">
                        Signed in as
                      </div>
                      <div className="truncate text-[0.92rem] font-bold text-navy">
                        {displayName}
                      </div>
                    </div>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        signOut();
                      }}
                      className="w-full px-4 py-3 text-left text-[0.9rem] font-bold text-muted transition-colors hover:bg-beige hover:text-navy"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={openSignIn}
                className="ml-1 rounded-full px-4 py-2 text-[0.9rem] font-bold text-white shadow-[0_6px_16px_rgba(36,101,222,0.3)] transition-transform hover:-translate-y-0.5 active:scale-[0.97] sm:text-[0.95rem]"
                style={{ background: "linear-gradient(135deg,#2f6bf2 0%,#3f7bef 100%)" }}
              >
                Sign in
              </button>
            ))}
        </div>
      </div>
    </nav>
  );
}
