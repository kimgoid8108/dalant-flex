"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { isBibleCheckInWindowOpen, toDateKey } from "@/lib/dates";
import { MemberSearchInput } from "@/components/MemberSearchInput";
import type { Member } from "@/types";

const CATEGORY_NAME = "성경책 지참";
const CATEGORY_AMOUNT = 1;

export default function BibleCheckInPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [status, setStatus] = useState<
    "idle" | "checking" | "success" | "already" | "error"
  >("idle");

  const windowOpen = useMemo(() => isBibleCheckInWindowOpen(), []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "members"), (snap) => {
      setMembers(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Member, "id">),
        })),
      );
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const selectedMember = members.find((m) => m.id === selectedMemberId);

  const handleCheckIn = async () => {
    if (!selectedMemberId) return;
    setStatus("checking");

    try {
      // 오늘 이미 체크인했는지 확인
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const existingSnap = await getDocs(
        query(
          collection(db, "transactions"),
          where("memberId", "==", selectedMemberId),
          where("category", "==", CATEGORY_NAME),
        ),
      );
      const alreadyToday = existingSnap.docs.some((d) => {
        const ts = d.data().timestamp as number;
        return toDateKey(new Date(ts)) === toDateKey(new Date());
      });

      if (alreadyToday) {
        setStatus("already");
        return;
      }

      await addDoc(collection(db, "transactions"), {
        memberId: selectedMemberId,
        category: CATEGORY_NAME,
        amount: CATEGORY_AMOUNT,
        timestamp: Date.now(),
      });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper text-sm text-navy/50">
        불러오는 중...
      </div>
    );
  }

  if (!windowOpen) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-paper px-6 text-center">
        <h1 className="font-serif text-xl font-bold text-navy">달란트플렉스</h1>
        <p className="text-navy/70">지금은 체크인할 수 있는 시간이 아니에요.</p>
        <p className="text-sm text-navy/50">
          셀모임 시간(오후 3시 30분~4시 30분)에 다시 시도해주세요.
        </p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-paper px-6 text-center">
        <div className="text-5xl">📖</div>
        <h1 className="font-serif text-xl font-bold text-navy">
          {selectedMember?.name}님, 성경책 지참 확인됐어요!
        </h1>
        <p className="text-sm text-navy/60">
          +{CATEGORY_AMOUNT} 달란트 적립됐어요
        </p>
      </div>
    );
  }

  if (status === "already") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-paper px-6 text-center">
        <h1 className="font-serif text-xl font-bold text-navy">
          오늘은 이미 체크인하셨어요
        </h1>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setSelectedMemberId("");
          }}
          className="mt-2 rounded-lg border border-navy/15 px-4 py-2 text-sm text-navy"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-paper px-6 pt-16">
      <h1 className="mb-1 font-serif text-xl font-bold text-navy">
        성경책 지참 체크인
      </h1>
      <p className="mb-6 text-sm text-navy/60">
        이름을 검색해서 선택한 다음 체크인해주세요
      </p>

      <div className="w-full max-w-sm">
        <MemberSearchInput
          members={members}
          selectedMemberId={selectedMemberId}
          onSelect={(m) => setSelectedMemberId(m ? m.id : "")}
          placeholder="이름을 입력하세요..."
        />

        <button
          type="button"
          disabled={!selectedMemberId || status === "checking"}
          onClick={handleCheckIn}
          className="mt-4 w-full rounded-xl bg-stamp py-3 font-serif font-bold text-white transition-colors hover:bg-stamp-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          {status === "checking" ? "확인 중..." : "체크인 완료"}
        </button>

        {status === "error" && (
          <p className="mt-3 text-center text-xs text-stamp/80">
            문제가 발생했어요. 다시 시도해주세요.
          </p>
        )}
      </div>
    </div>
  );
}
