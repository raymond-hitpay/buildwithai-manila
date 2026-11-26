"use client";

import { QRCodeSVG } from "qrcode.react";

export function QrCode({ value, size = 180 }: { value: string; size?: number }) {
  return (
    <div className="rounded-2xl bg-white p-3 shadow-[0_2px_10px_rgba(14,40,89,0.08)] ring-1 ring-line">
      <QRCodeSVG
        value={value}
        size={size}
        level="M"
        marginSize={0}
        fgColor="#0e2859"
        bgColor="#ffffff"
      />
    </div>
  );
}
