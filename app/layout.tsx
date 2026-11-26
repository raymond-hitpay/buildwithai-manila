import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/top-nav";
import { Footer } from "@/components/footer";
import { AuthProvider } from "@/components/auth-provider";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HitPay · Build with AI — Manila · Resources",
  description:
    "Workshop resources for HitPay Build with AI, Manila. Download files and copy prompts during the session.",
  robots: { index: false, follow: false },
  icons: {
    icon: "/hitpay-mark.svg",
    shortcut: "/hitpay-mark.svg",
    apple: "/hitpay-mark.svg",
  },
  openGraph: {
    title: "HitPay · Build with AI — Manila",
    description:
      "Workshop resources for HitPay Build with AI, Manila. Download files and copy prompts during the session.",
    siteName: "HitPay Build with AI — Manila",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HitPay · Build with AI — Manila",
    description:
      "Workshop resources for HitPay Build with AI, Manila. Download files and copy prompts during the session.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0e2859",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${jakarta.variable} ${jetbrains.variable}`}
    >
      <body>
        <AuthProvider>
          <TopNav />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
