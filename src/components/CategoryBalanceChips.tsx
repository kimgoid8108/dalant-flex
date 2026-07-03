import { getMemberCategoryBreakdown } from "@/lib/balances";
import type { Transaction } from "@/types";

type Props = {
  memberId: string;
  transactions: Transaction[];
  includeEventOnly: boolean;
};

export function CategoryBalanceChips({
  memberId,
  transactions,
  includeEventOnly,
}: Props) {
  const breakdown = getMemberCategoryBreakdown(
    memberId,
    transactions,
    includeEventOnly,
  );

  if (breakdown.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {breakdown.map((item) => (
        <span
          key={item.name}
          className="inline-flex items-center gap-1 rounded-full border border-navy/10 bg-white/50 px-2 py-0.5 text-xs text-navy/70"
        >
          {item.name}
          <span className="font-mono font-semibold text-gold">{item.total}</span>
        </span>
      ))}
    </div>
  );
}
