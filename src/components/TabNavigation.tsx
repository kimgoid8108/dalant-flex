"use client";

import type { TabId } from "@/types";

const TABS: { id: TabId; label: string }[] = [
  { id: "pay", label: "지급하기" },
  { id: "members", label: "명단" },
  { id: "transactions", label: "거래내역" },
  { id: "reminder", label: "알림설정" },
];

type Props = {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
};

export function TabNavigation({ activeTab, onTabChange }: Props) {
  return (
    <nav className="flex border-b border-navy/10 bg-paper">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 py-3 text-sm font-medium transition-colors sm:text-base ${
            activeTab === tab.id
              ? "border-b-2 border-stamp text-navy"
              : "text-navy/50 hover:text-navy/80"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
