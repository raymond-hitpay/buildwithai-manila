# HitPay · Build with AI — Manila — workshop resources

A single-page resources site for the **Build with AI** workshop
(Fri 27 Nov, Common Ground McKinley). Attendees open it on their laptop during
the session to download files and copy prompts.

Plain HTML, CSS and a little JavaScript — **no framework, no build step**.

## Files

| File | What it's for |
|------|---------------|
| `index.html` | Page skeleton + script tags. Don't usually need to touch. |
| `content.js` | **All content** — every section, prompt, link and download. Edit here. |
| `styles.css` | Look & feel (HitPay colours, layout, responsive). |
| `app.js` | Rendering, copy buttons, checklist state, scrollspy. |

## Editing content

Open `content.js`. Everything is plain data:

- **Fill in a placeholder link** — find the item showing `[Something link]` and set
  its `href` to a real URL. Leave `href: null` to keep it a visible placeholder.
- **Prompts** — anything in `[square brackets]` is highlighted on the page so people
  know to replace it. The Copy button still copies the text exactly, brackets and all.
- **Never** put API keys or secrets in this file.

Placeholders still to fill in before the session:
`[zip link]`, `[Viber link]`, `[kit link]`, `[template link]`, `[topics link]`,
`[Sheet link]`, `[CSV link]`, and the Sheet name in Store · Step 4.

## Preview locally

Open `index.html` directly in a browser, or serve the folder:

```bash
python3 -m http.server 8080   # then visit http://localhost:8080
```

## Deploy (Vercel, via GitHub)

1. Push this repo to GitHub (HitPay org).
2. In Vercel → **Add New… → Project** → import the repo into the **HitPay** team.
3. Framework preset: **Other**. No build command, output directory = repo root.
4. Deploy. Future edits to `content.js` auto-deploy on push.

It's a static site, so there's nothing to build — Vercel serves the files as-is.
