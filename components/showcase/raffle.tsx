"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Submission } from "@/lib/showcase-types";

const ITEM_H = 96; // px per reel row
const VISIBLE = 5; // rows shown in the window
const REEL_H = ITEM_H * VISIBLE;
const CENTER = REEL_H / 2;
const SPIN_ROWS = 44; // decoy rows that fly past before the winner lands
const SPIN_MS = 5200;

function screenshotFallback(url: string): string {
  return `https://s.wordpress.com/mshots/v1/${encodeURIComponent(url)}?w=1200&h=900`;
}

type Phase = "idle" | "spinning" | "done";

export function Raffle({
  submissions,
  onClose,
}: {
  submissions: Submission[];
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [reel, setReel] = useState<Submission[]>([]);
  const [offset, setOffset] = useState(0);
  const [duration, setDuration] = useState(0);
  const [winner, setWinner] = useState<Submission | null>(null);

  // Idle teaser shows the real entries only — no padding repeats.
  const idleReel = submissions;
  // Center the real entries within the window (works for 1 or many).
  const idleOffset = useMemo(
    () => (idleReel.length * ITEM_H) / 2 - CENTER,
    [idleReel.length],
  );

  const shown = phase === "idle" ? idleReel : reel;
  const renderOffset = phase === "idle" ? idleOffset : offset;

  const fireConfetti = useCallback(async () => {
    const confetti = (await import("canvas-confetti")).default;
    const colors = ["#2f6bf2", "#3f7bef", "#0e2859", "#ffe7a3", "#ffffff"];
    confetti({ particleCount: 180, spread: 100, startVelocity: 45, origin: { y: 0.62 }, colors });
    const end = Date.now() + 1400;
    (function frame() {
      confetti({ particleCount: 5, angle: 60, spread: 72, origin: { x: 0 }, colors });
      confetti({ particleCount: 5, angle: 120, spread: 72, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, []);

  const start = useCallback(() => {
    if (submissions.length === 0 || phase === "spinning") return;
    // Pick the winner, then build a reel that ends on them.
    const win = submissions[Math.floor(Math.random() * submissions.length)];
    const rows: Submission[] = [];
    for (let i = 0; i < SPIN_ROWS; i++) {
      rows.push(submissions[Math.floor(Math.random() * submissions.length)]);
    }
    rows.push(win); // winner is the final row
    const target = (rows.length - 1) * ITEM_H + ITEM_H / 2 - CENTER;

    setWinner(null);
    setReel(rows);
    setPhase("spinning");
    setDuration(0);
    setOffset(0);
    // Two rAFs so the browser commits offset=0 before we animate to target.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setDuration(SPIN_MS);
        setOffset(target);
        window.setTimeout(() => {
          setPhase("done");
          setWinner(win);
          fireConfetti();
        }, SPIN_MS + 60);
      }),
    );
  }, [submissions, phase, fireConfetti]);

  // Keyboard: Space spins / re-spins, Escape closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.code === "Space") {
        e.preventDefault();
        if (phase !== "spinning") start();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, start, onClose]);

  return (
    <div className="fixed inset-0 z-[120] flex flex-col bg-beige/95 backdrop-blur-xl">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-5">
        <span className="w-10" />
        <span className="text-[0.82rem] font-extrabold uppercase tracking-[0.3em] text-muted">
          Raffle
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close raffle"
          className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-muted transition-colors hover:text-navy"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Reel */}
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="relative w-full max-w-[720px]">
          {/* center highlight band */}
          <div
            className="pointer-events-none absolute inset-x-0 top-1/2 z-20 -translate-y-1/2 rounded-2xl border-2 border-dashed border-blue-line"
            style={{ height: ITEM_H }}
          />
          <div
            className="relative overflow-hidden"
            style={{
              height: REEL_H,
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent 0%, #000 26%, #000 74%, transparent 100%)",
              maskImage:
                "linear-gradient(to bottom, transparent 0%, #000 26%, #000 74%, transparent 100%)",
            }}
          >
            <div
              className="absolute inset-x-0 top-0"
              style={{
                transform: `translateY(${-renderOffset}px)`,
                transition:
                  phase === "spinning" && duration
                    ? `transform ${duration}ms cubic-bezier(0.09, 0.78, 0.15, 1)`
                    : "none",
              }}
            >
              {shown.map((s, i) => {
                const isWinnerRow = phase === "done" && i === shown.length - 1;
                return (
                  <ReelRow key={`${s.id}-${i}`} s={s} highlight={isWinnerRow} />
                );
              })}
            </div>
          </div>
        </div>

        {/* Controls / winner */}
        <div className="mt-8 flex min-h-[120px] w-full max-w-[720px] flex-col items-center">
          {phase === "done" && winner ? (
            <WinnerPanel winner={winner} onAgain={start} />
          ) : (
            <>
              <button
                type="button"
                onClick={start}
                disabled={phase === "spinning" || submissions.length === 0}
                className="rounded-2xl px-14 py-4 text-[1.1rem] font-extrabold text-white shadow-[0_12px_30px_rgba(14,40,89,0.3)] transition-transform hover:-translate-y-0.5 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#0e2859 0%,#143a7e 100%)" }}
              >
                {phase === "spinning" ? "Spinning…" : "Start"}
              </button>
              <p className="mt-4 text-[0.88rem] text-muted">
                {submissions.length} {submissions.length === 1 ? "project" : "projects"} in the
                raffle · press{" "}
                <kbd className="rounded-md border border-line bg-white px-2 py-0.5 font-mono text-[0.8rem] font-bold text-navy">
                  Space
                </kbd>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ReelRow({ s, highlight }: { s: Submission; highlight: boolean }) {
  const [failed, setFailed] = useState(false);
  const img = !failed && s.image_url ? s.image_url : screenshotFallback(s.url);
  return (
    <div
      className={`flex items-center gap-4 px-4 transition-[transform,opacity] ${
        highlight ? "scale-[1.02]" : ""
      }`}
      style={{ height: ITEM_H }}
    >
      <div className="h-[72px] w-[120px] shrink-0 overflow-hidden rounded-xl border border-line bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover object-top"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-[0.82rem] text-muted">
          {s.favicon_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={s.favicon_url}
              alt=""
              className="h-4 w-4 rounded"
              onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
            />
          )}
          <span className="truncate">{s.domain ?? s.url}</span>
        </div>
        <div className="truncate text-[1.25rem] font-extrabold leading-snug text-navy">
          {s.title}
        </div>
      </div>
    </div>
  );
}

function WinnerPanel({ winner, onAgain }: { winner: Submission; onAgain: () => void }) {
  return (
    <div className="anim-rise flex w-full flex-col items-center text-center">
      <span className="text-[0.82rem] font-extrabold uppercase tracking-[0.28em] text-blue">
        🎉 Up next on stage
      </span>
      <h2 className="mt-1.5 text-[1.9rem] font-extrabold leading-tight text-navy">
        {winner.title}
      </h2>
      <a
        href={winner.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 font-mono text-[0.95rem] font-bold text-blue hover:underline"
      >
        {winner.domain ?? winner.url}
      </a>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
        <a
          href={winner.url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full px-7 py-3 font-bold text-white shadow-[0_10px_24px_rgba(36,101,222,0.34)] transition-transform hover:-translate-y-0.5 active:scale-[0.97]"
          style={{ background: "linear-gradient(135deg,#2f6bf2 0%,#3f7bef 100%)" }}
        >
          Open &amp; present ↗
        </a>
        <button
          type="button"
          onClick={onAgain}
          className="rounded-full border border-line bg-white px-6 py-3 font-bold text-navy transition-colors hover:bg-beige"
        >
          Spin again
        </button>
      </div>
    </div>
  );
}
