"use client";

import { useMemo, useState } from "react";
import { MemberSearchInput } from "@/components/MemberSearchInput";
import { TransactionRow } from "@/components/TransactionRow";
import type { Member, Transaction } from "@/types";

type Props = {
  members: Member[];
  transactions: Transaction[];
};

export function TransactionsTab({ members, transactions }: Props) {
  const [filterMemberId, setFilterMemberId] = useState("");

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => !filterMemberId || t.memberId === filterMemberId)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [transactions, filterMemberId]);

  const getMemberName = (memberId: string) =>
    members.find((m) => m.id === memberId)?.name ?? "알 수 없음";

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <section>
        <label className="mb-2 block text-sm font-medium text-navy/70">
          사람별 필터
        </label>
        <MemberSearchInput
          members={members}
          selectedMemberId={filterMemberId}
          onSelect={(member) => setFilterMemberId(member ? member.id : "")}
          placeholder="이름으로 검색..."
          clearLabel="전체 보기"
        />
      </section>

      <section>
        <div className="overflow-hidden rounded-xl border border-navy/10 bg-white/40">
          {filteredTransactions.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-navy/40">
              {filterMemberId
                ? "해당 인원의 거래내역이 없습니다"
                : "아직 적립 내역이 없습니다"}
            </p>
          ) : (
            <ul className="divide-y divide-navy/5">
              {filteredTransactions.map((tx) => (
                <TransactionRow
                  key={tx.id}
                  transaction={tx}
                  memberName={getMemberName(tx.memberId)}
                />
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
