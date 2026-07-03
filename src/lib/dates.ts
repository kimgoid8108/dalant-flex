/** 행사 마감: 2026년 10월 4일 23:59:59 (KST) */
const DEADLINE = new Date("2026-10-04T23:59:59+09:00");

/** 행사 당일: 2026년 10월 4일 (KST, 자정 기준) */
const EVENT_DAY = "2026-10-04";

export function isDeadlinePassed(now: Date = new Date()): boolean {
  return now.getTime() > DEADLINE.getTime();
}

export function isEventDay(now: Date = new Date()): boolean {
  return toDateKey(now) === EVENT_DAY;
}

/** 자정 기준 날짜 키 (YYYY-MM-DD, 로컬 타임존) */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isSameDay(timestamp: number, date: Date = new Date()): boolean {
  return toDateKey(new Date(timestamp)) === toDateKey(date);
}
