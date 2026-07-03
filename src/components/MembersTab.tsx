"use client";

import { useMemo, useState } from "react";
import { CategoryBalanceChips } from "@/components/CategoryBalanceChips";
import { isEventDay } from "@/lib/dates";
import { getLastActivityDate, getMemberBalance, parseBulkNames } from "@/lib/members";
import type { Member, Transaction } from "@/types";

type Props = {
  members: Member[];
  transactions: Transaction[];
  onAddMembers: (names: string[]) => void;
};

export function MembersTab({ members, transactions, onAddMembers }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [bulkInput, setBulkInput] = useState("");
  const [bulkMessage, setBulkMessage] = useState<string | null>(null);
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
  const eventDay = isEventDay();

  const rankedMembers = useMemo(() => {
    const q = searchQuery.trim();
    return members
      .map((m) => ({
        ...m,
        balance: getMemberBalance(m.id, transactions),
        lastActivity: getLastActivityDate(m.id, transactions),
      }))
      .filter((m) => !q || m.name.includes(q))
      .sort((a, b) => b.balance - a.balance || a.name.localeCompare(b.name, "ko"));
  }, [members, transactions, searchQuery]);

  const handleBulkAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const names = parseBulkNames(bulkInput);

    if (names.length === 0) {
      setBulkMessage("추가할 이름을 입력해 주세요.");
      return;
    }

    const existingNames = new Set(members.map((m) => m.name));
    const newNames = names.filter((n) => !existingNames.has(n));
    const duplicates = names.filter((n) => existingNames.has(n));

    if (newNames.length === 0) {
      setBulkMessage("입력한 이름이 모두 이미 명단에 있습니다.");
      return;
    }

    // TODO: 서버 연동 시 addMembersApi(newNames) 호출 후 상태 갱신
    onAddMembers(newNames);
    setBulkInput("");

    const parts: string[] = [`${newNames.length}명 추가됨`];
    if (duplicates.length > 0) {
      parts.push(`${duplicates.length}명 중복 제외`);
    }
    setBulkMessage(parts.join(" · "));
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <section>
        <label
          htmlFor="members-search"
          className="mb-2 block text-sm font-medium text-navy/70"
        >
          이름 검색
        </label>
        <input
          id="members-search"
          type="search"
          placeholder="이름으로 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-navy/15 bg-white/60 px-3 py-2.5 text-sm text-navy placeholder:text-navy/30 focus:border-navy/30 focus:outline-none focus:ring-1 focus:ring-navy/20"
        />
      </section>

      <section>
        <div className="overflow-hidden rounded-xl border border-navy/10 bg-white/40">
          <div className="grid grid-cols-[2.5rem_1fr_5.5rem_3.5rem] gap-2 border-b border-navy/10 bg-navy/5 px-3 py-2 text-xs font-medium text-navy/60 sm:grid-cols-[3rem_1fr_7rem_4rem] sm:px-4">
            <span>순위</span>
            <span>이름</span>
            <span className="hidden sm:inline">최근 활동일</span>
            <span className="text-right">잔액</span>
          </div>

          {rankedMembers.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-navy/40">
              검색 결과가 없습니다
            </p>
          ) : (
            <ul className="divide-y divide-navy/5">
              {rankedMembers.map((m, index) => {
                const isExpanded = expandedMemberId === m.id;

                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedMemberId(isExpanded ? null : m.id)
                      }
                      className="grid w-full grid-cols-[2.5rem_1fr_5.5rem_3.5rem] gap-2 px-3 py-3 text-left text-sm transition-colors hover:bg-navy/[0.03] sm:grid-cols-[3rem_1fr_7rem_4rem] sm:px-4"
                    >
                      <span className="font-mono text-navy/40">{index + 1}</span>
                      <span className="font-medium text-navy">{m.name}</span>
                      <span className="hidden truncate text-xs text-navy/40 sm:inline">
                        {m.lastActivity ?? "—"}
                      </span>
                      <span className="text-right font-mono font-bold text-gold">
                        {m.balance}
                      </span>
                    </button>
                    {isExpanded && (
                      <div className="border-t border-navy/5 bg-navy/[0.02] px-4 py-2.5">
                        <CategoryBalanceChips
                          memberId={m.id}
                          transactions={transactions}
                          includeEventOnly={eventDay}
                        />
                        {m.balance === 0 && (
                          <p className="text-xs text-navy/40">
                            아직 적립 내역이 없습니다
                          </p>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <p className="mt-2 text-xs text-navy/40 sm:hidden">
          행을 탭하면 항목별 적립 내역을 볼 수 있어요
        </p>
      </section>

      <section className="rounded-xl border border-navy/10 bg-white/30 p-4">
        <h2 className="mb-1 font-serif text-base font-semibold text-navy">
          명단 일괄 추가
        </h2>
        <p className="mb-3 text-xs text-navy/50">
          이름을 줄바꿈 또는 쉼표(,)로 구분해 붙여넣으세요
        </p>
        <form onSubmit={handleBulkAdd} className="space-y-3">
          <textarea
            value={bulkInput}
            onChange={(e) => {
              setBulkInput(e.target.value);
              setBulkMessage(null);
            }}
            placeholder={"홍길동\n김철수, 이영희"}
            rows={4}
            className="w-full resize-none rounded-lg border border-navy/15 bg-white/60 px-3 py-2.5 text-sm text-navy placeholder:text-navy/30 focus:border-navy/30 focus:outline-none focus:ring-1 focus:ring-navy/20"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-navy py-2.5 text-sm font-medium text-paper transition-colors hover:bg-navy-light"
          >
            추가하기
          </button>
          {bulkMessage && (
            <p className="text-center text-xs text-navy/60">{bulkMessage}</p>
          )}
        </form>
      </section>
    </div>
  );
}
