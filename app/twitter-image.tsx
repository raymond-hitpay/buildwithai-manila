import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const alt = "HitPay · Build with AI — Manila";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logo = readFileSync(
    join(process.cwd(), "public", "hitpay-logo-white.svg")
  ).toString("base64");
  const logoSrc = `data:image/svg+xml;base64,${logo}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0e2859 0%, #16366e 100%)",
        }}
      >
        <img src={logoSrc} width={260} height={65} alt="HitPay" />
        <div
          style={{
            marginTop: 44,
            fontSize: 56,
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-0.02em",
            textAlign: "center",
          }}
        >
          Build with AI — Manila
        </div>
        <div
          style={{
            marginTop: 18,
            fontSize: 28,
            fontWeight: 500,
            color: "#9db4e0",
          }}
        >
          Workshop Resources
        </div>
      </div>
    ),
    { ...size }
  );
}
