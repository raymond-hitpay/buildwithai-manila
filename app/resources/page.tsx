import type { Metadata } from "next";
import { CONTENT, sectionById, modules } from "@/lib/content";
import { PageHead } from "@/components/page-head";
import { SectionHead } from "@/components/section-head";
import { Blocks } from "@/components/blocks";
import { ModuleCard } from "@/components/module-card";

export const metadata: Metadata = {
  title: "Resources · HitPay Build with AI — Manila",
};

export default function ResourcesPage() {
  const start = sectionById("start");
  const infoSections = CONTENT.sections.filter((s) => s.kind === "info");

  return (
    <>
      <PageHead
        eyebrow={CONTENT.meta.eyebrow}
        title={CONTENT.meta.title}
        intro={CONTENT.meta.tagline}
      />

      <main className="wrap px-4 pb-24 pt-2">
        {start && (
          <section className="pt-10">
            <SectionHead number={start.number} title={start.title} intro={start.intro} />
            <Blocks blocks={start.blocks} />
          </section>
        )}

        <section className="pt-10">
          <SectionHead
            title="Hands-on"
            intro="Three guided builds. Open one to follow its steps."
          />
          <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
            {modules().map((sec) => (
              <ModuleCard key={sec.id} sec={sec} />
            ))}
          </div>
        </section>

        {infoSections.map((sec) => (
          <section key={sec.id} className="pt-10">
            <SectionHead number={sec.number} title={sec.title} intro={sec.intro} />
            <Blocks blocks={sec.blocks} />
          </section>
        ))}
      </main>
    </>
  );
}
