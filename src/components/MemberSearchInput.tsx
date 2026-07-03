"use client";

import { useEffect, useMemo, useState } from "react";
import type { Member } from "@/types";

type Props = {
  members: Member[];
  selectedMemberId: string;
  onSelect: (member: Member | null) => void;
  placeholder?: string;
  /** 제공하면 "전체 보기" 같은 초기화 버튼이 나타난다 (거래내역 필터용) */
  clearLabel?: string;
};

export function MemberSearchInput({
  members,
  selectedMemberId,
  onSelect,
  placeholder = "이름을 입력하세요...",
  clearLabel,
}: Props) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [noMatchMessage, setNoMatchMessage] = useState<string | null>(null);

  // 외부에서 selectedMemberId가 바뀌면(예: 초기화) 입력값도 동기화
  useEffect(() => {
    if (!selectedMemberId) {
      setInputValue("");
      return;
    }
    const m = members.find((mm) => mm.id === selectedMemberId);
    if (m) setInputValue(m.name);
  }, [selectedMemberId, members]);

  const suggestions = useMemo(() => {
    const q = inputValue.trim();
    if (!q) return [];
    return members
      .filter((m) => m.name.includes(q))
      .sort((a, b) => a.name.localeCompare(b.name, "ko"));
  }, [members, inputValue]);

  const selectMember = (member: Member) => {
    setInputValue(member.name);
    setShowSuggestions(false);
    setNoMatchMessage(null);
    onSelect(member);
  };

  const confirmSelection = () => {
    const q = inputValue.trim();
    if (!q) {
      if (clearLabel) onSelect(null);
      return;
    }
    if (suggestions.length === 0) {
      setNoMatchMessage("일치하는 이름이 없어요");
      setShowSuggestions(false);
      return;
    }
    selectMember(suggestions[0]);
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setNoMatchMessage(null);

    if (selectedMemberId) {
      const current = members.find((m) => m.id === selectedMemberId);
      if (current && value !== current.name) {
        onSelect(null);
      }
    }

    setShowSuggestions(value.trim().length > 0);
  };

  const handleClear = () => {
    setInputValue("");
    setShowSuggestions(false);
    setNoMatchMessage(null);
    onSelect(null);
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <input
          type="text"
          autoComplete="off"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (inputValue.trim()) setShowSuggestions(true);
          }}
          onBlur={() => {
            setTimeout(() => setShowSuggestions(false), 150);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              confirmSelection();
            }
          }}
          className="min-w-0 flex-1 rounded-lg border border-navy/15 bg-white/60 px-3 py-2.5 text-sm text-navy placeholder:text-navy/30 focus:border-navy/30 focus:outline-none focus:ring-1 focus:ring-navy/20"
        />
        <button
          type="button"
          onClick={confirmSelection}
          className="shrink-0 rounded-lg border border-navy/15 bg-white/60 px-4 py-2.5 text-sm font-medium text-navy transition-colors hover:bg-white/90"
        >
          완료
        </button>
        {clearLabel && (selectedMemberId || inputValue) && (
          <button
            type="button"
            onClick={handleClear}
            className="shrink-0 rounded-lg border border-navy/15 bg-white/60 px-4 py-2.5 text-sm font-medium text-navy/60 transition-colors hover:bg-white/90"
          >
            {clearLabel}
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-navy/10 bg-white shadow-md">
          {suggestions.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectMember(m)}
                className="w-full px-3 py-2.5 text-left text-sm text-navy hover:bg-navy/5"
              >
                {m.name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {noMatchMessage && (
        <p className="mt-2 text-xs text-stamp/80">{noMatchMessage}</p>
      )}
    </div>
  );
}
