import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { PaymentReminder } from '../types/paymentReminder';

const PAYMENT_REMINDERS_KEY = 'quilly_payment_reminders';

export const usePaymentReminders = () => {
  const [reminders, setReminders] = useState<PaymentReminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load reminders on startup
  useEffect(() => {
    const loadReminders = async () => {
      try {
        const data = await AsyncStorage.getItem(PAYMENT_REMINDERS_KEY);
        if (data) {
          setReminders(JSON.parse(data));
        }
      } catch (error) {
        console.error('Error loading payment reminders:', error);
      }
      setIsLoading(false);
    };
    loadReminders();
  }, []);

  // Save reminders when they change
  useEffect(() => {
    if (!isLoading) {
      const saveReminders = async () => {
        try {
          await AsyncStorage.setItem(PAYMENT_REMINDERS_KEY, JSON.stringify(reminders));
        } catch (error) {
          console.error('Error saving payment reminders:', error);
        }
      };
      saveReminders();
    }
  }, [reminders, isLoading]);

  // Generate unique ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // Add reminder
  const addReminder = (reminder: Omit<PaymentReminder, 'id'>) => {
    const newReminder: PaymentReminder = {
      ...reminder,
      id: generateId(),
    };
    setReminders((prev) => [...prev, newReminder]);
    return newReminder;
  };

  const updateReminder = (
  id: string,
  updates: Partial<Omit<PaymentReminder, 'id'>>
) => {
  setReminders((prev) =>
    prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
  );
  // If you persist reminders (AsyncStorage etc), also call your save() here.
};

  // Delete reminder
  const deleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  // Toggle reminder enabled/disabled
  const toggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  // Get next due date for a reminder
  const getNextDueDate = (reminder: PaymentReminder): Date => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let dueDate: Date;

    if (reminder.frequency === 'monthly') {
      if (currentDay <= reminder.dueDay) {
        // Due this month
        dueDate = new Date(currentYear, currentMonth, reminder.dueDay);
      } else {
        // Due next month
        dueDate = new Date(currentYear, currentMonth + 1, reminder.dueDay);
      }
    } else if (reminder.frequency === 'yearly') {
      dueDate = new Date(currentYear, currentMonth, reminder.dueDay);
      if (dueDate < today) {
        dueDate = new Date(currentYear + 1, currentMonth, reminder.dueDay);
      }
    } else {
      // Weekly - find next occurrence of that day
      const daysUntil = (reminder.dueDay - today.getDay() + 7) % 7 || 7;
      dueDate = new Date(today);
      dueDate.setDate(today.getDate() + daysUntil);
    }

    return dueDate;
  };

  // Get days until due
  const getDaysUntilDue = (reminder: PaymentReminder): number => {
    const dueDate = getNextDueDate(reminder);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return {
  reminders,
  addReminder,
  deleteReminder,
  toggleReminder,
  getNextDueDate,
  getDaysUntilDue,
  updateReminder,
};
};
