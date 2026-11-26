import type { Metadata } from "next";
import { ShowcaseClient } from "@/components/showcase/showcase-client";

export const metadata: Metadata = {
  title: "Showcase · HitPay Build with AI — Manila",
  description:
    "Share what you built, preview it live, and vote for your favourites. Crowdsourced showcase for Build with AI, Manila.",
};

export default function ShowcasePage() {
  return <ShowcaseClient />;
}
