import Link from "next/link";
import type { Section } from "@/lib/content";

export function ModuleCard({ sec }: { sec: Section }) {
  return (
    <Link
      href={`/resources/${sec.id}`}
      className="flex flex-col gap-2.5 rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-[3px] hover:border-blue hover:shadow-[var(--shadow-lg)]"
    >
      <span className="grid h-12 w-12 place-items-center rounded-2xl border border-blue-line bg-blue-soft text-[1.55rem]">
        {sec.icon || "✦"}
      </span>
      <span className="flex flex-1 flex-col gap-1">
        <span className="text-[0.72rem] font-extrabold uppercase tracking-wider text-blue">
          Hands-on {sec.number}
        </span>
        <span className="text-[1.12rem] font-extrabold leading-tight tracking-tight text-navy">
          {sec.cardTitle || sec.title}
        </span>
        <span className="text-[0.92rem] leading-snug text-muted">{sec.intro}</span>
      </span>
      <span className="mt-0.5 font-extrabold text-blue">Open →</span>
    </Link>
  );
}
