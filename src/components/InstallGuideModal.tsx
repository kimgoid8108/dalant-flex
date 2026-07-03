"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "dalantflex-hide-install-guide";

function detectPlatform(): "ios" | "android" {
  if (typeof navigator === "undefined") return "android";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return "ios";
  return "android";
}

export function InstallGuideModal() {
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android">("android");

  useEffect(() => {
    const hidden = window.localStorage.getItem(STORAGE_KEY);
    if (hidden === "1") return;

    setPlatform(detectPlatform());
    setVisible(true);
  }, []);

  if (!visible) return null;

  const close = () => setVisible(false);

  const dontShowAgain = () => {
    window.localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy/40 p-0 sm:items-center sm:p-4">
      <div className="w-full max-w-sm rounded-t-2xl bg-paper p-5 shadow-xl sm:rounded-2xl">
        <h2 className="font-serif text-lg font-bold text-navy">
          홈 화면에 추가하고 더 편하게 쓰세요
        </h2>
        <p className="mt-1 text-sm text-navy/60">
          앱처럼 아이콘 눌러서 바로 켤 수 있어요
        </p>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setPlatform("ios")}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              platform === "ios"
                ? "border-navy bg-navy text-paper"
                : "border-navy/15 bg-white/60 text-navy/70"
            }`}
          >
            아이폰
          </button>
          <button
            type="button"
            onClick={() => setPlatform("android")}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              platform === "android"
                ? "border-navy bg-navy text-paper"
                : "border-navy/15 bg-white/60 text-navy/70"
            }`}
          >
            안드로이드
          </button>
        </div>

        <ol className="mt-4 space-y-2 text-sm text-navy/80">
          {platform === "ios" ? (
            <>
              <li className="font-medium text-stamp/90">
                꼭 &quot;사파리(Safari)&quot; 앱으로 열어주세요. 카카오톡이나
                크롬으로 열면 이 메뉴가 안 보여요.
              </li>
              <li>1. 하단 공유 버튼(네모 + 위쪽 화살표)을 탭하세요</li>
              <li>
                2. 아래로 스크롤해서 &quot;홈 화면에 추가&quot;를 선택하세요
              </li>
              <li>3. 오른쪽 위 &quot;추가&quot;를 탭하면 끝!</li>
            </>
          ) : (
            <>
              <li>1. 오른쪽 위 점 3개(⋮) 메뉴를 탭하세요</li>
              <li>
                2. &quot;홈 화면에 추가&quot; 또는 &quot;앱 설치&quot;를
                선택하세요
              </li>
              <li>3. &quot;설치&quot;를 탭하면 끝!</li>
            </>
          )}
        </ol>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={dontShowAgain}
            className="flex-1 rounded-lg border border-navy/15 bg-white/60 px-4 py-2.5 text-sm font-medium text-navy/60 transition-colors hover:bg-white/90"
          >
            다시 보지 않기
          </button>
          <button
            type="button"
            onClick={close}
            className="flex-1 rounded-lg bg-stamp px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stamp-dark"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
