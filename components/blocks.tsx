import Image from "next/image";
import type {
  BannerBlock,
  Block,
  FileButton as FileButtonDef,
  FoldersBlock,
  LinksBlock,
  NoteBlock,
  PrereqsBlock,
  Prompt,
  SocialBlock,
  StepBlock,
} from "@/lib/content";
import { CopyButton } from "@/components/copy-button";
import { PrereqIcon } from "@/components/icons";

/* ---- structured prompt parsing (Goal / Context / Limits / Done when) ---- */
const SECTION_RE = /^(Goal|Context|Limits|Done when):\s?(.*)$/;

type Segment = { label?: string; body: string };

function parsePrompt(text: string): Segment[] {
  return text.split("\n").map((line) => {
    const m = line.match(SECTION_RE);
    return m ? { label: m[1], body: m[2] } : { body: line };
  });
}

/** True when the prompt uses the Goal/Context/Limits/Done when scaffold. */
function isStructured(text: string): boolean {
  return /^(Goal|Context|Limits|Done when):/m.test(text);
}

/** Clipboard text: strip the section labels, join the bodies into clean prose. */
function toCopyText(text: string): string {
  if (!isStructured(text)) return text;
  return parsePrompt(text)
    .map((s) => s.body.trim())
    .filter(Boolean)
    .join(" ");
}

/** Highlight [placeholders] within a single line of prose. */
function formatInline(text: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  text.split(/(\[[^\]]+\])/g).forEach((part, pi) => {
    if (!part) return;
    if (/^\[[^\]]+\]$/.test(part)) {
      out.push(
        <mark key={`ph${pi}`} className="ph">
          {part}
        </mark>,
      );
    } else {
      out.push(<span key={`t${pi}`}>{part}</span>);
    }
  });
  return out;
}

/* ---- prompt text → highlighted React nodes (plain / label-less) --------- */
function formatPrompt(text: string): React.ReactNode[] {
  return text.split("\n").map((line, li) => (
    <span key={li}>
      {li > 0 ? "\n" : null}
      {formatInline(line)}
    </span>
  ));
}

/* ---- structured prompt → chips above each section ---------------------- */
function StructuredPrompt({ segments }: { segments: Segment[] }) {
  return (
    <div className="prompt-structured">
      {segments.map((s, i) =>
        s.label ? (
          <div key={i} className="prompt-seg">
            <span className="seg-label">{s.label}</span>
            <p className="seg-body">{formatInline(s.body)}</p>
          </div>
        ) : (
          <p key={i} className="seg-body">
            {formatInline(s.body)}
          </p>
        ),
      )}
    </div>
  );
}

