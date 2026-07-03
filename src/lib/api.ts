import type { Member, Transaction } from "@/types";

/**
 * TODO: 서버 API 연동 시 아래 함수들을 fetch 호출로 교체
 */

export async function fetchMembers(): Promise<Member[]> {
  // TODO: GET /api/members
  throw new Error("Not implemented — use local state for now");
}

export async function fetchTransactions(): Promise<Transaction[]> {
  // TODO: GET /api/transactions
  throw new Error("Not implemented — use local state for now");
}

export async function addMembersApi(names: string[]): Promise<Member[]> {
  // TODO: POST /api/members { names: string[] }
  void names;
  throw new Error("Not implemented — use local state for now");
}

export async function addTransactionApi(
  transaction: Omit<Transaction, "id">,
): Promise<Transaction> {
  // TODO: POST /api/transactions
  void transaction;
  throw new Error("Not implemented — use local state for now");
}
