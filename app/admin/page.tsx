"use client";

import { useEffect, useState } from "react";
import type { Submission } from "@/lib/showcase-types";

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null); // null = checking
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/submissions");
    if (res.status === 401) {
      setAuthed(false);
    } else if (res.ok) {
      const data = await res.json();
      setSubmissions(data.submissions ?? []);
      setAuthed(true);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoggingIn(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setLoginError(data.error ?? "Wrong password.");
      return;
    }
    setPassword("");
    load();
  }

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
    setSubmissions([]);
  }

  async function remove(id: string) {
    if (!confirm("Delete this submission? This can't be undone.")) return;
    setDeletingId(id);
    const res = await fetch(`/api/admin/submissions?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    setDeletingId(null);
    if (res.ok) {
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
    }
  }

  if (authed === null) {
    return <main className="mx-auto max-w-[720px] px-6 py-16 text-muted">Loading…</main>;
  }

  if (!authed) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-[420px] flex-col justify-center px-6">
        <h1 className="mb-1 text-[1.4rem] font-extrabold text-navy">Admin</h1>
        <p className="mb-4 text-muted">Enter the admin password to manage showcase posts.</p>
        <form onSubmit={login} className="flex flex-col gap-3">
          <input
            type="password"
            required
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="rounded-xl border border-line bg-beige px-4 py-3 text-[1rem] outline-none focus:border-blue-line focus:bg-white"
          />
          {loginError && (
            <p className="text-[0.85rem] font-semibold text-warn-ink">{loginError}</p>
          )}
          <button
            type="submit"
            disabled={loggingIn}
            className="rounded-full py-3 font-bold text-white disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#2f6bf2 0%,#3f7bef 100%)" }}
          >
            {loggingIn ? "Checking…" : "Sign in"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[900px] px-6 py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="mb-1 text-[1.4rem] font-extrabold text-navy">Admin · Showcase posts</h1>
          <p className="text-muted">
            {loading
              ? "Loading…"
              : `${submissions.length} submission${submissions.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="flex-none rounded-full border border-line px-4 py-2 text-[0.85rem] font-bold text-navy hover:bg-beige"
        >
          Sign out
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {submissions.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-line bg-white px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-navy">{s.title}</p>
              <p className="truncate text-[0.85rem] text-muted">
                {s.author_name || "Not provided"} · {s.domain} ·{" "}
                {new Date(s.created_at).toLocaleString()}
              </p>
            </div>
            <button
              type="button"
              onClick={() => remove(s.id)}
              disabled={deletingId === s.id}
              className="flex-none rounded-full border border-warn-line bg-warn-bg px-4 py-2 text-[0.85rem] font-bold text-warn-ink disabled:opacity-60"
            >
              {deletingId === s.id ? "Deleting…" : "Delete"}
            </button>
          </div>
        ))}
        {!loading && submissions.length === 0 && <p className="text-muted">No submissions yet.</p>}
      </div>
    </main>
  );
}
