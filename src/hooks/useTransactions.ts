import { useEffect, useState } from 'react';
import { RecurringTransaction, SearchResult, Transactions, TxDay, TxItem } from '../types/transaction';
import { getDateKey } from '../utils/dateUtils';
import {
  loadRecurringSkips,
  loadRecurringTransactions,
  loadTransactions,
  saveRecurringSkips,
  saveRecurringTransactions,
  saveTransactions,
} from '../utils/storage';
import { useSettings } from './useSettings';

export const useTransactions = () => {
  const { settings } = useSettings();
  const [transactions, setTransactions] = useState<Transactions>({});
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [recurringSkips, setRecurringSkips] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const savedTransactions = await loadTransactions();
      const savedRecurring = await loadRecurringTransactions();
      const savedSkips = await loadRecurringSkips();
      setTransactions(savedTransactions);
      setRecurring(savedRecurring);
      setRecurringSkips(savedSkips);
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

  useEffect(() => {
    if (!isLoading) {
      saveRecurringTransactions(recurring);
    }
  }, [recurring, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      saveRecurringSkips(recurringSkips);
    }
  }, [recurringSkips, isLoading]);

  const dateKeyFromDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseDateKey = (dateKey: string) => {
    const [year, month, day] = dateKey.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const isDateWithin = (dateKey: string, startKey: string, endKey?: string | null) => {
    const date = parseDateKey(dateKey);
    const start = parseDateKey(startKey);
    if (date < start) return false;
    if (!endKey) return true;
    const end = parseDateKey(endKey);
    return date <= end;
  };

  const getEffectiveTodayKey = () => {
    const now = new Date();
    const cutoffMinutes = settings.recurringApplyTimeMinutes ?? 22 * 60;
    const minutesNow = now.getHours() * 60 + now.getMinutes();
    const effective = new Date(now);
    if (minutesNow < cutoffMinutes) {
      // before cutoff, treat "today" as not yet applied
      effective.setDate(now.getDate() - 1);
    }
    return dateKeyFromDate(effective);
  };

  const isSkipped = (recurringId: string, dateKey: string) => {
    const skips = recurringSkips[recurringId] || [];
    return skips.includes(dateKey);
  };

  const occursOnDate = (rule: RecurringTransaction, dateKey: string) => {
    if (!isDateWithin(dateKey, rule.startDate, rule.endDate)) return false;
    if (isSkipped(rule.id, dateKey)) return false;

    const date = parseDateKey(dateKey);
    const dayOfWeek = date.getDay();
    const dayOfMonth = date.getDate();

    switch (rule.pattern) {
      case 'daily':
        return true;
      case 'weekday':
        return dayOfWeek >= 1 && dayOfWeek <= 5;
      case 'weekly': {
        const startDay = parseDateKey(rule.startDate).getDay();
        return dayOfWeek === startDay;
      }
      case 'monthly': {
        const startDay = parseDateKey(rule.startDate).getDate();
        return dayOfMonth === startDay;
      }
      default:
        return false;
    }
  };

  const getRecurringItemsForDate = (dateKey: string): TxItem[] => {
    const effectiveTodayKey = getEffectiveTodayKey();
    if (dateKey > effectiveTodayKey) return [];

    return recurring
      .filter((rule) => occursOnDate(rule, dateKey))
      .map((rule) => ({
        type: rule.type,
        amount: rule.amount,
        note: rule.note || 'No note',
        category: rule.category,
        recurringId: rule.id,
      }));
  };

  const searchTransactions = (query: string): SearchResult[] => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    const results: SearchResult[] = [];

    Object.keys(transactions).forEach((dateKey) => {
      const items = transactions[dateKey]?.items || [];
      items.forEach((item) => {
        const haystack = `${item.category} ${item.note} ${item.amount}`.toLowerCase();
        if (haystack.includes(trimmed)) {
          results.push({ dateKey, item, isRecurring: false });
        }
      });
    });

    const effectiveTodayKey = getEffectiveTodayKey();
    recurring.forEach((rule) => {
      let cursor = parseDateKey(rule.startDate);
      const endKey = rule.endDate && rule.endDate < effectiveTodayKey ? rule.endDate : effectiveTodayKey;
      const endDate = parseDateKey(endKey);

      while (cursor <= endDate) {
        const dateKey = dateKeyFromDate(cursor);
        if (occursOnDate(rule, dateKey)) {
          const item: TxItem = {
            type: rule.type,
            amount: rule.amount,
            note: rule.note || 'No note',
            category: rule.category,
            recurringId: rule.id,
          };
          const haystack = `${item.category} ${item.note} ${item.amount}`.toLowerCase();
          if (haystack.includes(trimmed)) {
            results.push({ dateKey, item, isRecurring: true });
          }
        }
        cursor.setDate(cursor.getDate() + 1);
      }
    });

    return results.sort((a, b) => (a.dateKey < b.dateKey ? 1 : -1));
  };

  const getDayTransaction = (currentDate: Date, day: number | null): TxDay | null => {
    if (!day) return null;
    const dateKey = getDateKey(currentDate, day);
    const base = transactions[dateKey];
    const recurringItems = getRecurringItemsForDate(dateKey);

    if (!base && recurringItems.length === 0) return null;

    const baseItems = base?.items || [];
    const items = [...baseItems, ...recurringItems];

    const recurringIncome = recurringItems
      .filter((item) => item.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0);
    const recurringExpense = recurringItems
      .filter((item) => item.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      income: (base?.income || 0) + recurringIncome,
      expense: (base?.expense || 0) + recurringExpense,
      items,
    };
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

    const year = currentDate.getFullYear();
    const monthIndex = currentDate.getMonth();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = getDateKey(currentDate, day);
      const recurringItems = getRecurringItemsForDate(dateKey);
      recurringItems.forEach((item) => {
        if (item.type === 'income') income += item.amount;
        else expense += item.amount;
      });
    }

    return { income, expense, total: income - expense };
  };

  const getMonthTransactions = (currentDate: Date) => {
    const year = currentDate.getFullYear();
    const monthIndex = currentDate.getMonth();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const entries: { dateKey: string; day: number; items: TxItem[] }[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = getDateKey(currentDate, day);
      const baseItems = transactions[dateKey]?.items || [];
      const recurringItems = getRecurringItemsForDate(dateKey);
      const items = [...baseItems, ...recurringItems];
      if (items.length > 0) {
        entries.push({ dateKey, day, items });
      }
    }

    return entries;
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

    const cursor = new Date(startDate);
    while (cursor <= now) {
      const dateKey = dateKeyFromDate(cursor);
      const recurringItems = getRecurringItemsForDate(dateKey);
      recurringItems.forEach((item) => {
        if (item.type === 'expense') totalExpense += item.amount;
      });
      cursor.setDate(cursor.getDate() + 1);
    }

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

  const addRecurringTransaction = (
    startDate: Date,
    type: 'income' | 'expense',
    amount: number,
    note: string,
    category: string,
    pattern: RecurringTransaction['pattern'],
    endDate?: Date | null
  ) => {
    const id = `recurring_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    setRecurring((prev) => [
      ...prev,
      {
        id,
        type,
        amount,
        note: note || 'No note',
        category,
        startDate: dateKeyFromDate(startDate),
        endDate: endDate ? dateKeyFromDate(endDate) : null,
        pattern,
      },
    ]);
  };

  const deleteRecurringTransaction = (recurringId: string) => {
    setRecurring((prev) => prev.filter((rule) => rule.id !== recurringId));
    setRecurringSkips((prev) => {
      if (!prev[recurringId]) return prev;
      const { [recurringId]: _, ...rest } = prev;
      return rest;
    });
  };

  const skipRecurringOccurrence = (recurringId: string, dateKey: string) => {
    setRecurringSkips((prev) => {
      const existing = prev[recurringId] || [];
      if (existing.includes(dateKey)) return prev;
      return { ...prev, [recurringId]: [...existing, dateKey] };
    });
  };

  const sumExpensesInRange = (startDate: Date, endDate: Date) => {
    let totalExpense = 0;

    Object.keys(transactions).forEach((dateKey) => {
      const [year, month, dayNum] = dateKey.split('-').map(Number);
      const txDate = new Date(year, month - 1, dayNum);

      if (txDate >= startDate && txDate <= endDate) {
        totalExpense += transactions[dateKey].expense;
      }
    });

    const cursor = new Date(startDate);
    while (cursor <= endDate) {
      const dateKey = dateKeyFromDate(cursor);
      const recurringItems = getRecurringItemsForDate(dateKey);
      recurringItems.forEach((item) => {
        if (item.type === 'expense') totalExpense += item.amount;
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    return totalExpense;
  };

  const getWeeklySpent = () => {
    const now = new Date();
    const day = now.getDay();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - day);
    startDate.setHours(0, 0, 0, 0);

    return sumExpensesInRange(startDate, now);
  };

  const getMonthlySpent = (anchorDay = 1) => {
    const now = new Date();
    const safeAnchor = Math.min(Math.max(anchorDay, 1), 28);
    const year = now.getFullYear();
    const month = now.getMonth();

    let startDate: Date;
    let endDate: Date;

    if (now.getDate() >= safeAnchor) {
      startDate = new Date(year, month, safeAnchor);
      endDate = new Date(year, month + 1, safeAnchor);
      endDate.setDate(endDate.getDate() - 1);
    } else {
      startDate = new Date(year, month - 1, safeAnchor);
      endDate = new Date(year, month, safeAnchor);
      endDate.setDate(endDate.getDate() - 1);
    }

    return sumExpensesInRange(startDate, now < endDate ? now : endDate);
  };

  const deleteTransaction = (
    dateKey: string,
    itemIndex: number,
    targetItem?: TxItem
  ) => {
    setTransactions((prev) => {
      if (targetItem?.recurringId) {
        skipRecurringOccurrence(targetItem.recurringId, dateKey);
        return prev;
      }
      const dayData = prev[dateKey];
      if (!dayData) return prev;

      const existingItem = dayData.items[itemIndex];
      if (!existingItem) return prev;

      const newItems = dayData.items.filter((_, i) => i !== itemIndex);

      if (newItems.length === 0) {
        const { [dateKey]: _, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [dateKey]: {
          income: dayData.income - (existingItem.type === 'income' ? existingItem.amount : 0),
          expense: dayData.expense - (existingItem.type === 'expense' ? existingItem.amount : 0),
          items: newItems,
        },
      };
    });
  };

  const editTransaction = (
    dateKey: string,
    itemIndex: number,
    updates: { type: 'income' | 'expense'; amount: number; note: string; category: string },
    originalItem?: TxItem
  ) => {
    setTransactions((prev) => {
      if (originalItem?.recurringId) {
        skipRecurringOccurrence(originalItem.recurringId, dateKey);
        const existing = prev[dateKey] || { income: 0, expense: 0, items: [] };
        return {
          ...prev,
          [dateKey]: {
            income: existing.income + (updates.type === 'income' ? updates.amount : 0),
            expense: existing.expense + (updates.type === 'expense' ? updates.amount : 0),
            items: [
              ...existing.items,
              {
                type: updates.type,
                amount: updates.amount,
                note: updates.note || 'No note',
                category: updates.category,
              },
            ],
          },
        };
      }

      const dayData = prev[dateKey];
      if (!dayData || !Array.isArray(dayData.items)) return prev;

      const existingItem = dayData.items[itemIndex];
      if (!existingItem) return prev;

      const nextItem = { ...existingItem, ...updates };
      const nextItems = dayData.items.map((item, i) => (i === itemIndex ? nextItem : item));

      const nextIncome =
        dayData.income -
        (existingItem.type === 'income' ? existingItem.amount : 0) +
        (nextItem.type === 'income' ? nextItem.amount : 0);
      const nextExpense =
        dayData.expense -
        (existingItem.type === 'expense' ? existingItem.amount : 0) +
        (nextItem.type === 'expense' ? nextItem.amount : 0);

      return {
        ...prev,
        [dateKey]: {
          income: nextIncome,
          expense: nextExpense,
          items: nextItems,
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
    addRecurringTransaction,
    getWeeklySpent,
    getMonthlySpent,
    deleteTransaction,
    editTransaction,
    recurring,
    deleteRecurringTransaction,
    searchTransactions,
  };
};
