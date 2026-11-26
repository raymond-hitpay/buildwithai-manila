"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

type AuthContextValue = {
  configured: boolean;
  user: User | null;
  displayName: string | undefined;
  /** Returns true if signed in; otherwise opens the sign-in modal and returns false. */
  requireAuth: () => boolean;
  openSignIn: () => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = getSupabase();

  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [authState, setAuthState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setUser(session?.user ?? null);
      if (session?.user) setAuthOpen(false);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  const openSignIn = useCallback(() => setAuthOpen(true), []);

  const requireAuth = useCallback(() => {
    if (!user) {
      setAuthOpen(true);
      return false;
    }
    return true;
  }, [user]);

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut();
  }, [supabase]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !email.trim()) return;
    setAuthState("sending");
    setAuthError("");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin + "/showcase" },
    });
    if (error) {
      setAuthState("error");
      setAuthError(error.message);
    } else {
      setAuthState("sent");
    }
  }

  const displayName =
    (user?.user_metadata?.name as string | undefined) ?? user?.email?.split("@")[0];

  const value = useMemo<AuthContextValue>(
    () => ({
      configured: isSupabaseConfigured,
      user,
      displayName,
      requireAuth,
      openSignIn,
      signOut,
    }),
    [user, displayName, requireAuth, openSignIn, signOut],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}

      {/* Sign-in modal — available from anywhere (top nav, showcase) */}
      {authOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/40 p-4 backdrop-blur-sm"
          onClick={() => setAuthOpen(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <div className="w-full max-w-[400px] rounded-[var(--radius-card)] bg-white p-6 shadow-lg">
              {authState === "sent" ? (
                <div className="text-center">
                  <span className="mb-2 block text-4xl">📬</span>
                  <h2 className="text-[1.3rem] font-extrabold text-navy">Check your email</h2>
                  <p className="mt-2 text-muted">
                    We sent a magic link to <strong className="text-navy">{email}</strong>. Open it
                    on this device to sign in.
                  </p>
                  <button
                    type="button"
                    onClick={() => setAuthOpen(false)}
                    className="mt-5 w-full rounded-full border border-line py-2.5 font-bold text-navy hover:bg-beige"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={signIn}>
                  <h2 className="text-[1.3rem] font-extrabold text-navy">Sign in to join</h2>
                  <p className="mt-1.5 text-[0.95rem] text-muted">
                    Add your project, upvote and react. We&apos;ll email you a magic link — no
                    password.
                  </p>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="mt-4 w-full rounded-xl border border-line bg-beige px-4 py-3 text-[1rem] outline-none focus:border-blue-line focus:bg-white"
                  />
                  {authState === "error" && (
                    <p className="mt-2 text-[0.85rem] font-semibold text-warn-ink">{authError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={authState === "sending"}
                    className="mt-4 w-full rounded-full py-3 font-bold text-white shadow-[0_8px_20px_rgba(36,101,222,0.32)] transition-transform hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg,#2f6bf2 0%,#3f7bef 100%)" }}
                  >
                    {authState === "sending" ? "Sending…" : "Send magic link"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}
