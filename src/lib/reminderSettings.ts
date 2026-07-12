import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { BibleReminderSettings } from "@/types";

const SETTINGS_DOC = doc(db, "settings", "bibleReminder");

export const DEFAULT_REMINDER_SETTINGS: BibleReminderSettings = {
  enabled: true,
  dayOfWeek: 0, // 일요일
  hour: 15,
  minute: 30,
  message: "성경책 지참 확인하셔야 해요!",
};

export async function getReminderSettings(): Promise<BibleReminderSettings> {
  const snap = await getDoc(SETTINGS_DOC);
  if (!snap.exists()) {
    return DEFAULT_REMINDER_SETTINGS;
  }
  return {
    ...DEFAULT_REMINDER_SETTINGS,
    ...(snap.data() as BibleReminderSettings),
  };
}

export async function saveReminderSettings(
  settings: BibleReminderSettings,
): Promise<void> {
  await setDoc(SETTINGS_DOC, settings, { merge: true });
}

const DAY_LABELS = [
  "일요일",
  "월요일",
  "화요일",
  "수요일",
  "목요일",
  "금요일",
  "토요일",
];

export function describeSchedule(settings: BibleReminderSettings): string {
  const day = DAY_LABELS[settings.dayOfWeek] ?? "?";
  const hh = String(settings.hour).padStart(2, "0");
  const mm = String(settings.minute).padStart(2, "0");
  const period = settings.hour < 12 ? "오전" : "오후";
  const displayHour = settings.hour % 12 === 0 ? 12 : settings.hour % 12;
  return `매주 ${day} ${period} ${displayHour}시 ${mm}분 (${hh}:${mm})`;
}
