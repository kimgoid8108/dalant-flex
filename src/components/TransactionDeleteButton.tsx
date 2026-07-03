"use client";

import { useState } from "react";
import { deleteTransaction } from "@/lib/firestore/transactions";
import type { Transaction } from "@/types";
import { useToast } from "./ToastProvider";

type Props = {
  transaction: Transaction;
  memberName: string;
};

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 9.24A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-9.24.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function TransactionDeleteButton({ transaction, memberName }: Props) {
  const { showToast } = useToast();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteTransaction(transaction.id);
      showToast("기록을 삭제했어요");
      setConfirming(false);
    } catch {
      showToast("기록 삭제에 실패했어요. 다시 시도해 주세요", "error");
    } finally {
      setDeleting(false);
    }
  };

  if (confirming) {
    return (
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <p className="max-w-[10rem] text-right text-xs leading-snug text-navy/60">
          {memberName}님의 &apos;{transaction.category}&apos; +{transaction.amount}{" "}
          기록을 삭제할까요?
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            disabled={deleting}
            onClick={() => setConfirming(false)}
            className="rounded px-2 py-0.5 text-xs text-navy/50 hover:text-navy/80"
          >
            취소
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={handleConfirmDelete}
            className="rounded bg-stamp/10 px-2 py-0.5 text-xs font-medium text-stamp hover:bg-stamp/20 disabled:opacity-50"
          >
            {deleting ? "삭제 중…" : "삭제"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      aria-label={`${memberName} ${transaction.category} 기록 삭제`}
      className="shrink-0 rounded p-1 text-navy/25 transition-colors hover:text-navy/50"
    >
      <TrashIcon />
    </button>
  );
}
