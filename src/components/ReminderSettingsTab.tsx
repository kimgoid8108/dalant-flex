"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DEFAULT_REMINDER_SETTINGS,
  describeSchedule,
  getReminderSettings,
  saveReminderSettings,
} from "@/lib/reminderSettings";
import { registerForPushNotifications } from "@/lib/push";
import type { BibleReminderSettings } from "@/types";

const DAY_OPTIONS = [
  { value: 0, label: "일" },
  { value: 1, label: "월" },
  { value: 2, label: "화" },
  { value: 3, label: "수" },
  { value: 4, label: "목" },
  { value: 5, label: "금" },
  { value: 6, label: "토" },
];

export function ReminderSettingsTab() {
  const [settings, setSettings] = useState<BibleReminderSettings>(
    DEFAULT_REMINDER_SETTINGS,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [pushStatus, setPushStatus] = useState<
    "idle" | "requesting" | "granted" | "denied" | "unsupported" | "error"
  >("idle");

  useEffect(() => {
    (async () => {
      try {
        const loaded = await getReminderSettings();
        setSettings(loaded);
      } finally {
        setLoading(false);
      }
    })();

    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        setPushStatus("granted");
      } else if (Notification.permission === "denied") {
        setPushStatus("denied");
      }
    }
  }, []);

  const handleTimeChange = (value: string) => {
    const [h, m] = value.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return;
    setSettings((prev) => ({ ...prev, hour: h, minute: m }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedMessage(null);
    try {
      await saveReminderSettings(settings);
      setSavedMessage("저장했어요!");
    } catch {
      setSavedMessage("저장에 실패했어요. 다시 시도해주세요.");
    } finally {
      setSaving(false);
      setTimeout(() => setSavedMessage(null), 3000);
    }
  };

  const handleRequestPush = async () => {
    setPushStatus("requesting");
    const result = await registerForPushNotifications();
    setPushStatus(result);
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-navy/50">
        불러오는 중...
      </div>
    );
  }

  const timeValue = `${String(settings.hour).padStart(2, "0")}:${String(
    settings.minute,
  ).padStart(2, "0")}`;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <section>
        <h2 className="mb-1 font-serif text-lg font-semibold text-navy">
          성경책 지참 알림 설정
        </h2>
        <p className="text-sm text-navy/60">
          폰 알람 맞추듯, 원하는 요일과 시간에 알림이 자동으로 가도록
          설정하세요.
        </p>
      </section>

      <section className="rounded-xl border border-navy/10 bg-white/50 p-4">
        <p className="mb-3 text-sm text-navy/70">
          이 기기로 알림을 받으려면 먼저 알림을 허용해주세요. (기기마다 한
          번씩만 하면 돼요)
        </p>
        <button
          type="button"
          onClick={handleRequestPush}
          disabled={pushStatus === "requesting" || pushStatus === "granted"}
          className="w-full rounded-xl border border-navy/15 bg-white py-3 font-medium text-navy transition-colors hover:bg-navy/5 disabled:opacity-60"
        >
          {pushStatus === "granted"
            ? "✓ 이 기기에서 알림 받는 중"
            : pushStatus === "requesting"
              ? "요청 중..."
              : "이 기기에서 알림 받기"}
        </button>
        {pushStatus === "denied" && (
          <p className="mt-2 text-xs text-stamp/80">
            알림이 차단되어 있어요. 브라우저 설정에서 알림 권한을 허용해주세요.
          </p>
        )}
        {pushStatus === "unsupported" && (
          <p className="mt-2 text-xs text-stamp/80">
            이 브라우저/기기는 푸시 알림을 지원하지 않아요.
          </p>
        )}
        {pushStatus === "error" && (
          <p className="mt-2 text-xs text-stamp/80">
            알림 등록 중 문제가 발생했어요. 다시 시도해주세요.
          </p>
        )}
      </section>

      <section className="rounded-xl border border-navy/10 bg-white/50 p-4">
        <p className="mb-3 text-sm text-navy/70">
          알림이 오면 이 화면을 눌러서 QR을 셀원들에게 보여주세요.
        </p>
        <Link
          href="/staff/bible-qr"
          className="block w-full rounded-xl bg-navy py-3 text-center font-serif font-bold text-paper transition-colors hover:bg-navy-dark"
        >
          성경책 지참 QR 보여주기
        </Link>
      </section>

      <section className="space-y-4 rounded-xl border border-navy/10 bg-white/50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-navy">알림 켜기</span>
          <button
            type="button"
            onClick={() =>
              setSettings((prev) => ({ ...prev, enabled: !prev.enabled }))
            }
            className={`relative h-7 w-12 rounded-full transition-colors ${
              settings.enabled ? "bg-stamp" : "bg-navy/20"
            }`}
          >
            <span
              className={`absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                settings.enabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-navy/70">
            요일
          </label>
          <div className="flex gap-1.5">
            {DAY_OPTIONS.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() =>
                  setSettings((prev) => ({ ...prev, dayOfWeek: d.value }))
                }
                className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                  settings.dayOfWeek === d.value
                    ? "border-navy bg-navy text-paper"
                    : "border-navy/15 bg-white/60 text-navy/70"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="reminder-time"
            className="mb-2 block text-sm font-medium text-navy/70"
          >
            시간
          </label>
          <input
            id="reminder-time"
            type="time"
            value={timeValue}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="w-full rounded-lg border border-navy/15 bg-white/60 px-3 py-2.5 text-sm text-navy focus:border-navy/30 focus:outline-none focus:ring-1 focus:ring-navy/20"
          />
        </div>

        <div>
          <label
            htmlFor="reminder-message"
            className="mb-2 block text-sm font-medium text-navy/70"
          >
            알림 문구
          </label>
          <input
            id="reminder-message"
            type="text"
            value={settings.message}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, message: e.target.value }))
            }
            className="w-full rounded-lg border border-navy/15 bg-white/60 px-3 py-2.5 text-sm text-navy focus:border-navy/30 focus:outline-none focus:ring-1 focus:ring-navy/20"
          />
        </div>

        <div className="rounded-lg bg-gold/10 px-3 py-2 text-sm text-navy/80">
          다음 알림: {describeSchedule(settings)}
          {!settings.enabled && " (현재 꺼져있음)"}
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-xl bg-stamp py-3 font-serif font-bold text-white transition-colors hover:bg-stamp-dark disabled:opacity-50"
        >
          {saving ? "저장 중..." : "저장"}
        </button>

        {savedMessage && (
          <p className="text-center text-sm text-navy/70">{savedMessage}</p>
        )}
      </section>
    </div>
  );
}
