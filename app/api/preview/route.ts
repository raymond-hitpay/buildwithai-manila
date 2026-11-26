import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/preview?url=<link>
 * Fetches the page server-side and returns its title, description, preview
 * image and favicon so the Showcase can render a rich card. Falls back to a
 * live full-page screenshot (WordPress mShots) when the site has no OG image.
 */

function normalizeUrl(raw: string): URL | null {
  let value = raw.trim();
  if (!value) return null;
  if (!/^https?:\/\//i.test(value)) value = `https://${value}`;
  try {
    const u = new URL(value);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    const host = u.hostname.toLowerCase();
    // Basic SSRF guard — no local / private hosts.
    if (
      host === "localhost" ||
      host === "0.0.0.0" ||
      host.endsWith(".local") ||
      /^127\./.test(host) ||
      /^10\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^169\.254\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host)
    ) {
      return null;
    }
    return u;
  } catch {
    return null;
  }
}

function screenshotUrl(target: string): string {
  // Free, no-key, full-page screenshot that renders the actual site UI.
  return `https://s.wordpress.com/mshots/v1/${encodeURIComponent(target)}?w=1200&h=900`;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function metaContent(html: string, patterns: RegExp[]): string | null {
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return decodeEntities(m[1]);
  }
  return null;
}

function absolute(base: URL, maybe: string | null): string | null {
  if (!maybe) return null;
  try {
    return new URL(maybe, base).toString();
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const u = normalizeUrl(searchParams.get("url") ?? "");
  if (!u) {
    return NextResponse.json({ error: "Enter a valid website link." }, { status: 400 });
  }

  const target = u.toString();
  const domain = u.hostname.replace(/^www\./, "");

  // Sensible defaults so the card is still useful even if the fetch fails.
  let title = domain;
  let description = "";
  let image: string | null = null;
  let favicon: string | null = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(target, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; HitPayShowcaseBot/1.0; +https://hit-pay.com)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    clearTimeout(timeout);

    const type = res.headers.get("content-type") ?? "";
    if (res.ok && type.includes("text/html")) {
      // Read at most ~512KB — the <head> is all we need.
      const reader = res.body?.getReader();
      let html = "";
      if (reader) {
        const decoder = new TextDecoder();
        let received = 0;
        while (received < 512_000) {
          const { done, value } = await reader.read();
          if (done) break;
          received += value.length;
          html += decoder.decode(value, { stream: true });
          if (/<\/head>/i.test(html)) break;
        }
        reader.cancel().catch(() => {});
      } else {
        html = await res.text();
      }

      const ogTitle = metaContent(html, [
        /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i,
        /<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:title["']/i,
        /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']*)["']/i,
      ]);
      const htmlTitle = metaContent(html, [/<title[^>]*>([^<]*)<\/title>/i]);
      title = ogTitle || htmlTitle || title;

      description =
        metaContent(html, [
          /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i,
          /<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:description["']/i,
          /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i,
          /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i,
          /<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']*)["']/i,
        ]) || "";

      const ogImage = metaContent(html, [
        /<meta[^>]+property=["']og:image:secure_url["'][^>]+content=["']([^"']*)["']/i,
        /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["']/i,
        /<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:image["']/i,
        /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']*)["']/i,
      ]);
      image = absolute(u, ogImage);

      const iconHref = metaContent(html, [
        /<link[^>]+rel=["'](?:shortcut icon|icon|apple-touch-icon)["'][^>]+href=["']([^"']*)["']/i,
        /<link[^>]+href=["']([^"']*)["'][^>]+rel=["'](?:shortcut icon|icon|apple-touch-icon)["']/i,
      ]);
      // Skip inline data: URIs — regex can't capture them intact. The Google
      // favicon service (set as the default above) is a reliable fallback.
      if (iconHref && !/^data:/i.test(iconHref.trim())) {
        const abs = absolute(u, iconHref);
        if (abs) favicon = abs;
      }
    }
  } catch {
    // Network/parse failure — fall through to defaults + screenshot.
  }

  // When the site has no OG image, show a live screenshot of its UI.
  if (!image) image = screenshotUrl(target);

  return NextResponse.json(
    {
      url: target,
      title: title.slice(0, 160),
      description: description.slice(0, 400),
      image,
      favicon,
      domain,
    },
    { headers: { "Cache-Control": "public, max-age=600" } },
  );
}
