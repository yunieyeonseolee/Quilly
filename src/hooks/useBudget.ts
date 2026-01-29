import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Budget } from '../types/budget';

const BUDGET_KEY = 'quilly_budget';

const defaultBudget: Budget = {
  weeklyAmount: 0,
  monthlyAmount: 0,
  showWeeklyOnMain: true,
  showMonthlyOnMain: false,
  monthlyCycleAnchorDay: 1,
};

export const useBudget = () => {
  const [budget, setBudget] = useState<Budget>(defaultBudget);
  const [isLoading, setIsLoading] = useState(true);

  // Load budget on startup
  useEffect(() => {
    const loadBudget = async () => {
      try {
        const data = await AsyncStorage.getItem(BUDGET_KEY);
        if (data) {
          setBudget({ ...defaultBudget, ...JSON.parse(data) });
        }
      } catch (error) {
        console.error('Error loading budget:', error);
      }
      setIsLoading(false);
    };
    loadBudget();
  }, []);

  // Save budget when it changes
  useEffect(() => {
    if (!isLoading) {
      const saveBudget = async () => {
        try {
          await AsyncStorage.setItem(BUDGET_KEY, JSON.stringify(budget));
        } catch (error) {
          console.error('Error saving budget:', error);
        }
      };
      saveBudget();
    }
  }, [budget, isLoading]);

  const updateBudget = (newBudget: Partial<Budget>) => {
    setBudget((prev) => ({ ...prev, ...newBudget }));
  };

  const resetBudget = () => {
    setBudget(defaultBudget);
  };

  return {
    budget,
    isLoading,
    updateBudget,
    resetBudget,
  };
};
