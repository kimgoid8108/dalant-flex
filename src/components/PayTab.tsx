"use client";

import { useMemo, useState } from "react";
import { CATEGORIES } from "@/data/categories";
import { CategoryBalanceChips } from "@/components/CategoryBalanceChips";
import { MemberSearchInput } from "@/components/MemberSearchInput";
import { TransactionRow } from "@/components/TransactionRow";
import { isDeadlinePassed, isEventDay } from "@/lib/dates";
import { getMemberBalance } from "@/lib/members";
import { generateTransactionId, hasCategoryToday } from "@/lib/transactions";
import type { Category, Member, Transaction } from "@/types";

type Props = {
  members: Member[];
  transactions: Transaction[];
  onAddTransaction: (transaction: Transaction) => void;
};

export function PayTab({ members, transactions, onAddTransaction }: Props) {
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  const deadlinePassed = isDeadlinePassed();
  const eventDay = isEventDay();

  const visibleCategories = useMemo(
    () =>
      CATEGORIES.filter((cat) => !cat.eventOnly || (cat.eventOnly && eventDay)),
    [eventDay],
  );

  const recentTransactions = useMemo(
    () =>
      [...transactions].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10),
    [transactions],
  );

  const getMemberName = (memberId: string) =>
    members.find((m) => m.id === memberId)?.name ?? "알 수 없음";

  const selectedMember = members.find((m) => m.id === selectedMemberId);
  const balance = selectedMember
    ? getMemberBalance(selectedMember.id, transactions)
    : 0;

  const selectedCategory = visibleCategories.find(
    (c) => c.id === selectedCategoryId,
  );

  const isCategoryDisabled = (cat: Category) => {
    if (!selectedMemberId || deadlinePassed) return true;
    return hasCategoryToday(selectedMemberId, cat.name, transactions);
  };

  const canStamp =
    !deadlinePassed &&
    selectedMemberId &&
    selectedCategory &&
    !isCategoryDisabled(selectedCategory);

  const handleMemberSelect = (member: Member | null) => {
    setSelectedMemberId(member ? member.id : "");
    setSelectedCategoryId(null);
  };

  const handleStamp = () => {
    if (!canStamp || !selectedCategory || !selectedMemberId) return;

    const transaction: Transaction = {
      id: generateTransactionId(),
      memberId: selectedMemberId,
      category: selectedCategory.name,
      amount: selectedCategory.amount,
      timestamp: Date.now(),
    };

    // TODO: 서버 연동 시 addTransactionApi() 호출 후 상태 갱신
    onAddTransaction(transaction);
    setSelectedCategoryId(null);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <section>
        <label className="mb-2 block text-sm font-medium text-navy/70">
          대상자 선택
        </label>
        <MemberSearchInput
          members={members}
          selectedMemberId={selectedMemberId}
          onSelect={handleMemberSelect}
        />

        {selectedMember && (
          <div className="mt-3 rounded-lg border border-gold/30 bg-gold/5 px-4 py-3 text-sm text-navy">
            <p>
              <span className="font-serif font-semibold">
                {selectedMember.name}
              </span>{" "}
              님이 여태 모은 달란트:{" "}
              <span className="font-mono text-lg font-bold text-gold">
                {balance}
              </span>
            </p>
            <div className="mt-2">
              <CategoryBalanceChips
                memberId={selectedMember.id}
                transactions={transactions}
                includeEventOnly={eventDay}
              />
            </div>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-serif text-base font-semibold text-navy">
          적립 항목
        </h2>

        {deadlinePassed ? (
          <div className="rounded-xl border border-navy/10 bg-white/40 px-4 py-8 text-center">
            <p className="font-serif text-navy/70">
              10월 4일 행사가 끝나 적립이 마감되었어요
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {visibleCategories.map((cat) => {
              const disabled = isCategoryDisabled(cat);
              const alreadyPaid = selectedMemberId
                ? hasCategoryToday(selectedMemberId, cat.name, transactions)
                : false;
              const isSelected = selectedCategoryId === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  disabled={disabled && selectedMemberId !== ""}
                  onClick={() => {
                    if (!disabled) setSelectedCategoryId(cat.id);
                  }}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    disabled && selectedMemberId
                      ? "cursor-not-allowed border-navy/5 bg-navy/[0.02] opacity-50"
                      : isSelected
                        ? "border-stamp bg-stamp/5 ring-1 ring-stamp/30"
                        : "border-navy/10 bg-white/50 hover:border-navy/20 hover:bg-white/80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-serif font-semibold text-navy">
                      {cat.name}
                    </span>
                    <span className="shrink-0 font-mono text-lg font-bold text-gold">
                      +{cat.amount}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-navy/50">{cat.note}</p>
                  {cat.managers && (
                    <p className="mt-0.5 text-xs text-navy/40">
                      담당: {cat.managers}
                    </p>
                  )}
                  {alreadyPaid && selectedMemberId && (
                    <p className="mt-2 text-xs font-medium text-stamp/80">
                      오늘 이미 지급됨
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {recentTransactions.length > 0 && (
        <section>
          <h2 className="mb-3 font-serif text-base font-semibold text-navy">
            최근 기록
          </h2>
          <div className="overflow-hidden rounded-xl border border-navy/10 bg-white/40">
            <ul className="divide-y divide-navy/5">
              {recentTransactions.map((tx) => (
                <TransactionRow
                  key={tx.id}
                  transaction={tx}
                  memberName={getMemberName(tx.memberId)}
                />
              ))}
            </ul>
          </div>
        </section>
      )}

      <div className="sticky bottom-0 -mx-4 border-t border-navy/10 bg-paper/95 px-4 py-4 backdrop-blur-sm sm:-mx-6 sm:px-6">
        <button
          type="button"
          disabled={!canStamp}
          onClick={handleStamp}
          className={`w-full rounded-xl py-4 font-serif text-lg font-bold tracking-wide transition-all ${
            canStamp
              ? "bg-stamp text-white shadow-lg shadow-stamp/25 hover:bg-stamp-dark active:scale-[0.98]"
              : "cursor-not-allowed bg-navy/10 text-navy/30"
          }`}
        >
          도장 찍기
        </button>
      </div>
    </div>
  );
}
