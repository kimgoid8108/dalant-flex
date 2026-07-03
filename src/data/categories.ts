import type { Category } from "@/types";

export const CATEGORIES: Category[] = [
  {
    id: "attendance",
    name: "출석",
    amount: 1,
    note: "임원체크 · 한달정산",
    managers: "은서",
  },
  {
    id: "bible",
    name: "성경책 지참",
    amount: 1,
    note: "실시간정산 · 보관금지",
    managers: "예린, 태훈",
  },
  {
    id: "early-worship",
    name: "예배 10분 전",
    amount: 3,
    note: "실시간 지급",
    managers: "예린, 태훈",
  },
  {
    id: "new-friend",
    name: "새친구 초청",
    amount: 10,
    note: "2회 이상 출석시",
    managers: "하은, 효경",
  },
  {
    id: "new-believer",
    name: "새신자",
    amount: 30,
    note: "실시간 지급",
    managers: "하은, 효경",
  },
  {
    id: "friday-vigil",
    name: "금요철야 참석",
    amount: 5,
    note: "카톡체크 · 주일지급",
    managers: "총무",
  },
  {
    id: "scripture-memorization",
    name: "말씀 암송",
    amount: 1,
    note: "1절당 · 달란트대회 당일만",
    eventOnly: true,
  },
];
