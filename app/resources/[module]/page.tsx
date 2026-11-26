import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { modules, sectionById } from "@/lib/content";
import { PageHead } from "@/components/page-head";
import { Blocks } from "@/components/blocks";

export function generateStaticParams() {
  return modules().map((m) => ({ module: m.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ module: string }>;
}): Promise<Metadata> {
  const { module } = await params;
  const sec = sectionById(module);
  return { title: sec ? `${sec.title} · Build with AI` : "Build with AI" };
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  const sec = sectionById(module);
  if (!sec || sec.kind !== "module") notFound();

  const list = modules();
  const next = list[list.indexOf(sec) + 1];

  return (
    <>
      <PageHead back eyebrow={`Hands-on ${sec.number}`} title={sec.title} intro={sec.intro} />

      <main className="wrap px-4 pb-24 pt-8">
        <Blocks blocks={sec.blocks} />

        {next && (
          <Link
            href={`/resources/${next.id}`}
            className="mt-6 flex flex-col gap-0.5 rounded-[var(--radius-card)] px-5 py-4 text-white shadow-[0_10px_24px_rgba(36,101,222,0.3)] transition-transform hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg,#2465de 0%,#3f7bef 100%)" }}
          >
            <span className="text-[0.72rem] font-extrabold uppercase tracking-wider opacity-85">
              Next up
            </span>
            <span className="text-[1.12rem] font-extrabold">
              {(next.cardTitle || next.title) + " →"}
            </span>
          </Link>
        )}
      </main>
    </>
  );
}
