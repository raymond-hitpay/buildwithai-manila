-- =============================================================================
-- HitPay · Build with AI — Manila · Showcase
-- -----------------------------------------------------------------------------
-- Paste this whole file into the Supabase SQL editor and run it once.
-- It creates the crowdsourced showcase tables, row-level-security policies,
-- and turns on realtime so the gallery updates live for everyone.
--
-- Auth: magic-link email. No extra setup needed — Supabase Auth → Email is on
-- by default. (Optional: Dashboard → Authentication → URL Configuration → add
-- your site URL + /showcase to the allowed redirect list.)
-- =============================================================================

-- --- Submissions ------------------------------------------------------------
create table if not exists public.submissions (
  id           uuid primary key default gen_random_uuid(),
  url          text not null,
  title        text not null,
  description  text,
  image_url    text,
  favicon_url  text,
  domain       text,
  user_id      uuid not null references auth.users (id) on delete cascade,
  author_name  text,
  created_at   timestamptz not null default now()
);

create index if not exists submissions_created_at_idx on public.submissions (created_at desc);

-- --- Upvotes (one per user per submission) ----------------------------------
create table if not exists public.votes (
  submission_id uuid not null references public.submissions (id) on delete cascade,
  user_id       uuid not null references auth.users (id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (submission_id, user_id)
);

-- --- Emoji reactions (one per user per submission per emoji) -----------------
create table if not exists public.reactions (
  submission_id uuid not null references public.submissions (id) on delete cascade,
  user_id       uuid not null references auth.users (id) on delete cascade,
  emoji         text not null,
  created_at    timestamptz not null default now(),
  primary key (submission_id, user_id, emoji)
);

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table public.submissions enable row level security;
alter table public.votes       enable row level security;
alter table public.reactions   enable row level security;

-- Submissions: anyone can read; signed-in users create their own; owners edit/delete
drop policy if exists "submissions read"   on public.submissions;
drop policy if exists "submissions insert" on public.submissions;
drop policy if exists "submissions update" on public.submissions;
drop policy if exists "submissions delete" on public.submissions;

create policy "submissions read"   on public.submissions for select using (true);
create policy "submissions insert" on public.submissions for insert to authenticated with check (auth.uid() = user_id);
create policy "submissions update" on public.submissions for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "submissions delete" on public.submissions for delete to authenticated using (auth.uid() = user_id);

-- Votes: anyone can read; signed-in users add/remove only their own
drop policy if exists "votes read"   on public.votes;
drop policy if exists "votes insert" on public.votes;
drop policy if exists "votes delete" on public.votes;

create policy "votes read"   on public.votes for select using (true);
create policy "votes insert" on public.votes for insert to authenticated with check (auth.uid() = user_id);
create policy "votes delete" on public.votes for delete to authenticated using (auth.uid() = user_id);

-- Reactions: anyone can read; signed-in users add/remove only their own
drop policy if exists "reactions read"   on public.reactions;
drop policy if exists "reactions insert" on public.reactions;
drop policy if exists "reactions delete" on public.reactions;

create policy "reactions read"   on public.reactions for select using (true);
create policy "reactions insert" on public.reactions for insert to authenticated with check (auth.uid() = user_id);
create policy "reactions delete" on public.reactions for delete to authenticated using (auth.uid() = user_id);

-- =============================================================================
-- Realtime — publish changes so the gallery updates live
-- =============================================================================
do $$
begin
  alter publication supabase_realtime add table public.submissions;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.votes;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.reactions;
exception when duplicate_object then null;
end $$;
