"use client";

import { useState } from "react";
import type { Submission } from "@/lib/showcase-types";
import { REACTION_EMOJIS } from "@/lib/showcase-types";

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const secs = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function screenshotFallback(url: string): string {
  return `https://s.wordpress.com/mshots/v1/${encodeURIComponent(url)}?w=1200&h=900`;
}

export function SubmissionCard({
  submission: s,
  voteCount,
  votedByMe,
  reactionCounts,
  myReactions,
  isOwner,
  refreshing,
  onVote,
  onReact,
  onShowQr,
  onDelete,
  onRefresh,
}: {
  submission: Submission;
  voteCount: number;
  votedByMe: boolean;
  reactionCounts: Record<string, number>;
  myReactions: Set<string>;
  isOwner: boolean;
  refreshing: boolean;
  onVote: () => void;
  onReact: (emoji: string) => void;
  onShowQr: () => void;
  onDelete: () => void;
  onRefresh: () => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const img = !imgFailed && s.image_url ? s.image_url : screenshotFallback(s.url);

  return (
    <article className="group flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-white shadow-card transition-transform hover:-translate-y-0.5 hover:shadow-lg">
      {/* Preview image → opens the actual site */}
      <a
        href={s.url}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block aspect-[16/10] overflow-hidden bg-beige"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img}
          alt={s.title}
          loading="lazy"
          onError={() => setImgFailed(true)}
          className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <span className="pointer-events-none absolute right-2.5 top-2.5 translate-y-1 rounded-full bg-navy/85 px-2.5 py-1 text-[0.72rem] font-bold text-white opacity-0 backdrop-blur-sm transition-all group-hover:translate-y-0 group-hover:opacity-100">
          Open site ↗
        </span>
      </a>

      <div className="flex flex-1 flex-col p-4">
        {/* Domain + favicon + QR */}
        <div className="mb-1.5 flex items-center gap-2 text-[0.82rem] text-muted">
          {s.favicon_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={s.favicon_url}
              alt=""
              width={16}
              height={16}
              className="h-4 w-4 rounded-[4px]"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : null}
          <span className="truncate font-semibold">{s.domain ?? s.url}</span>
          <button
            type="button"
            onClick={onShowQr}
            title="Open on your phone"
            aria-label="Show QR to open on phone"
            className="ml-auto flex-none rounded-full border border-line p-1.5 text-muted transition-colors hover:border-blue-line hover:bg-blue-soft hover:text-blue"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 3h3m-3 3h6m0-6v3m0 0h-3"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <a
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[1.05rem] font-extrabold leading-snug text-navy hover:text-blue"
        >
          {s.title}
        </a>

        {s.description && (
          <p className="mt-1.5 line-clamp-3 text-[0.92rem] text-muted">{s.description}</p>
        )}

        {/* Reactions + upvote (same row) */}
        <div className="mt-3 flex items-center gap-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {REACTION_EMOJIS.map((emoji) => {
              const count = reactionCounts[emoji] ?? 0;
              const mine = myReactions.has(emoji);
              return (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onReact(emoji)}
                  aria-pressed={mine}
                  title={`React ${emoji}`}
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[0.8rem] font-bold leading-none transition-colors ${
                    mine
                      ? "border-blue-line bg-blue-soft text-blue"
                      : "border-line bg-white text-muted hover:border-blue-line hover:bg-blue-soft/50"
                  }`}
                >
                  <span className="text-[0.95rem]">{emoji}</span>
                  {count > 0 && <span className="tabular-nums">{count}</span>}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={onVote}
            aria-pressed={votedByMe}
            title="Upvote"
            className={`ml-auto flex-none inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-[0.85rem] font-extrabold leading-none transition-colors ${
              votedByMe
                ? "border-blue bg-blue text-white shadow-[0_6px_16px_rgba(36,101,222,0.3)]"
                : "border-line bg-white text-navy hover:border-blue-line hover:bg-blue-soft"
            }`}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 5l7 8h-4v6H9v-6H5l7-8Z" fill="currentColor" />
            </svg>
            <span className="tabular-nums">{voteCount}</span>
          </button>
        </div>

        {/* Footer: author/time + delete (owner, on hover) */}
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-3">
          <div className="flex min-w-0 items-center gap-2 text-[0.8rem] text-muted">
            <span className="truncate font-semibold text-ink">
              {s.author_name ?? "Someone"}
            </span>
            <span aria-hidden>·</span>
            <span className="whitespace-nowrap">{timeAgo(s.created_at)}</span>
          </div>

          {isOwner && (
            <div className="flex flex-none items-center gap-1.5">
              <button
                type="button"
                onClick={onRefresh}
                disabled={refreshing}
                title="Refresh preview"
                aria-label="Refresh preview"
                className="rounded-full border border-line p-2 text-muted opacity-0 transition-all hover:border-blue-line hover:bg-blue-soft hover:text-blue focus-visible:opacity-100 group-hover:opacity-100 disabled:opacity-100"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                  className={refreshing ? "animate-spin" : undefined}
                >
                  <path
                    d="M20 11a8 8 0 0 0-14.584-4.584M4 4v4h4M4 13a8 8 0 0 0 14.584 4.584M20 20v-4h-4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={onDelete}
                title="Delete your submission"
                aria-label="Delete submission"
                className="rounded-full border border-line p-2 text-muted opacity-0 transition-all hover:border-[#f3cf96] hover:bg-warn-bg hover:text-warn-ink focus-visible:opacity-100 group-hover:opacity-100"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m2 0-.6 12a2 2 0 0 1-2 1.9H8.6a2 2 0 0 1-2-1.9L6 7"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
