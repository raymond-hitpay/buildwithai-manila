export interface Submission {
  id: string;
  url: string;
  title: string;
  description: string | null;
  image_url: string | null;
  favicon_url: string | null;
  domain: string | null;
  user_id: string;
  author_name: string | null;
  created_at: string;
}

export interface Vote {
  submission_id: string;
  user_id: string;
}

export interface Reaction {
  submission_id: string;
  user_id: string;
  emoji: string;
}

export interface LinkPreview {
  url: string;
  title: string;
  description: string;
  image: string | null;
  favicon: string | null;
  domain: string;
}

/** Emoji reactions offered on each card. */
export const REACTION_EMOJIS = ["❤️", "🔥", "👍"] as const;
