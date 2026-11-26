"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/*
 * Browser-only Supabase client for the Showcase.
 * Auth is anonymous sign-in (name only, no email/password) — avoids Supabase's
 * email rate limits for a room full of attendees. Session is persisted in
 * localStorage, keyed to the device/browser.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    client = createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "implicit",
      },
    });
  }
  return client;
}
