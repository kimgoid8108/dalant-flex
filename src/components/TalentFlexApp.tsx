"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ToastProvider } from "@/components/ToastProvider";
import { InstallGuideModal } from "@/components/InstallGuideModal";
import type { Member, TabId, Transaction } from "@/types";
import { MembersTab } from "./MembersTab";
import { PayTab } from "./PayTab";
import { TabNavigation } from "./TabNavigation";
import { TransactionsTab } from "./TransactionsTab";

const MEMBERS_COLLECTION = "members";
const TRANSACTIONS_COLLECTION = "transactions";

const SEED_NAMES = [
  "고주영",
  "구민경",
  "권예지",
  "권은서",
  "김건우",
  "김경영",
  "김여경",
  "김예은",
  "김예준",
  "김유민",
  "김윤수",
  "김의현",
  "김하은",
  "남주현",
  "노영우",
  "류도현",
  "류승원",
  "류재원",
  "박다영",
  "박예슬",
  "백서하",
  "백성애",
  "백현승",
  "백현희",
  "서채원",
  "손두곤",
  "신민승",
  "심예린",
  "심예솔",
  "안효경",
  "엄태훈",
  "오유근",
  "유지호",
  "윤찬미",
  "이가영",
  "이나영",
  "이민서",
  "이서경",
  "이수완",
  "이영철",
  "이예지",
  "이웅렬",
  "이하은",
  "이혜영",
  "임종호",
  "장효진",
  "전은총",
  "정건수",
  "정영민",
  "정예원",
  "정윤아",
  "정혜민",
  "조민혁",
  "조익현",
  "조현아",
  "채서연",
  "최대혁",
  "최민서",
  "최소진",
  "최수아",
  "최해린",
  "최형곤",
  "최효윤",
  "허가엘",
  "홍승연",
  "홍승훈",
  "황평은",
];

/**
 * Firestore 트랜잭션으로 "시딩 잠금 문서"를 원자적으로 선점한다.
 * 여러 탭/새로고침에서 동시에 실행돼도 딱 하나만 true를 받는다.
 */
async function claimSeedLock(): Promise<boolean> {
  const lockRef = doc(db, "meta", "membersSeedLock");
  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(lockRef);
      if (snap.exists()) {
        throw new Error("ALREADY_SEEDED");
      }
      tx.set(lockRef, { seededAt: Date.now() });
    });
    return true;
  } catch {
    return false;
  }
}

export function TalentFlexApp() {
  const [activeTab, setActiveTab] = useState<TabId>("pay");
  const [members, setMembers] = useState<Member[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [seedChecked, setSeedChecked] = useState(false);

  // 실시간 구독: members
  useEffect(() => {
    const unsub = onSnapshot(collection(db, MEMBERS_COLLECTION), (snap) => {
      const list: Member[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Member, "id">),
      }));
      setMembers(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 실시간 구독: transactions
  useEffect(() => {
    const q = query(
      collection(db, TRANSACTIONS_COLLECTION),
      orderBy("timestamp", "desc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      const list: Transaction[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Transaction, "id">),
      }));
      setTransactions(list);
    });
    return () => unsub();
  }, []);

  // 최초 1회: members 컬렉션이 비어있으면 기본 67명을 시드로 채워 넣는다
  // (Firestore 트랜잭션 잠금으로 동시 실행되어도 중복 삽입되지 않는다)
  useEffect(() => {
    if (loading || seedChecked) return;
    setSeedChecked(true);

    if (members.length > 0) return;

    (async () => {
      const canSeed = await claimSeedLock();
      if (!canSeed) return; // 다른 인스턴스가 이미 처리 중이거나 완료함

      const now = Date.now();
      await Promise.all(
        SEED_NAMES.map((name) =>
          addDoc(collection(db, MEMBERS_COLLECTION), {
            name,
            createdAt: now,
          }),
        ),
      );
    })();
  }, [loading, members.length, seedChecked]);

  const handleAddTransaction = useCallback(async (transaction: Transaction) => {
    const { id: _localId, ...data } = transaction;
    void _localId; // Firestore가 실제 문서 ID를 새로 발급하므로 로컬 임시 id는 버린다
    await addDoc(collection(db, TRANSACTIONS_COLLECTION), data);
    // 저장 후 화면 갱신은 위 onSnapshot 구독이 자동으로 처리한다
  }, []);

  const handleAddMembers = useCallback(async (names: string[]) => {
    const now = Date.now();
    await Promise.all(
      names.map((name) =>
        addDoc(collection(db, MEMBERS_COLLECTION), { name, createdAt: now }),
      ),
    );
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-navy/50">
        불러오는 중...
      </div>
    );
  }

  return (
    <ToastProvider>
      <InstallGuideModal />
      <div className="mx-auto flex min-h-full w-full max-w-lg flex-col">
        <header className="bg-navy px-4 py-5 text-paper sm:px-6">
          <h1 className="font-serif text-2xl font-bold tracking-tight">
            달란트플렉스
          </h1>
          <p className="mt-1 text-sm text-paper/70">2026. 10. 4 기대하세요!</p>
        </header>

        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1 pb-6">
          {activeTab === "pay" && (
            <PayTab
              members={members}
              transactions={transactions}
              onAddTransaction={handleAddTransaction}
            />
          )}
          {activeTab === "members" && (
            <MembersTab
              members={members}
              transactions={transactions}
              onAddMembers={handleAddMembers}
            />
          )}
          {activeTab === "transactions" && (
            <TransactionsTab members={members} transactions={transactions} />
          )}
        </main>
      </div>
    </ToastProvider>
  );
}
