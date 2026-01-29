import { useEffect, useState } from 'react';
import { Transactions, TxDay } from '../types/transaction';
import { getDateKey } from '../utils/dateUtils';
import { loadTransactions, saveTransactions } from '../utils/storage';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transactions>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const savedTransactions = await loadTransactions();
      setTransactions(savedTransactions);
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Save transactions when they change
  useEffect(() => {
    if (!isLoading) {
      saveTransactions(transactions);
    }
  }, [transactions, isLoading]);

  const getDayTransaction = (currentDate: Date, day: number | null): TxDay | null => {
    if (!day) return null;
    return transactions[getDateKey(currentDate, day)] || null;
  };

  const getMonthlyTotals = (currentDate: Date) => {
    let income = 0;
    let expense = 0;

    Object.keys(transactions).forEach((dateKey) => {
      const [year, month] = dateKey.split('-').map(Number);
      if (year === currentDate.getFullYear() && month === currentDate.getMonth() + 1) {
        income += transactions[dateKey].income;
        expense += transactions[dateKey].expense;
      }
    });

    return { income, expense, total: income - expense };
  };

  const getMonthTransactions = (currentDate: Date) => {
    return Object.keys(transactions)
      .filter((dateKey) => {
        const [year, month] = dateKey.split('-').map(Number);
        return year === currentDate.getFullYear() && month === currentDate.getMonth() + 1;
      })
      .sort()
      .map((dateKey) => {
        const day = parseInt(dateKey.split('-')[2], 10);
        return {
          dateKey,
          day,
          items: transactions[dateKey].items,
        };
      });
  };

  const getSpentInPeriod = (period: 'weekly' | 'monthly') => {
    const now = new Date();
    let startDate: Date;

    if (period === 'weekly') {
      const day = now.getDay();
      startDate = new Date(now);
      startDate.setDate(now.getDate() - day);
      startDate.setHours(0, 0, 0, 0);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    let totalExpense = 0;

    Object.keys(transactions).forEach((dateKey) => {
      const [year, month, day] = dateKey.split('-').map(Number);
      const txDate = new Date(year, month - 1, day);

      if (txDate >= startDate && txDate <= now) {
        totalExpense += transactions[dateKey].expense;
      }
    });

    return totalExpense;
  };

  const addTransaction = (
    currentDate: Date,
    day: number,
    type: 'income' | 'expense',
    amount: number,
    note: string,
    category: string
  ) => {
    const dateKey = getDateKey(currentDate, day);

    setTransactions((prev) => {
      const existing = prev[dateKey] || { income: 0, expense: 0, items: [] };

      return {
        ...prev,
        [dateKey]: {
          income: existing.income + (type === 'income' ? amount : 0),
          expense: existing.expense + (type === 'expense' ? amount : 0),
          items: [
            ...existing.items,
            {
              type,
              amount,
              note: note || 'No note',
              category,
            },
          ],
        },
      };
    });
  };

  // Add transaction from floating button (uses full Date object)
  const addTransactionWithDate = (
    date: Date,
    type: 'income' | 'expense',
    amount: number,
    note: string,
    category: string
  ) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;

    setTransactions((prev) => {
      const existing = prev[dateKey] || { income: 0, expense: 0, items: [] };

      return {
        ...prev,
        [dateKey]: {
          income: existing.income + (type === 'income' ? amount : 0),
          expense: existing.expense + (type === 'expense' ? amount : 0),
          items: [
            ...existing.items,
            {
              type,
              amount,
              note: note || 'No note',
              category,
            },
          ],
        },
      };
    });
  };

  const getWeeklySpent = () => {
    const now = new Date();
    const day = now.getDay();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - day);
    startDate.setHours(0, 0, 0, 0);

    let totalExpense = 0;

    Object.keys(transactions).forEach((dateKey) => {
      const [year, month, dayNum] = dateKey.split('-').map(Number);
      const txDate = new Date(year, month - 1, dayNum);

      if (txDate >= startDate && txDate <= now) {
        totalExpense += transactions[dateKey].expense;
      }
    });

    return totalExpense;
  };

  const getMonthlySpent = () => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);

    let totalExpense = 0;

    Object.keys(transactions).forEach((dateKey) => {
      const [year, month, dayNum] = dateKey.split('-').map(Number);
      const txDate = new Date(year, month - 1, dayNum);

      if (txDate >= startDate && txDate <= now) {
        totalExpense += transactions[dateKey].expense;
      }
    });

    return totalExpense;
  };

  const deleteTransaction = (
  dateKey: string,
  itemIndex: number
) => {
  setTransactions((prev) => {
    const dayData = prev[dateKey];
    if (!dayData) return prev;

    const item = dayData.items[itemIndex];
    if (!item) return prev;

    const newItems = dayData.items.filter((_, i) => i !== itemIndex);

    if (newItems.length === 0) {
      const { [dateKey]: _, ...rest } = prev;
      return rest;
    }

    return {
      ...prev,
      [dateKey]: {
        income: dayData.income - (item.type === 'income' ? item.amount : 0),
        expense: dayData.expense - (item.type === 'expense' ? item.amount : 0),
        items: newItems,
      },
    };
  });
};

  return {
    transactions,
    isLoading,
    getDayTransaction,
    getMonthlyTotals,
    getMonthTransactions,
    getSpentInPeriod,
    addTransaction,
    addTransactionWithDate,
    getWeeklySpent,
    getMonthlySpent,
    deleteTransaction,
  };
};
