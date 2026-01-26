export type TxItem = {
  type: 'income' | 'expense';
  amount: number;
  note: string;
  category: string;
};

export type TxDay = {
  income: number;
  expense: number;
  items: TxItem[];
};

export type Transactions = Record<string, TxDay>;