/* ---- file buttons (download / open / placeholder) ---------------------- */
function FileButton({ def }: { def: FileButtonDef }) {
  const isOpen = def.style === "open";
  if (!def.href) {
    return (
      <span
        title="Link not set yet"
        className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border-2 border-dashed border-[#c6cfdf] bg-white px-5 py-2.5 font-bold text-muted"
      >
        <span aria-hidden>{isOpen ? "🔗" : "⬇"}</span>
        {def.label}{" "}
        <span className="rounded-md bg-ph px-2 py-0.5 text-[0.82em] font-bold text-ph-ink">
          {def.placeholder || "[link]"}
        </span>
      </span>
    );
  }
  return (
    <a
      href={def.href}
      {...(isOpen ? { target: "_blank", rel: "noopener" } : { download: "" })}
      className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-bold text-white shadow-[0_6px_16px_rgba(36,101,222,0.28)] transition-transform hover:-translate-y-0.5 active:scale-[0.96]"
      style={{ background: "linear-gradient(135deg,#2465de 0%,#3f7bef 100%)" }}
    >
      <span aria-hidden>{isOpen ? "🔗" : "⬇"}</span>
      {def.label}
    </a>
  );
}

function DownloadRow({ def }: { def: FileButtonDef }) {
  return (
    <div className="mb-3.5 flex flex-wrap items-center gap-3">
      <FileButton def={def} />
      {def.note && <span className="text-[0.92rem] text-muted">{def.note}</span>}
    </div>
  );
}

/* A prominent, labelled download block (badge + title + instruction + button). */
function DownloadCard({ def }: { def: FileButtonDef }) {
  return (
    <div className="mb-4 rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)]">
      {def.badge && (
        <div className="mb-3">
          <Badge text={def.badge} />
        </div>
      )}
      {def.title && (
        <h3 className="m-0 mb-1 text-[1.18rem] font-extrabold tracking-tight text-navy">
          {def.title}
        </h3>
      )}
      {def.note && <p className="m-0 mb-3.5 text-[0.95rem] text-muted">{def.note}</p>}
      <FileButton def={def} />
    </div>
  );
}

/* ---- prompt card ------------------------------------------------------- */
function Badge({ text, tag }: { text: string; tag?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-[#f4f7fc] px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-wide text-muted">
      {text}
      {tag && (
        <span className="rounded bg-white px-1.5 py-px text-[0.92em] text-blue">{tag}</span>
      )}
    </span>
  );
}

function PromptCard({ badge, p }: { badge: string; p: Prompt }) {
  const structured = isStructured(p.text);
  return (
    <div className="mb-4 rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)]">
      {p.tip && (
        <p className="mb-3.5 rounded-xl border border-[#f3e2bc] bg-warn-bg px-3.5 py-2.5 text-[0.95rem] text-warn-ink">
          💡 <strong>Tip:</strong> {p.tip}
        </p>
      )}
      {p.note && <p className="mb-3 text-[0.95rem] font-semibold text-muted">{p.note}</p>}
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
        <Badge text={badge} tag={p.tag} />
        <CopyButton text={toCopyText(p.text)} />
      </div>
      {structured ? (
        <StructuredPrompt segments={parsePrompt(p.text)} />
      ) : (
        <pre className="prompt-box">{formatPrompt(p.text)}</pre>
      )}
    </div>
  );
}

/* ---- step -------------------------------------------------------------- */
function Step({ block }: { block: StepBlock }) {
  return (
    <section className="mb-8 scroll-mt-24" id={block.anchor}>
      <div className="mb-3 flex flex-wrap items-center gap-2.5">
        <h3 className="m-0 text-[1.18rem] font-extrabold tracking-tight text-navy">
          {block.title}
        </h3>
        {block.optional && (
          <span className="rounded-md border border-line bg-[#f4f7fc] px-2 py-0.5 text-[0.7rem] font-bold uppercase tracking-wide text-muted">
            Optional
          </span>
        )}
        {block.badgeNote && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-line bg-blue-soft px-[11px] py-1 text-[0.8rem] font-bold text-blue">
            ⌨ {block.badgeNote}
          </span>
        )}
      </div>
      {block.downloads?.map((d, i) => <DownloadRow key={i} def={d} />)}
      {block.prompts.map((p, i) => (
        <PromptCard key={i} badge={block.badge} p={p} />
      ))}
      {block.result && (
        <p className="mt-1 flex items-start gap-2 text-[0.92rem] font-semibold text-[#157a43]">
          <span aria-hidden>✅</span>
          <span>
            <span className="font-extrabold">You should see:</span> {block.result}
          </span>
        </p>
      )}
      {block.warning && (
        <div className="mt-3.5 flex items-start gap-3 rounded-xl border border-warn-line bg-warn-bg px-4 py-3 font-semibold text-warn-ink">
          <span aria-hidden>⚠️</span>
          <span>{block.warning}</span>
        </div>
      )}
      {block.links && block.links.length > 0 && (
        <div className="mt-3.5 flex flex-wrap gap-2">
          {block.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noopener"
              className="rounded-full border border-blue-line bg-blue-soft px-3.5 py-2 text-[0.92rem] font-bold text-blue transition-colors hover:bg-[#dbe8ff]"
            >
              {l.label} ↗
            </a>
          ))}
        </div>
      )}
      {block.footnote && (
        <p className="mt-3.5 text-[0.95rem] text-muted">{block.footnote}</p>
      )}
    </section>
  );
}

