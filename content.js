/*
 * HitPay · Build with AI — Manila
 * ---------------------------------
 * ALL page content lives here. Edit text and links in this file only;
 * you never need to touch index.html, styles.css or app.js.
 *
 * Rules for editing:
 *  - A link shown as "[Something link]" is a PLACEHOLDER. Set `href` to a real
 *    URL to turn it into a working button. Leave `href: null` to keep it a
 *    visible placeholder on the page.
 *  - Inside prompt text, anything in [square brackets] is highlighted on screen
 *    so people know to replace it. The Copy button still copies it verbatim.
 *  - Never put API keys or secrets in this file.
 */

const CONTENT = {
  // ---- Header -------------------------------------------------------------
  meta: {
    brand: "HitPay",
    eyebrow: "Build with AI",
    title: "Manila — Workshop Resources",
    chips: ["Fri 27 Nov", "Common Ground, McKinley"],
    tagline:
      "Open this on your laptop during the session. Download files and copy prompts straight from here.",
  },

  // ---- Top tabs (Showcase is reserved for later) --------------------------
  tabs: [
    { id: "resources", label: "Resources", active: true },
    { id: "showcase", label: "Showcase!", active: false, comingSoon: true },
  ],

  // ---- Sticky sub-nav: one jump link per section --------------------------
  nav: [
    { id: "start", label: "Before you start" },
    { id: "warmup", label: "Warm-up" },
    { id: "website", label: "Website" },
    { id: "store", label: "Store" },
    { id: "links", label: "Links" },
    { id: "feedback", label: "Feedback" },
  ],

  // ---- Sections -----------------------------------------------------------
  sections: [
    // 0 — Before you start -------------------------------------------------
    {
      id: "start",
      number: "0",
      title: "Before you start",
      intro:
        "Tick these off before we begin. Your ticks are saved in this browser, so they stay checked if you refresh.",
      blocks: [
        {
          type: "checklist",
          items: [
            {
              text: "ChatGPT plan that includes Codex + the ChatGPT desktop app",
              href: "https://chatgpt.com",
              linkLabel: "chatgpt.com",
            },
            {
              text: "GitHub account",
              href: "https://github.com/signup",
              linkLabel: "github.com/signup",
            },
            {
              text: "Vercel account (sign up with GitHub)",
              href: "https://vercel.com/signup",
              linkLabel: "vercel.com/signup",
            },
            {
              text: "Supabase account",
              href: "https://supabase.com",
              linkLabel: "supabase.com",
            },
            {
              text: "HitPay sandbox account",
              href: "https://dashboard.sandbox.hit-pay.com",
              linkLabel: "dashboard.sandbox.hit-pay.com",
            },
            {
              text: "Google account (for the shared Google Sheet)",
              href: null,
            },
            {
              text: "Join the Viber group",
              href: null,
              placeholder: "[Viber link]",
            },
          ],
        },
        {
          type: "folders",
          title: "Your folders",
          intro: "Set these up inside your Codex folder so each step has a home:",
          lines: [
            { indent: 0, name: "Codex/", note: "" },
            { indent: 1, name: "sales-demo/", note: "unzip the warm-up files here" },
            { indent: 1, name: "my-website/", note: "created in Website · Step 0" },
            { indent: 1, name: "my-store/", note: "created in Store · Step 1" },
          ],
        },
      ],
    },

    // 1 — Warm-up ----------------------------------------------------------
    {
      id: "warmup",
      number: "1",
      title: "Warm-up: sales dashboard",
      intro: "Get comfortable with Codex by pointing it at a folder you already understand.",
      blocks: [
        {
          type: "download",
          style: "download",
          label: "sales-demo.zip",
          href: null,
          placeholder: "[zip link]",
        },
        {
          type: "step",
          anchor: "warmup-prompt-1",
          badge: "Warm-up · Prompt 1",
          title: "Summarise",
          prompts: [
            {
              tip: "Ask something you already know the answer to — it's how you learn to trust the output.",
              text: "Summarise what's in this folder. List each file and what it contains.",
            },
          ],
        },
        {
          type: "step",
          anchor: "warmup-prompt-2",
          badge: "Warm-up · Prompt 2",
          title: "Sales dashboard",
          prompts: [
            {
              text:
`Goal: Build a dashboard report that consolidates our sales.
Context: Use the sales files in this folder.
Limits: Don't change the original files. Save it as dashboard.html.
Done when: One page shows total sales, sales by month and the top 5 products, and opens in my browser.`,
            },
          ],
        },
      ],
    },

    // 2 — Website ----------------------------------------------------------
    {
      id: "website",
      number: "2",
      title: "Build your own website",
      intro: "Turn your real business into a modern site, then teach Codex your brand so it can keep writing for you.",
      blocks: [
        {
          type: "download",
          style: "download",
          label: "Sample business kit (logo, photos, About text)",
          href: null,
          placeholder: "[kit link]",
          note: "Optional — use this if you don't have your own assets handy.",
        },
        {
          type: "step",
          anchor: "website-step-0",
          badge: "Website · Step 0",
          title: "Start your website project",
          prompts: [
            {
              text:
`Goal: Understand my business and website before we redesign it.
Context: My current site is [link]. Sites I like: [links, optional].
Limits: Don't build anything yet. Interview me one question at a time.
Done when: site-brief.md covers my business, customers, pages and look — and I've approved it.`,
            },
          ],
        },
        {
          type: "step",
          anchor: "website-step-1",
          badge: "Website · Step 1",
          title: "Plan first",
          badgeNote: "Turn on Plan mode: Shift + Tab",
          prompts: [
            {
              text:
`Goal: Redesign my business website with a modern, mobile-friendly look.
Context: Use site-brief.md and my logo and photos in this folder.
Limits: Keep my text, prices and contact details. Don't make anything up.
Done when: The new homepage opens in my browser and looks good on mobile.`,
            },
          ],
        },
        {
          type: "step",
          anchor: "website-step-2",
          badge: "Website · Step 2",
          title: "Brand rules in AGENTS.md",
          downloads: [
            {
              style: "download",
              label: "AGENTS.md template",
              href: null,
              placeholder: "[template link]",
            },
          ],
          prompts: [
            {
              text:
`Create an AGENTS.md for this project from site-brief.md, plus our brand guidelines: colours [#hex], font [name], tone [warm, simple English]. Then update the site to follow it.`,
            },
          ],
        },
        {
          type: "step",
          anchor: "website-step-3",
          badge: "Website · Step 3",
          title: "A reusable blog-post skill",
          prompts: [
            {
              text:
`$skill-creator Make a skill called blog-post: given a topic, write a 300-word post in our brand voice from AGENTS.md, save it in /blog, and link it from the Blog page and menu.`,
            },
            {
              tag: "Then",
              text: "Use the blog-post skill to write about our new holiday menu.",
            },
          ],
        },
        {
          type: "step",
          anchor: "website-step-4",
          badge: "Website · Step 4",
          title: "Weekly posts, scheduled",
          downloads: [
            {
              style: "download",
              label: "topics.md (5 sample blog topics)",
              href: null,
              placeholder: "[topics link]",
            },
          ],
          prompts: [
            {
              note: "Prompt for the Scheduled page — set it to Weekly, Monday 9 AM:",
              text: "Use the blog-post skill to write this week's post on the next topic in topics.md.",
            },
          ],
        },
        {
          type: "step",
          anchor: "website-step-5",
          badge: "Website · Step 5",
          title: "Put it online",
          prompts: [
            {
              tag: "Prompt 1",
              text: "Save this project to a new GitHub repository called my-website and push it.",
            },
            {
              tag: "Prompt 2",
              text: "Deploy this site to Vercel and give me the live link.",
            },
          ],
          footnote:
            'Then edit your scheduled task and add "Then commit and push to GitHub." so every weekly post goes live automatically.',
        },
      ],
    },

    // 3 — Store ------------------------------------------------------------
    {
      id: "store",
      number: "3",
      title: "Online store with HitPay checkout",
      intro: "Build a real store: a cart, a database, live payments, and your actual catalogue.",
      blocks: [
        {
          type: "step",
          anchor: "store-step-1",
          badge: "Store · Step 1",
          title: "Build the store",
          prompts: [
            {
              text:
`Goal: Build an online store web app with a product page and a cart.
Context: Start with 3 sample products. We'll add a database, payments and real products next.
Limits: No payments yet. Keep it simple and mobile-friendly.
Done when: I can browse products and add them to the cart in my browser.`,
            },
          ],
        },
        {
          type: "step",
          anchor: "store-step-2",
          badge: "Store · Step 2",
          title: "Connect a database",
          prompts: [
            {
              text:
`Goal: Save products and orders in a Supabase database.
Context: Use my Supabase project. I'll give you the URL and publishable key.
Limits: Keep keys in environment variables, not page code. Turn on Row Level Security.
Done when: Products load from the database, and checkout saves a row in an orders table.`,
            },
          ],
          warning: "Never share your secret key (sb_secret_…). It belongs in environment variables only.",
        },
        {
          type: "step",
          anchor: "store-step-3",
          badge: "Store · Step 3",
          title: "Connect HitPay",
          prompts: [
            {
              text:
`Goal: Add HitPay checkout to my store.
Context: Use HitPay sandbox. I'll give you my API key when you ask.
Limits: Keep the key in an environment variable. Card details never touch my site.
Done when: I can pay for an order with a sandbox test and the order is marked paid.`,
            },
          ],
          links: [
            { label: "HitPay API docs", href: "https://docs.hitpayapp.com" },
          ],
        },
        {
          type: "step",
          anchor: "store-step-4",
          badge: "Store · Step 4",
          title: "Load real products with MCP",
          downloads: [
            {
              style: "open",
              label: "Shared Google Sheet",
              href: null,
              placeholder: "[Sheet link]",
            },
            {
              style: "download",
              label: "Download CSV",
              href: null,
              placeholder: "[CSV link]",
              note: "Fallback — use this if MCP won't connect.",
            },
          ],
          prompts: [
            {
              text:
`Goal: Replace the sample products in the database with our real catalogue.
Context: Use the shared Google Sheet "[Sheet name]".
Limits: Use prices exactly as in the sheet. Keep the cart and HitPay checkout working.
Done when: The store shows every product from the sheet, and a sandbox payment still works.`,
            },
          ],
        },
      ],
    },

    // 4 — Links ------------------------------------------------------------
    {
      id: "links",
      number: "4",
      title: "Links",
      intro: "Everything you'll open during the session, in one place.",
      blocks: [
        {
          type: "links",
          items: [
            { label: "GitHub", href: "https://github.com" },
            { label: "Vercel", href: "https://vercel.com" },
            { label: "Supabase", href: "https://supabase.com" },
            { label: "HitPay sandbox", href: "https://dashboard.sandbox.hit-pay.com" },
            { label: "HitPay API docs", href: "https://docs.hitpayapp.com" },
            { label: "Codex best practices", href: "https://learn.chatgpt.com/guides/best-practices" },
          ],
        },
      ],
    },

    // 5 — Feedback ---------------------------------------------------------
    {
      id: "feedback",
      number: "5",
      title: "Share & feedback",
      intro: "Built something you're proud of? Tell us how it went — it shapes the next workshop.",
      blocks: [
        {
          type: "download",
          style: "open",
          label: "Open the feedback form",
          href: "https://forms.gle/MyCaFf27FniMRqUw8",
        },
      ],
    },
  ],
};

// Make available to app.js (works with a plain <script> tag, no build step).
if (typeof window !== "undefined") {
  window.CONTENT = CONTENT;
}
