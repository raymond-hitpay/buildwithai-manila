/*
 * HitPay · Build with AI — Manila
 * -------------------------------------------------------------------------
 * ALL page content lives here. Edit text and links in this file only.
 *
 *  - A link shown as "[Something link]" is a PLACEHOLDER. Set `href` to a real
 *    URL to turn it into a working button. Leave `href: null` to keep it a
 *    visible placeholder on the page.
 *  - Inside prompt text, anything in [square brackets] is highlighted on screen
 *    so people know to replace it. The Copy button still copies it verbatim.
 *  - Never put API keys or secrets in this file.
 */

export type IconName =
  | "chatgpt"
  | "github"
  | "vercel"
  | "supabase"
  | "hitpay"
  | "viber"
  | "docs"
  | "instagram"
  | "linkedin"
  | "facebook"
  | "tiktok";

export interface Prompt {
  text: string;
  tip?: string;
  note?: string;
  tag?: string;
}

export interface FileButton {
  style: "download" | "open";
  label: string;
  href: string | null;
  placeholder?: string;
  note?: string;
  badge?: string; // block-level downloads only: renders as a labelled card
  title?: string;
}

export interface StepBlock {
  type: "step";
  anchor?: string;
  badge: string;
  title: string;
  badgeNote?: string;
  optional?: boolean; // renders an "Optional" tag on the step
  downloads?: FileButton[];
  prompts: Prompt[];
  result?: string; // "✅ You should see …" success line
  warning?: string;
  links?: { label: string; href: string }[];
  footnote?: string;
}

export interface PrereqItem {
  icon: IconName;
  text: string;
  href?: string | null;
  linkLabel?: string;
  placeholder?: string;
  qr?: string;
}

export interface PrereqsBlock {
  type: "prereqs";
  title?: string;
  items: PrereqItem[];
}

export interface FoldersBlock {
  type: "folders";
  title?: string;
  intro?: string;
  lines: { indent?: number; name: string; note?: string }[];
}

export interface DownloadBlock extends FileButton {
  type: "download";
}

export interface LinksBlock {
  type: "links";
  items: { label: string; href: string; icon?: IconName }[];
}

export interface SocialBlock {
  type: "social";
  title?: string;
  items: { label: string; href: string; icon: IconName }[];
}

export interface NoteBlock {
  type: "note";
  emoji?: string;
  text: string;
}

export interface BannerBlock {
  type: "banner";
  eyebrow?: string;
  title: string;
  text?: string;
  ctaLabel: string;
  href: string;
  image?: string; // product screenshot shown alongside the copy
  imageAlt?: string;
}

export type Block =
  | StepBlock
  | PrereqsBlock
  | FoldersBlock
  | DownloadBlock
  | LinksBlock
  | SocialBlock
  | NoteBlock
  | BannerBlock;

export interface Section {
  id: string;
  number?: string;
  kind?: "prereq" | "module" | "info";
  icon?: string;
  title: string;
  cardTitle?: string;
  intro?: string;
  blocks?: Block[];
}

export interface NavItem {
  id: string;
  label: string;
  comingSoon?: boolean;
}

