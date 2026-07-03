import type { Transaction } from "@/types";
import { isSameDay } from "./dates";

export function hasCategoryToday(
  memberId: string,
  categoryName: string,
  transactions: Transaction[],
  now: Date = new Date(),
): boolean {
  return transactions.some(
    (t) =>
      t.memberId === memberId &&
      t.category === categoryName &&
      isSameDay(t.timestamp, now),
  );
}

export function generateTransactionId(): string {
  return `tx-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
