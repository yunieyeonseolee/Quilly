import AsyncStorage from '@react-native-async-storage/async-storage';

const TRANSACTIONS_KEY = 'quilly_transactions';

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

export const clearTransactions = async () => {
  try {
    await AsyncStorage.removeItem(TRANSACTIONS_KEY);
  } catch (error) {
    console.error('Error clearing transactions:', error);
  }
};