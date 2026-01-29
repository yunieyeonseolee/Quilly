export type TxItem = {
  type: 'income' | 'expense';
  amount: number;
  note: string;
  category: string;
  recurringId?: string;
};

export type TxDay = {
  income: number;
  expense: number;
  items: TxItem[];
};

export type Transactions = Record<string, TxDay>;

export type RepeatPattern = 'daily' | 'weekday' | 'weekly' | 'monthly';

export type RecurringTransaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  note: string;
  category: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string | null; // YYYY-MM-DD or null for no end
  pattern: RepeatPattern;
};

export type SearchResult = {
  dateKey: string;
  item: TxItem;
  isRecurring: boolean;
};
