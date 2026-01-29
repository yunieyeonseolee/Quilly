import AsyncStorage from '@react-native-async-storage/async-storage';

const TRANSACTIONS_KEY = 'quilly_transactions';
const RECURRING_KEY = 'quilly_recurring_transactions';
const RECURRING_SKIPS_KEY = 'quilly_recurring_skips';

export const saveTransactions = async (transactions: Record<string, any>) => {
  try {
    await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.error('Error saving transactions:', error);
  }
};

export const loadTransactions = async () => {
  try {
    const data = await AsyncStorage.getItem(TRANSACTIONS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error loading transactions:', error);
    return {};
  }
};

export const saveRecurringTransactions = async (recurring: Record<string, any>) => {
  try {
    await AsyncStorage.setItem(RECURRING_KEY, JSON.stringify(recurring));
  } catch (error) {
    console.error('Error saving recurring transactions:', error);
  }
};

export const loadRecurringTransactions = async () => {
  try {
    const data = await AsyncStorage.getItem(RECURRING_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading recurring transactions:', error);
    return [];
  }
};

export const saveRecurringSkips = async (skips: Record<string, any>) => {
  try {
    await AsyncStorage.setItem(RECURRING_SKIPS_KEY, JSON.stringify(skips));
  } catch (error) {
    console.error('Error saving recurring skips:', error);
  }
};

export const loadRecurringSkips = async () => {
  try {
    const data = await AsyncStorage.getItem(RECURRING_SKIPS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error loading recurring skips:', error);
    return {};
  }
};

export const clearTransactions = async () => {
  try {
    await AsyncStorage.removeItem(TRANSACTIONS_KEY);
  } catch (error) {
    console.error('Error clearing transactions:', error);
  }
};
