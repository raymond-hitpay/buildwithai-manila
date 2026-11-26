"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function HeroCta({ label }: { label: string }) {
  const router = useRouter();

  // warm up the destination so the navigation is instant
  useEffect(() => {
    router.prefetch("/resources");
  }, [router]);

  return (
    <a
      href="/resources"
      aria-label={label}
      className="cta-glow group mt-2 inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-[clamp(1rem,1.6vw,1.12rem)] font-bold text-white transition-transform hover:-translate-y-0.5 active:scale-[0.96]"
      style={{ background: "linear-gradient(135deg,#2f6bf2 0%,#3f7bef 100%)" }}
    >
      {label}
      <span
        aria-hidden
        className="inline-block transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
      >
        🚀
      </span>
    </a>
  );
}
