"use client";

import { usePathname } from "next/navigation";
import { CONTENT } from "@/lib/content";

export function Footer() {
  const pathname = usePathname();
  if (pathname === "/") return null; // full-screen hero has no footer
  return (
    <footer className="px-4 pb-14 pt-9 text-center text-[0.9rem] text-muted">
      {CONTENT.meta.brand} · Build with AI — Manila · Keep this tab open during the
      session.
    </footer>
  );
}
