import { INITIAL_MEMBER_NAMES } from "@/data/initialMembers";
import type { Member, Transaction } from "@/types";
import { formatDate } from "./dates";

export function createInitialMembers(): Member[] {
  const now = Date.now();
  return INITIAL_MEMBER_NAMES.map((name, index) => ({
    id: `member-${index + 1}`,
    name,
    createdAt: now,
  }));
}

export function getMemberBalance(
  memberId: string,
  transactions: Transaction[],
): number {
  return transactions
    .filter((t) => t.memberId === memberId)
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getLastActivityDate(
  memberId: string,
  transactions: Transaction[],
): string | null {
  const memberTx = transactions
    .filter((t) => t.memberId === memberId)
    .sort((a, b) => b.timestamp - a.timestamp);

  if (memberTx.length === 0) return null;
  return formatDate(memberTx[0].timestamp);
}

export function parseBulkNames(input: string): string[] {
  return input
    .split(/[\n,，、]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}
