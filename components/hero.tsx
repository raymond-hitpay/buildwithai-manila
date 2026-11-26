import Image from "next/image";
import { CONTENT } from "@/lib/content";
import { DtiLogo, CommonGroundLogo } from "@/components/icons";
import { HeroCta } from "@/components/hero-cta";

export function Hero() {
  const h = CONTENT.hero;
  return (
    <header
      className="relative isolate flex min-h-[100svh] flex-col justify-center overflow-hidden px-6 py-[clamp(28px,6vh,72px)] sm:px-16 lg:px-24"
      style={{
        background:
          "linear-gradient(180deg,#d7e6fb 0%,#e8eef7 38%,#eef1f4 64%,#eceae6 100%)",
      }}
    >
      {/* decorative layers */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/circuit.svg"
          alt=""
          aria-hidden
          className="hero-circuit absolute left-0 top-0 h-[clamp(300px,46%,520px)] w-full object-cover object-top opacity-85"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/skyline.svg"
          alt=""
          aria-hidden
          className="absolute bottom-0 left-0 h-[clamp(200px,40%,420px)] w-full object-cover object-bottom opacity-75"
        />
      </div>

      {/* centred headline */}
      <div className="relative flex flex-1 flex-col items-center justify-center gap-[clamp(14px,2.4vh,26px)] py-6 text-center">
        <h1 className="hero-title-anim m-0 text-[clamp(3.4rem,11vw,9rem)] font-extrabold leading-[0.95] tracking-[-0.04em]">
          {h.title}
        </h1>
        {h.subtitle && (
          <p className="anim-rise anim-delay-1 m-0 max-w-[24ch] text-[clamp(1.05rem,2.4vw,1.5rem)] font-medium leading-snug text-navy sm:max-w-[60ch]">
            {h.subtitle}
          </p>
        )}
        <div className="anim-rise anim-delay-2">
          <HeroCta label={h.ctaLabel} />
        </div>
      </div>

      {/* credit row */}
      <div className="relative flex flex-wrap items-end justify-between gap-6 max-[560px]:flex-col max-[560px]:items-start">
        <div className="flex flex-col gap-3">
          <span className="text-[clamp(0.82rem,1.6vw,1rem)] font-medium text-[#6b7891]">
            {h.hostedByLabel}
          </span>
          <Image
            src="/hitpay-logo.svg"
            alt={CONTENT.meta.brand}
            width={232}
            height={58}
            className="h-[clamp(40px,6vw,58px)] w-auto"
          />
        </div>
        <div className="flex flex-col items-end gap-3 text-right max-[560px]:items-start max-[560px]:text-left">
          <span className="text-[clamp(0.82rem,1.6vw,1rem)] font-medium text-[#6b7891]">
            {h.supportLabel}
          </span>
          <div className="flex items-center gap-[clamp(18px,3vw,32px)]">
            <DtiLogo />
            <CommonGroundLogo />
          </div>
        </div>
      </div>
    </header>
  );
}
