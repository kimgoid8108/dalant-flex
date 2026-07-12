export type Member = {
  id: string;
  name: string;
  createdAt: number;
};

export type Transaction = {
  id: string;
  memberId: string;
  category: string;
  amount: number;
  timestamp: number;
};

export type Category = {
  id: string;
  name: string;
  amount: number;
  note: string;
  managers?: string;
  eventOnly?: boolean;
};

export type TabId = "pay" | "members" | "transactions" | "reminder";

export type BibleReminderSettings = {
  enabled: boolean;
  dayOfWeek: number; // 0 = 일요일 ~ 6 = 토요일
  hour: number; // 0~23
  minute: number; // 0~59
  message: string;
  lastSentDate?: string; // YYYY-MM-DD, 중복 발송 방지용
};