/* ---- prerequisites ----------------------------------------------------- */
function Prereqs({ block }: { block: PrereqsBlock }) {
  return (
    <div className="mb-4 rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)]">
      {block.title && (
        <h3 className="mb-2 text-[1.14rem] font-extrabold tracking-tight text-navy">
          {block.title}
        </h3>
      )}
      <ul className="m-0 list-none p-0">
        {block.items.map((item, i) => (
          <li
            key={i}
            className="flex items-center gap-3.5 border-b border-line py-3.5 last:border-b-0"
          >
            <PrereqIcon name={item.icon} />
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="font-semibold">{item.text}</span>
              {item.href ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener"
                  className="text-[0.9rem] font-semibold text-blue"
                >
                  {(item.linkLabel || item.href) + " ↗"}
                </a>
              ) : item.placeholder ? (
                <span className="mt-1 inline-block w-fit rounded-md bg-ph px-2 py-0.5 text-[0.82em] font-bold text-ph-ink">
                  {item.placeholder}
                </span>
              ) : null}
            </span>
            {item.qr && item.href && (
              <a
                href={item.href}
                target="_blank"
                rel="noopener"
                className="flex-none rounded-lg border border-line bg-white p-1.5 shadow-sm transition-transform hover:-translate-y-0.5"
                title="Scan to join on Viber"
              >
                <Image
                  src={item.qr}
                  alt="Viber group QR code"
                  width={76}
                  height={76}
                  className="h-[72px] w-[72px] sm:h-[84px] sm:w-[84px]"
                />
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---- folders ----------------------------------------------------------- */
function Folders({ block }: { block: FoldersBlock }) {
  return (
    <div className="mb-4 rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)]">
      <h3 className="m-0 mb-1 text-[1.12rem] font-extrabold tracking-tight text-navy">
        {block.title || "Your folders"}
      </h3>
      {block.intro && <p className="mb-3.5 text-[0.95rem] text-muted">{block.intro}</p>}
      <pre className="folders-box">
        {block.lines.map((ln, i) => (
          <div key={i}>
            {"  ".repeat(ln.indent || 0)}
            <span className="fname">{ln.name}</span>
            {ln.note ? (
              <>
                {"   "}
                <span className="fnote">{ln.note}</span>
              </>
            ) : null}
          </div>
        ))}
      </pre>
    </div>
  );
}

/* ---- links grid -------------------------------------------------------- */
function LinksGrid({ block }: { block: LinksBlock }) {
  return (
    <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(230px,1fr))]">
      {block.items.map((l) => (
        <a
          key={l.href}
          href={l.href}
          target="_blank"
          rel="noopener"
          className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-4 font-bold text-navy shadow-sm transition-[transform,border-color,color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-blue hover:text-blue hover:shadow-[var(--shadow-card)] active:scale-[0.98]"
        >
          {l.icon && <PrereqIcon name={l.icon} size={32} />}
          <span className="flex-1">{l.label}</span>
          <span className="text-blue">↗</span>
        </a>
      ))}
    </div>
  );
}

/* ---- social links ------------------------------------------------------ */
function Social({ block }: { block: SocialBlock }) {
  return (
    <div className="mb-4">
      {block.title && (
        <h3 className="mb-2.5 text-[1.05rem] font-extrabold tracking-tight text-navy">
          {block.title}
        </h3>
      )}
      <div className="flex flex-wrap gap-2.5">
        {block.items.map((s) => (
          <a
            key={s.href}
            href={s.href}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2.5 rounded-full border border-line bg-white py-2 pl-2 pr-4 font-bold text-navy shadow-sm transition-[transform,border-color,color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-blue hover:text-blue hover:shadow-[var(--shadow-card)] active:scale-[0.97]"
          >
            <PrereqIcon name={s.icon} size={30} />
            {s.label}
          </a>
        ))}
      </div>
    </div>
  );
}

/* ---- note / callout ---------------------------------------------------- */
function Note({ block }: { block: NoteBlock }) {
  return (
    <div className="mb-4 flex items-start gap-3 rounded-[var(--radius-card)] border border-blue-line bg-blue-soft px-4 py-3.5 font-medium text-navy">
      {block.emoji && <span aria-hidden className="text-xl leading-none">{block.emoji}</span>}
      <span>{block.text}</span>
    </div>
  );
}

/* ---- banner (dedicated CTA) -------------------------------------------- */
function Banner({ block }: { block: BannerBlock }) {
  return (
    <div
      className="relative mb-4 overflow-hidden rounded-[var(--radius-card)] text-white shadow-[0_18px_40px_rgba(36,101,222,0.32)]"
      style={{ background: "linear-gradient(135deg,#2465de 0%,#3f7bef 100%)" }}
    >
      {/* soft glow accents */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full opacity-40 blur-2xl"
        style={{ background: "radial-gradient(circle,#ffffff66 0%,transparent 70%)" }}
      />
      <div className="relative flex flex-col gap-6 p-6 sm:p-8 md:flex-row md:items-center md:gap-8">
        <div className="flex-1">
          {block.eyebrow && (
            <span className="text-[0.72rem] font-extrabold uppercase tracking-wider text-white/80">
              {block.eyebrow}
            </span>
          )}
          <h3 className="mt-1.5 text-[1.5rem] font-extrabold leading-tight tracking-tight sm:text-[1.8rem]">
            {block.title}
          </h3>
          {block.text && (
            <p className="mt-2 max-w-[48ch] text-[0.98rem] leading-relaxed text-white/85">
              {block.text}
            </p>
          )}
          <a
            href={block.href}
            target="_blank"
            rel="noopener"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[0.98rem] font-extrabold text-blue shadow-[0_8px_20px_rgba(10,24,54,0.22)] transition-transform hover:-translate-y-0.5 active:scale-[0.97]"
          >
            {block.ctaLabel}
            <span aria-hidden>→</span>
          </a>
        </div>

        {block.image && (
          <div className="relative w-full flex-none md:w-[46%]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={block.image}
              alt={block.imageAlt ?? ""}
              loading="lazy"
              className="w-full rounded-xl border border-white/15 shadow-[0_14px_30px_rgba(10,24,54,0.28)]"
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ---- dispatcher -------------------------------------------------------- */
export function Blocks({ blocks }: { blocks?: Block[] }) {
  if (!blocks) return null;
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.type) {
          case "step":
            return <Step key={i} block={b} />;
          case "prereqs":
            return <Prereqs key={i} block={b} />;
          case "folders":
            return <Folders key={i} block={b} />;
          case "download":
            return b.badge || b.title ? (
              <DownloadCard key={i} def={b} />
            ) : (
              <DownloadRow key={i} def={b} />
            );
          case "links":
            return <LinksGrid key={i} block={b} />;
          case "social":
            return <Social key={i} block={b} />;
          case "note":
            return <Note key={i} block={b} />;
          case "banner":
            return <Banner key={i} block={b} />;
          default:
            return null;
        }
      })}
    </>
  );
}
