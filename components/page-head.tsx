import Link from "next/link";

export function PageHead({
  eyebrow,
  title,
  intro,
  back,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  back?: boolean;
}) {
  return (
    <header
      className="relative isolate overflow-hidden px-4 pb-[clamp(26px,4vw,42px)] pt-[calc(var(--topnav-h)+clamp(28px,5vw,48px))]"
      style={{ background: "linear-gradient(180deg,#dbe8fb 0%,#eef1f6 100%)" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/circuit.svg"
        alt=""
        aria-hidden
        className="page-circuit absolute inset-0 -z-10 h-full w-full object-cover object-top opacity-45"
      />
      <div className="wrap relative">
        {back && (
          <Link
            href="/resources"
            className="mb-3.5 block w-fit text-[0.92rem] font-bold text-blue hover:underline"
          >
            ← Back to resources
          </Link>
        )}
        {eyebrow && (
          <span className="mb-2 inline-block text-[0.78rem] font-extrabold uppercase tracking-[0.14em] text-blue">
            {eyebrow}
          </span>
        )}
        <h1 className="m-0 text-[clamp(1.9rem,4.6vw,2.8rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-navy">
          {title}
        </h1>
        {intro && (
          <p className="mt-3 max-w-[62ch] text-[1.05rem] text-muted">{intro}</p>
        )}
      </div>
    </header>
  );
}
