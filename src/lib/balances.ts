import { CATEGORIES } from "@/data/categories";
import type { Transaction } from "@/types";

export type CategoryBreakdownItem = {
  name: string;
  total: number;
};

/** 적립 항목별 소계 (0인 항목은 제외) */
export function getMemberCategoryBreakdown(
  memberId: string,
  transactions: Transaction[],
  includeEventOnly: boolean,
): CategoryBreakdownItem[] {
  const visibleNames = new Set(
    CATEGORIES.filter((c) => !c.eventOnly || includeEventOnly).map((c) => c.name),
  );

  const totals = new Map<string, number>();
  for (const tx of transactions) {
    if (tx.memberId !== memberId || !visibleNames.has(tx.category)) continue;
    totals.set(tx.category, (totals.get(tx.category) ?? 0) + tx.amount);
  }

  return CATEGORIES.filter((c) => !c.eventOnly || includeEventOnly)
    .map((c) => ({ name: c.name, total: totals.get(c.name) ?? 0 }))
    .filter((item) => item.total > 0);
}
