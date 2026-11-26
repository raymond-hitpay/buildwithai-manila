"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import type { LinkPreview, Reaction, Submission, Vote } from "@/lib/showcase-types";
import { useAuth } from "@/components/auth-provider";
import { SubmissionCard } from "./submission-card";
import { QrCode } from "./qr-code";
import { Raffle } from "./raffle";

type Sort = "top" | "new";

export function ShowcaseClient() {
  const supabase = getSupabase();

  // --- auth (shared via top-nav context) -----------------------------------
  const { user, requireAuth } = useAuth();

  // --- data ----------------------------------------------------------------
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<Sort>("top");

  // --- submit / compose ----------------------------------------------------
  const [linkInput, setLinkInput] = useState("");
  const [preview, setPreview] = useState<LinkPreview | null>(null);
  const [composeTitle, setComposeTitle] = useState("");
  const [composeDesc, setComposeDesc] = useState("");
  const [previewing, setPreviewing] = useState(false);
  const [posting, setPosting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // --- QR ------------------------------------------------------------------
  const [showJoin, setShowJoin] = useState(false);
  const [qrModal, setQrModal] = useState<Submission | null>(null);
  const [raffleOpen, setRaffleOpen] = useState(false);
  const [pageUrl, setPageUrl] = useState("");

  useEffect(() => {
    setPageUrl(window.location.origin + "/showcase");
  }, []);

  // --- load all three tables ----------------------------------------------
  const reload = useCallback(async () => {
    if (!supabase) return;
    try {
      const [subs, vts, rcts] = await Promise.all([
        supabase.from("submissions").select("*").order("created_at", { ascending: false }),
        supabase.from("votes").select("submission_id,user_id"),
        supabase.from("reactions").select("submission_id,user_id,emoji"),
      ]);
      if (subs.data) setSubmissions(subs.data as Submission[]);
      if (vts.data) setVotes(vts.data as Vote[]);
      if (rcts.data) setReactions(rcts.data as Reaction[]);
    } catch {
      // Network/permission error — leave any data we already have in place.
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // stop the loading skeleton when Supabase isn't configured
  useEffect(() => {
    if (!supabase) setLoading(false);
  }, [supabase]);

  // initial load + realtime
  const reloadRef = useRef(reload);
  reloadRef.current = reload;
  useEffect(() => {
    if (!supabase) return;
    reload();
    let timer: ReturnType<typeof setTimeout> | null = null;
    const debounced = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => reloadRef.current(), 250);
    };
    const channel = supabase
      .channel("showcase-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "submissions" }, debounced)
      .on("postgres_changes", { event: "*", schema: "public", table: "votes" }, debounced)
      .on("postgres_changes", { event: "*", schema: "public", table: "reactions" }, debounced)
      .subscribe();
    return () => {
      if (timer) clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [supabase, reload]);

  // close QR modal on Escape
  useEffect(() => {
    if (!qrModal) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setQrModal(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [qrModal]);

  // --- aggregates ----------------------------------------------------------
  const voteCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const v of votes) m[v.submission_id] = (m[v.submission_id] ?? 0) + 1;
    return m;
  }, [votes]);

  const myVotes = useMemo(() => {
    const s = new Set<string>();
    if (user) for (const v of votes) if (v.user_id === user.id) s.add(v.submission_id);
    return s;
  }, [votes, user]);

  const reactionCounts = useMemo(() => {
    const m: Record<string, Record<string, number>> = {};
    for (const r of reactions) {
      (m[r.submission_id] ??= {})[r.emoji] = (m[r.submission_id]?.[r.emoji] ?? 0) + 1;
    }
    return m;
  }, [reactions]);

  const myReactions = useMemo(() => {
    const m: Record<string, Set<string>> = {};
    if (user) {
      for (const r of reactions) {
        if (r.user_id === user.id) (m[r.submission_id] ??= new Set()).add(r.emoji);
      }
    }
    return m;
  }, [reactions, user]);

  const sorted = useMemo(() => {
    const list = [...submissions];
    if (sort === "top") {
      list.sort((a, b) => {
        const diff = (voteCounts[b.id] ?? 0) - (voteCounts[a.id] ?? 0);
        if (diff !== 0) return diff;
        return +new Date(b.created_at) - +new Date(a.created_at);
      });
    } else {
      list.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    }
    return list;
  }, [submissions, sort, voteCounts]);

  // --- actions -------------------------------------------------------------
  async function onAddLink(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    if (!linkInput.trim()) return;
    if (!requireAuth()) return;
    setPreviewing(true);
    setPreview(null);
    try {
      const res = await fetch(`/api/preview?url=${encodeURIComponent(linkInput.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Couldn't read that link.");
        setPreviewing(false);
        return;
      }
      setPreview(data as LinkPreview);
      setComposeTitle(data.title ?? "");
      setComposeDesc(data.description ?? "");
    } catch {
      setSubmitError("Couldn't reach that link. Check the URL and try again.");
    }
    setPreviewing(false);
  }

  function cancelCompose() {
    setPreview(null);
    setComposeTitle("");
    setComposeDesc("");
    setLinkInput("");
    setSubmitError("");
  }

  async function onPost() {
    if (!supabase || !user || !preview) return;
    if (!composeTitle.trim()) {
      setSubmitError("Give it a title.");
      return;
    }
    setPosting(true);
    setSubmitError("");
    const authorName =
      (user.user_metadata?.name as string | undefined) ??
      user.email?.split("@")[0] ??
      "Builder";
    const { error } = await supabase.from("submissions").insert({
      url: preview.url,
      title: composeTitle.trim().slice(0, 160),
      description: composeDesc.trim().slice(0, 400) || null,
      image_url: preview.image,
      favicon_url: preview.favicon,
      domain: preview.domain,
      user_id: user.id,
      author_name: authorName,
    });
    setPosting(false);
    if (error) {
      setSubmitError(error.message);
      return;
    }
    cancelCompose();
    reload();
  }

  async function toggleVote(s: Submission) {
    if (!supabase || !requireAuth() || !user) return;
    const voted = myVotes.has(s.id);
    // optimistic
    setVotes((prev) =>
      voted
        ? prev.filter((v) => !(v.submission_id === s.id && v.user_id === user.id))
        : [...prev, { submission_id: s.id, user_id: user.id }],
    );
    const { error } = voted
      ? await supabase.from("votes").delete().eq("submission_id", s.id).eq("user_id", user.id)
      : await supabase.from("votes").insert({ submission_id: s.id, user_id: user.id });
    if (error) reload();
  }

  async function toggleReaction(s: Submission, emoji: string) {
    if (!supabase || !requireAuth() || !user) return;
    const has = myReactions[s.id]?.has(emoji) ?? false;
    setReactions((prev) =>
      has
        ? prev.filter(
            (r) => !(r.submission_id === s.id && r.user_id === user.id && r.emoji === emoji),
          )
        : [...prev, { submission_id: s.id, user_id: user.id, emoji }],
    );
    const { error } = has
      ? await supabase
          .from("reactions")
          .delete()
          .eq("submission_id", s.id)
          .eq("user_id", user.id)
          .eq("emoji", emoji)
      : await supabase.from("reactions").insert({ submission_id: s.id, user_id: user.id, emoji });
    if (error) reload();
  }

  async function deleteSubmission(s: Submission) {
    if (!supabase || !user) return;
    if (!window.confirm("Remove your submission from the showcase?")) return;
    setSubmissions((prev) => prev.filter((x) => x.id !== s.id));
    const { error } = await supabase.from("submissions").delete().eq("id", s.id);
    if (error) reload();
  }

  // --- not configured ------------------------------------------------------
  if (!isSupabaseConfigured) {
    return <NotConfigured />;
  }

  return (
    <div className="pb-24">
      {/* Header band */}
      <header
        className="border-b border-line px-4 pb-6 pt-[calc(var(--topnav-h)+22px)]"
        style={{ background: "linear-gradient(180deg,#dbe8fb 0%,#f3f6fb 100%)" }}
      >
        <div className="wrap flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[1.35rem] font-extrabold leading-tight text-navy sm:text-[1.5rem]">
              Build with AI · Showcase
            </div>
            <div className="text-[0.9rem] font-semibold text-muted">
              Build it, share it, vote!
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRaffleOpen(true)}
              disabled={submissions.length === 0}
              title="Draw a project to present"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-[0.88rem] font-bold text-navy transition-colors hover:border-blue-line hover:bg-blue-soft disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span aria-hidden>🎲</span>
              Raffle
            </button>
            <button
              type="button"
              onClick={() => setShowJoin((v) => !v)}
              className="inline-flex items-center gap-2 rounded-full border border-blue-line bg-white px-4 py-2 text-[0.88rem] font-bold text-blue transition-colors hover:bg-blue-soft"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 3h3m-3 3h6m0-6v3m0 0h-3"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Scan to join
            </button>
          </div>
        </div>

        {/* Scan to join panel */}
        {showJoin && pageUrl && (
          <div className="wrap mt-5 flex flex-col items-center gap-5 rounded-[var(--radius-card)] border border-line bg-white p-5 sm:flex-row sm:p-6">
            <QrCode value={pageUrl} size={150} />
            <div className="text-center sm:text-left">
              <h2 className="text-[1.5rem] font-extrabold text-navy">Scan to join</h2>
              <p className="mt-1 max-w-[42ch] text-muted">
                Add a link, react and upvote from your phone. Everything updates live.
              </p>
              <code className="mt-3 inline-block rounded-lg bg-beige px-3 py-1.5 font-mono text-[0.9rem] font-bold text-navy">
                {pageUrl.replace(/^https?:\/\//, "")}
              </code>
            </div>
          </div>
        )}
      </header>

      <main className="wrap px-4 pt-7">
        {/* Submit bar */}
        <form onSubmit={onAddLink}>
          <div className="flex items-center gap-2 rounded-2xl border border-line bg-white p-2 shadow-card">
            <span className="pl-2 text-muted" aria-hidden>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M10 14a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1 1M14 10a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1-1"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <input
              type="text"
              inputMode="url"
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              placeholder="Paste a link to add it…"
              className="min-w-0 flex-1 bg-transparent py-2.5 text-[1rem] text-ink outline-none placeholder:text-muted"
            />
            <button
              type="submit"
              disabled={previewing || !linkInput.trim()}
              className="rounded-xl px-5 py-2.5 text-[0.9rem] font-bold text-white transition-transform hover:-translate-y-0.5 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#0e2859 0%,#143a7e 100%)" }}
            >
              {previewing ? "Reading…" : "Add"}
            </button>
          </div>
          {submitError && !preview && (
            <p className="mt-2 px-1 text-[0.85rem] font-semibold text-warn-ink">{submitError}</p>
          )}
        </form>

        {/* Compose panel (edit title + description before posting) */}
        {preview && (
          <div className="mt-3 overflow-hidden rounded-[var(--radius-card)] border border-blue-line bg-white shadow-card">
            <div className="grid gap-4 p-4 sm:grid-cols-[200px_1fr]">
              <div className="overflow-hidden rounded-xl border border-line bg-beige">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview.image ?? ""}
                  alt=""
                  className="aspect-[16/10] w-full object-cover object-top"
                />
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[0.82rem] font-semibold text-muted">
                  {preview.favicon && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview.favicon} alt="" className="h-4 w-4 rounded" />
                  )}
                  <span className="truncate">{preview.domain}</span>
                </div>
                <label className="block">
                  <span className="mb-1 block text-[0.78rem] font-bold uppercase tracking-wide text-muted">
                    Title
                  </span>
                  <input
                    value={composeTitle}
                    onChange={(e) => setComposeTitle(e.target.value)}
                    maxLength={160}
                    placeholder="Name your project"
                    className="w-full rounded-lg border border-line bg-beige px-3 py-2 text-[0.95rem] font-bold text-navy outline-none focus:border-blue-line focus:bg-white"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[0.78rem] font-bold uppercase tracking-wide text-muted">
                    Description
                  </span>
                  <textarea
                    value={composeDesc}
                    onChange={(e) => setComposeDesc(e.target.value)}
                    maxLength={400}
                    rows={2}
                    placeholder="What does it do? Who's it for?"
                    className="w-full resize-none rounded-lg border border-line bg-beige px-3 py-2 text-[0.92rem] text-ink outline-none focus:border-blue-line focus:bg-white"
                  />
                </label>
                {submitError && (
                  <p className="text-[0.85rem] font-semibold text-warn-ink">{submitError}</p>
                )}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onPost}
                    disabled={posting}
                    className="rounded-full px-6 py-2.5 text-[0.9rem] font-bold text-white transition-transform hover:-translate-y-0.5 active:scale-[0.97] disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg,#2f6bf2 0%,#3f7bef 100%)" }}
                  >
                    {posting ? "Posting…" : "Post to showcase"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelCompose}
                    className="rounded-full px-4 py-2.5 text-[0.9rem] font-bold text-muted transition-colors hover:bg-beige hover:text-navy"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="mt-8 mb-5 flex items-center justify-between">
          <div className="inline-flex rounded-full border border-line bg-white p-1">
            {(["top", "new"] as Sort[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSort(s)}
                className={`rounded-full px-4 py-1.5 text-[0.88rem] font-bold capitalize transition-colors ${
                  sort === s ? "bg-navy text-white" : "text-muted hover:text-navy"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <span className="text-[0.88rem] font-semibold text-muted">
            {submissions.length} {submissions.length === 1 ? "project" : "projects"}
          </span>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[320px] animate-pulse rounded-[var(--radius-card)] border border-line bg-white"
              />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <EmptyState onAdd={() => document.querySelector<HTMLInputElement>("input[inputmode='url']")?.focus()} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((s) => (
              <SubmissionCard
                key={s.id}
                submission={s}
                voteCount={voteCounts[s.id] ?? 0}
                votedByMe={myVotes.has(s.id)}
                reactionCounts={reactionCounts[s.id] ?? {}}
                myReactions={myReactions[s.id] ?? new Set()}
                isOwner={user?.id === s.user_id}
                onVote={() => toggleVote(s)}
                onReact={(emoji) => toggleReaction(s, emoji)}
                onShowQr={() => setQrModal(s)}
                onDelete={() => deleteSubmission(s)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Raffle / tombola */}
      {raffleOpen && <Raffle submissions={submissions} onClose={() => setRaffleOpen(false)} />}

      {/* Per-submission QR modal */}
      {qrModal && (
        <Backdrop onClose={() => setQrModal(null)}>
          <div className="w-full max-w-[360px] rounded-[var(--radius-card)] bg-white p-6 text-center shadow-lg">
            <div className="flex justify-center">
              <QrCode value={qrModal.url} size={190} />
            </div>
            <h2 className="mt-4 text-[1.2rem] font-extrabold text-navy">Open on your phone</h2>
            <p className="mt-1 line-clamp-1 text-[0.9rem] font-semibold text-muted">
              {qrModal.title}
            </p>
            <a
              href={qrModal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block w-full rounded-full py-2.5 font-bold text-white"
              style={{ background: "linear-gradient(135deg,#2f6bf2 0%,#3f7bef 100%)" }}
            >
              Open site ↗
            </a>
            <button
              type="button"
              onClick={() => setQrModal(null)}
              className="mt-2 w-full rounded-full border border-line py-2.5 font-bold text-navy hover:bg-beige"
            >
              Close
            </button>
          </div>
        </Backdrop>
      )}
    </div>
  );
}

function Backdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-dashed border-blue-line bg-white/60 py-16 text-center">
      <span className="mb-2 block text-5xl">🚀</span>
      <h2 className="text-[1.4rem] font-extrabold text-navy">Be the first to share</h2>
      <p className="mx-auto mt-1.5 max-w-[42ch] text-muted">
        Paste a link to the site you built today. Everyone can react and upvote — live.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-5 rounded-full px-6 py-3 font-bold text-white shadow-[0_8px_20px_rgba(36,101,222,0.32)]"
        style={{ background: "linear-gradient(135deg,#2f6bf2 0%,#3f7bef 100%)" }}
      >
        Add your project
      </button>
    </div>
  );
}

function NotConfigured() {
  return (
    <main className="wrap px-4 pb-24 pt-[calc(var(--topnav-h)+48px)]">
      <div className="mx-auto max-w-[640px] rounded-[var(--radius-card)] border border-warn-line bg-warn-bg p-7">
        <span className="mb-2 block text-4xl">🔧</span>
        <h1 className="text-[1.5rem] font-extrabold text-navy">Showcase needs Supabase</h1>
        <p className="mt-2 text-warn-ink">
          Set your Supabase keys to turn the Showcase on. Copy{" "}
          <code className="rounded bg-white/70 px-1.5 py-0.5 font-mono text-[0.85rem]">
            .env.local.example
          </code>{" "}
          to{" "}
          <code className="rounded bg-white/70 px-1.5 py-0.5 font-mono text-[0.85rem]">
            .env.local
          </code>
          , fill in both values, then restart the dev server.
        </p>
        <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-[0.95rem] text-ink">
          <li>
            Run <code className="font-mono text-[0.85rem]">supabase/schema.sql</code> in your
            Supabase SQL editor.
          </li>
          <li>
            Add <code className="font-mono text-[0.85rem]">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code className="font-mono text-[0.85rem]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to{" "}
            <code className="font-mono text-[0.85rem]">.env.local</code>.
          </li>
          <li>
            In Supabase → Authentication → URL Configuration, add this site&apos;s URL +{" "}
            <code className="font-mono text-[0.85rem]">/showcase</code> to the redirect allow-list.
          </li>
        </ol>
      </div>
    </main>
  );
}