export const CONTENT = {
  hero: {
    title: "Build with AI",
    subtitle:
      "Practical AI for PH business owners — from your first prompt to your first hosted website!",
    hostedByLabel: "hosted by",
    supportLabel: "with support from",
    ctaLabel: "View workshop resources",
  },

  meta: {
    brand: "HitPay",
    eyebrow: "Build with AI",
    title: "Workshop Resources",
    tagline:
      "Open this on your laptop during the session. Download files and copy prompts straight from here.",
  },

  topnav: [
    { id: "home", label: "Home" },
    { id: "resources", label: "Resources" },
    { id: "showcase", label: "Showcase" },
  ] as NavItem[],

  sections: [
    // 0 — Before you start -------------------------------------------------
    {
      id: "start",
      number: "0",
      kind: "prereq",
      title: "Before you start",
      intro:
        "Get these set up before we begin so you're ready to build from the first prompt.",
      blocks: [
        {
          type: "prereqs",
          title: "Prerequisites",
          items: [
            {
              icon: "chatgpt",
              text: "ChatGPT plan that includes Codex + the ChatGPT desktop app",
              href: "https://chatgpt.com",
              linkLabel: "chatgpt.com",
            },
            {
              icon: "github",
              text: "GitHub account",
              href: "https://github.com/signup",
              linkLabel: "github.com/signup",
            },
            {
              icon: "vercel",
              text: "Vercel account (sign up with GitHub)",
              href: "https://vercel.com/signup",
              linkLabel: "vercel.com/signup",
            },
            {
              icon: "supabase",
              text: "Supabase account",
              href: "https://supabase.com",
              linkLabel: "supabase.com",
            },
            {
              icon: "hitpay",
              text: "HitPay sandbox account",
              href: "https://dashboard.sandbox.hit-pay.com",
              linkLabel: "dashboard.sandbox.hit-pay.com",
            },
            {
              icon: "viber",
              text: "Join the Viber group — HitPay Manila Community",
              href: "https://invite.viber.com/?g2=AQAoODW4FtHiLVeBpG0kE7X3UF8Ms4qIR%2B6kdK5gociLwEUsLlW1bQkzhgjW1CuK",
              linkLabel: "Tap to join on Viber",
              qr: "/viber-qr.png",
            },
          ],
        },
      ],
    },

    // 1 — Warm-up ----------------------------------------------------------
    {
      id: "warmup",
      number: "1",
      kind: "module",
      icon: "📊",
      title: "Warm-up: sales dashboard",
      cardTitle: "Warm-up",
      intro:
        "Get comfortable with Codex by pointing it at a folder you already understand.",
      blocks: [
        {
          type: "download",
          style: "download",
          badge: "Warm-up · Files",
          title: "Download the starter files",
          label: "sales-demo.zip",
          href: "/sales-demo.zip",
          note: "Download the ZIP, then unzip it into your sales-demo/ folder — it holds three real sales exports (HitPay, Lazada, ShopeePay).",
        },
        {
          type: "step",
          anchor: "warmup-prompt-1",
          badge: "Warm-up · Prompt 1",
          title: "See your folder",
          prompts: [
            {
              tip: "Ask something you already know the answer to — it's how you learn to trust the output.",
              text: "Look at the files in this folder and tell me what each one is.",
            },
          ],
          footnote:
            "Say this out loud: Codex can open the Excel and CSV files directly and tell us what they contain — no copy-paste.",
        },
        {
          type: "step",
          anchor: "warmup-prompt-2",
          badge: "Warm-up · Prompt 2",
          title: "Compare the files",
          prompts: [
            {
              text: "Compare the sales files in this folder. For each one, identify the date, order or transaction ID, status, and amount paid columns. Don't change anything.",
            },
          ],
          footnote:
            "Each platform uses different column names and layouts. Codex compares them and shows which fields serve the same purpose.",
        },
        {
          type: "step",
          anchor: "warmup-prompt-3",
          badge: "Warm-up · Prompt 3",
          title: "Make a usable file",
          prompts: [
            {
              text: `Goal: Create a clean, simple HTML sales summary from the three sales files in this folder.
Context: The files are exports from HitPay, Lazada, and ShopeePay. Use the customer-paid amount before payment fees: HitPay Charge Amount, Lazada Total Paid, and ShopeePay Order Amount. Count only succeeded HitPay transactions, delivered Lazada orders, and completed ShopeePay transactions.
Limits: Keep the original files unchanged. Don't include buyer or customer names. Don't treat refunded, shipped, or other non-qualifying records as completed sales. Show the number of excluded records by platform. Label the figures as customer-paid sales before payment fees, since the exports don't provide the same fee information for every platform.
Done when: Save a single file named sales-summary.html in this folder. It should show the sales total for each platform, the overall total, the best sales day across all platforms, and a simple bar chart comparing platform totals. Include a short note explaining which records were counted and excluded. Tell me when it's ready to open in a browser.`,
            },
          ],
          footnote:
            "Finale: open sales-summary.html in your browser, then ask Codex for one small change — like a better chart title — and refresh the page to show the edit live.",
        },
      ],
    },

    // 2 — Website ----------------------------------------------------------
    {
      id: "website",
      number: "2",
      kind: "module",
      icon: "🌐",
      title: "Build your own website",
      cardTitle: "Build your own website",
      intro:
        "Turn your real business into a modern site, then teach Codex your brand so it can keep writing for you.",
      blocks: [
        {
          type: "note",
          emoji: "📘",
          text: "Read this first — paste it to Codex once at the start: \"I'm not a developer. Explain each step in simple language. When you need me to do something, tell me exactly where to click and what to look for. Before any step that depends on information or a choice from me, ask me first. Don't assume I know how to use the terminal, GitHub, or Vercel.\"",
        },
        {
          type: "download",
          style: "download",
          label: "Sample business kit (logo, photos, About text)",
          href: null,
          placeholder: "[kit link]",
          note: "Optional — use this if you don't have your own logo, photos or About text handy.",
        },
        {
          type: "step",
          anchor: "website-step-0",
          badge: "Website · Step 0",
          title: "Understand the business",
          prompts: [
            {
              note: "What this does: Codex interviews you and inspects any files in your folder, then writes a brief for you to approve. Nothing gets built yet.",
              text: `Goal: I want to build a new website for my business. Before we plan or build anything, understand my business and current website first.
Context: My current website is [paste your current website URL]. Sites I like (optional): [paste 1–2 links]. Also look at any files in this folder (logo, photos, About text).
Limits: Don't plan or build anything yet. Interview me one question at a time. Tell me what you found in the files and let me correct it — don't assume facts about my business.
Done when: You've written site-brief.md covering my business, customers, the pages I need and the look I want — and I've reviewed and approved it.`,
            },
          ],
          result: "a site-brief.md you can open and correct.",
        },
        {
          type: "step",
          anchor: "website-step-1",
          badge: "Website · Step 1",
          title: "Plan, build & publish",
          badgeNote: "Turn on Plan mode: Shift + Tab",
          prompts: [
            {
              note: "What this does: one prompt takes you from plan to live website. Codex pauses between stages so you stay in control — approve the plan, preview the build, then it puts you online with GitHub + Vercel.",
              text: `Goal: Plan, build, and publish a modern, mobile-friendly website for my business, ending with a live public link I can share.
Context: Use the approved site-brief.md and the logo and photos in this folder. Build with Next.js, save it to GitHub, and publish it with Vercel. I'm not a developer and I haven't used the terminal, GitHub, or Vercel before.
Limits: Work in stages and pause for my approval between each one — (1) show me the plan (pages, sections, visual direction) and wait for my OK before building; (2) build it and help me open it in my browser; (3) save it to a new GitHub repo called my-website; (4) publish it with Vercel. Keep my existing text, prices and contact details, and don't invent business facts. Whenever you need me to sign in, authorize access, or choose a setting, say in one sentence what the tool is, then give me exact click-by-click directions — tell me what to click and what to look for — and wait for me.
Done when: My website is live at a public Vercel URL that opens in my browser, works at desktop and phone widths, its code is in a GitHub repo called my-website, and you've shown me how to make a change and redeploy.`,
            },
          ],
          result:
            "a live public website — planned, built, and deployed — plus the GitHub repo and your redeploy steps.",
        },
        {
          type: "note",
          emoji: "⭐",
          text: "Optional bonus — plan → build → deploy above is the main win. The steps below are nice-to-have if you have time.",
        },
        {
          type: "step",
          anchor: "website-bonus-agents",
          badge: "Bonus · Brand voice",
          title: "Teach Codex your brand (AGENTS.md)",
          optional: true,
          prompts: [
            {
              note: "What this does: creates an AGENTS.md so Codex keeps writing in your brand voice.",
              text: `Goal: Create an AGENTS.md so Codex always writes in my brand voice.
Context: Use site-brief.md. My brand — colours [your brand colour, e.g. #2f6bf2], font [your font, e.g. Plus Jakarta Sans], tone [e.g. warm, simple English].
Limits: Keep it short and in plain language. Ask me for anything you're missing.
Done when: There's an AGENTS.md in my project describing my brand and how to run and preview the site, and the site has been updated to follow it.`,
            },
          ],
        },
        {
          type: "step",
          anchor: "website-bonus-blog-page",
          badge: "Bonus · Blog page",
          title: "Add a Blog page",
          optional: true,
          prompts: [
            {
              note: "What this does: adds a Blog page. There's no database — each post is just a Markdown (.md) file in a /blog folder, which is also the easiest format for Codex to write.",
              text: `Goal: Add a Blog page to my website that lists posts written as Markdown files.
Context: This site has no database, so each post is a .md file in a /blog folder, with a title, date and the post text at the top. Match the look from site-brief.md and the voice from AGENTS.md. Add 2 sample posts so I can see it working.
Limits: Keep it simple. The Blog page must list every .md file in /blog automatically, newest first — I should never edit page code to publish, just add a file. Add a "Blog" link to the menu.
Done when: I can open the Blog page in my browser, see the posts newest first, and click one to read the full post — and dropping a new .md file into /blog makes it appear with no code changes.`,
            },
          ],
          result: "a Blog page that lists your .md posts automatically.",
        },
        {
          type: "step",
          anchor: "website-bonus-blog",
          badge: "Bonus · Blog skill",
          title: "A reusable blog-post skill",
          optional: true,
          prompts: [
            {
              text: `$skill-creator Make a skill called blog-post: given a topic, write a 300-word post in our brand voice from AGENTS.md and save it as a Markdown file in /blog, so it appears on my Blog page automatically.`,
            },
            {
              tag: "Then",
              text: "Use the blog-post skill to write about our new holiday menu.",
            },
          ],
        },
        {
          type: "step",
          anchor: "website-bonus-schedule",
          badge: "Bonus · Weekly posts",
          title: "Weekly posts, scheduled",
          optional: true,
          prompts: [
            {
              note: "On the Scheduled page, set it to Weekly, Monday 9 AM, and paste this (swap in your own 5 topics):",
              text: "Use the blog-post skill to write this week's post. Pick the next topic we haven't used yet from this list: 1) Why we started, 2) Behind the scenes, 3) A customer story, 4) A new product or menu item, 5) Tips our customers often ask about.",
            },
          ],
          footnote:
            'Then add "Then commit and push to GitHub." to the scheduled task so every weekly post goes live automatically.',
        },
      ],
    },

    // 3 — Store ------------------------------------------------------------
    {
      id: "store",
      number: "3",
      kind: "module",
      icon: "🛒",
      title: "Online store with HitPay checkout",
      cardTitle: "Online store with HitPay checkout",
      intro:
        "Build a real store — a cart, a database, and live HitPay payments — then put it online with a public link you can share.",
      blocks: [
        {
          type: "note",
          emoji: "📘",
          text: "Read this first — paste it to Codex once at the start: \"I'm not a developer. Explain each step in simple language. When you need me to do something, tell me exactly where to click and what to look for. Before any step that depends on information or a choice from me, ask me first. Don't assume I know how to use the terminal, GitHub, Supabase, or Vercel.\"",
        },
        {
          type: "step",
          anchor: "store-step-1",
          badge: "Store · Step 1",
          title: "Build the store",
          prompts: [
            {
              note: "What this does: Codex builds a simple store you can click through — a product grid and a working cart — all on your computer. No database or payments yet; those come next.",
              text: `Goal: Build an online store web app with a product grid and a shopping cart.
Context: Start with 3 sample products (name, price, photo, short description), built in Next.js so we can add a database, HitPay payments — and put it online — in the next steps.
Limits: No payments yet. Keep it simple and mobile-friendly, since most customers shop on their phone.
Done when: I can browse the 3 products and add, remove and change quantities in the cart, in my browser.`,
            },
          ],
          result: "a store you can open in your browser, with items you can add to a cart.",
        },
        {
          type: "step",
          anchor: "store-step-2",
          badge: "Store · Step 2",
          title: "Connect a database",
          prompts: [
            {
              note: "What this does: moves your products and orders into a real database (Supabase) so they're saved properly, instead of living inside the code.",
              text: `Goal: Move the products and orders into a Supabase database.
Context: Use my Supabase project — tell me exactly where to click to copy the project URL and publishable key, then wait for me to paste them.
Limits: Keep all keys in environment variables, never in the page code. Turn on Row Level Security with policies that let the store read products and create orders, so nothing loads empty.
Done when: The 3 products load from the database, and placing an order saves a row in an orders table (still no payment yet).`,
            },
          ],
          result:
            "your 3 products loading from the database, and each order saved as a row you can see in Supabase.",
          warning:
            "Never share your secret key (sb_secret_…). It belongs in environment variables only.",
        },
        {
          type: "step",
          anchor: "store-step-3",
          badge: "Store · Step 3",
          title: "Connect HitPay",
          prompts: [
            {
              note: "What this does: adds real checkout. Codex reads HitPay's docs, wires in your sandbox keys, and makes the Pay button work — safely, with the total worked out on the server.",
              text: `Goal: Add HitPay checkout so customers can pay for an order.
Context: Read https://docs.hitpayapp.com/llms.txt first for the HitPay API reference. Use my HitPay sandbox account for testing — tell me where to click to copy my API key, then wait for me to paste it.
Limits: Keep the key in an environment variable. Card details never touch my site. Work out the order total on the server so it can't be changed from the browser. If someone taps Pay twice, don't create two orders. Only mark an order paid after confirming with HitPay that the payment actually went through.
Done when: I can place an order, pay with a HitPay sandbox test card, and land on a confirmation page showing the order marked paid.`,
            },
          ],
          result:
            "a completed sandbox test payment and a confirmation page showing the order marked paid.",
          links: [{ label: "HitPay API docs", href: "https://docs.hitpayapp.com" }],
          footnote:
            "The HitPay sandbox never charges real money — when Codex is ready to test, ask it which test card to enter at checkout.",
        },
        {
          type: "step",
          anchor: "store-step-4",
          badge: "Store · Step 4",
          title: "Put your store online",
          badgeNote: "New to GitHub & Vercel? Codex walks you through each click.",
          prompts: [
            {
              note: "What this does: one prompt puts your store on the internet with a public link you can share — saved to GitHub, deployed with Vercel, and with your keys stored safely in Vercel instead of in the code.",
              text: `Goal: Put my store online with a public link I can share.
Context: Save it to a new GitHub repo called my-store and publish it with Vercel. Move my Supabase and HitPay sandbox keys into Vercel's environment variables so they're never in the code. I'm not a developer and haven't used GitHub or Vercel before.
Limits: Keep the HitPay sandbox (test) keys for now — no real charges yet. Whenever you need me to sign in, authorize access, or copy a value, say in one sentence what the tool is, then give me exact click-by-click directions and wait for me. Never put a secret key in the code.
Done when: My store is live at a public Vercel URL that opens on desktop and phone, a HitPay sandbox test payment still goes through online, its code is in a GitHub repo called my-store, and you've shown me how to make a change and redeploy.`,
            },
          ],
          result:
            "a live store at a public URL that takes a sandbox test payment — plus the GitHub repo and your redeploy steps.",
          footnote:
            "Still in sandbox mode — when you're ready for real customers, swap the HitPay sandbox keys for live keys and you're open for business.",
        },
      ],
    },

    // 4 — Links ------------------------------------------------------------
    {
      id: "links",
      number: "4",
      kind: "info",
      title: "Docs & references",
      intro: "The docs you'll reach for during the session.",
      blocks: [
        {
          type: "links",
          items: [
            { label: "HitPay API docs", href: "https://docs.hitpayapp.com", icon: "hitpay" },
            { label: "HitPay product docs", href: "https://support.hit-pay.com", icon: "hitpay" },
            {
              label: "Codex best practices",
              href: "https://learn.chatgpt.com/guides/best-practices",
              icon: "chatgpt",
            },
          ],
        },
      ],
    },

    // 5 — Feedback ---------------------------------------------------------
    {
      id: "feedback",
      number: "5",
      kind: "info",
      title: "Share & feedback",
      intro:
        "Built something you're proud of? Tell us how it went — it shapes the next workshop.",
      blocks: [
        {
          type: "download",
          style: "open",
          label: "Open the feedback form",
          href: "https://forms.gle/MyCaFf27FniMRqUw8",
        },
      ],
    },

    // 6 — What's next ------------------------------------------------------
    {
      id: "whatsnext",
      number: "6",
      kind: "info",
      title: "What's next",
      intro: "Keep building after today — and stay in the loop.",
      blocks: [
        {
          type: "banner",
          eyebrow: "Ready for real customers?",
          title: "Start accepting payments with HitPay",
          text: "Take your store live with PayNow, cards, GrabPay and more — one account, one simple dashboard for every sale.",
          ctaLabel: "Sign up free",
          href: "https://dashboard.hit-pay.com/register?partner_referral=MKT",
          image: "/hitpay-dashboard.png",
          imageAlt: "The HitPay dashboard showing sales overview and charts",
        },
        {
          type: "social",
          title: "Follow HitPay",
          items: [
            { label: "Instagram", href: "https://www.instagram.com/hitpayapp/", icon: "instagram" },
            {
              label: "LinkedIn",
              href: "https://www.linkedin.com/company/hit-pay/",
              icon: "linkedin",
            },
            { label: "Facebook", href: "https://www.facebook.com/hitpayapp", icon: "facebook" },
            { label: "TikTok", href: "https://www.tiktok.com/@hitpayapp", icon: "tiktok" },
          ],
        },
        {
          type: "note",
          emoji: "📣",
          text: "Share your experience from the session — what you built and what you learned — and tag HitPay (@hitpayapp) and us.",
        },
        {
          type: "social",
          title: "Connect with us on LinkedIn",
          items: [
            { label: "Raymond", href: "https://www.linkedin.com/in/raymondvictorioh/", icon: "linkedin" },
            { label: "Ria", href: "https://www.linkedin.com/in/riacorral/", icon: "linkedin" },
          ],
        },
      ],
    },
  ] as Section[],
};

// ---- helpers --------------------------------------------------------------
export function sectionById(id: string): Section | undefined {
  return CONTENT.sections.find((s) => s.id === id);
}

export function modules(): Section[] {
  return CONTENT.sections.filter((s) => s.kind === "module");
}
