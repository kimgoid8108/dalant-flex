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

export type TabId = "pay" | "members" | "transactions";
