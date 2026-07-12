"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function BibleQrPage() {
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(`${window.location.origin}/checkin/bible`);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-paper px-6 text-center">
      <div>
        <h1 className="font-serif text-2xl font-bold text-navy">
          성경책 지참 QR
        </h1>
        <p className="mt-1 text-sm text-navy/60">
          셀원들에게 이 화면을 보여주고 스캔하게 해주세요
        </p>
      </div>

      {url && (
        <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-lg">
          <QRCodeSVG value={url} size={260} />
        </div>
      )}

      <p className="max-w-xs text-xs text-navy/40">{url}</p>
    </div>
  );
}
