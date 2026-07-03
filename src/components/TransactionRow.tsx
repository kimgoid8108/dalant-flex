"use client";

import { formatDateTime } from "@/lib/dates";
import type { Transaction } from "@/types";
import { TransactionDeleteButton } from "./TransactionDeleteButton";

type Props = {
  transaction: Transaction;
  memberName: string;
};

export function TransactionRow({ transaction, memberName }: Props) {
  return (
    <li className="flex items-center justify-between gap-2 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-navy">{memberName}</p>
        <p className="truncate text-xs text-navy/50">{transaction.category}</p>
        <p className="font-mono text-xs text-navy/35">
          {formatDateTime(transaction.timestamp)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <span className="font-mono text-base font-bold text-gold">
          +{transaction.amount}
        </span>
        <TransactionDeleteButton
          transaction={transaction}
          memberName={memberName}
        />
      </div>
    </li>
  );
}
