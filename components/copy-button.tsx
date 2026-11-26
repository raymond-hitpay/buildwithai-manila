"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex items-center gap-2 rounded-full border-2 px-[22px] py-3 text-[1rem] font-bold transition-[color,background-color,border-color,transform] duration-150 active:scale-[0.96] ${
        copied
          ? "border-[#8fd6ab] bg-[#e7f7ee] text-[#157a43]"
          : "border-blue-line bg-white text-blue hover:border-blue hover:bg-blue-soft"
      }`}
      aria-live="polite"
    >
      <span aria-hidden>{copied ? "✓" : "📋"}</span>
      {copied ? "Copied ✓" : "Copy prompt"}
    </button>
  );
}
