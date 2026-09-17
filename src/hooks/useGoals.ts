import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Goal } from '../types/goal';

const GOALS_KEY = 'quilly_goals';

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load goals on startup
  useEffect(() => {
    const loadGoals = async () => {
      try {
        const data = await AsyncStorage.getItem(GOALS_KEY);
        if (data) {
          setGoals(JSON.parse(data));
        }
      } catch (error) {
        console.error('Error loading goals:', error);
      }
      setIsLoading(false);
    };
    loadGoals();
  }, []);

  // Save goals when they change
  useEffect(() => {
    if (!isLoading) {
      const saveGoals = async () => {
        try {
          await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(goals));
        } catch (error) {
          console.error('Error saving goals:', error);
        }
      };
      saveGoals();
    }
  }, [goals, isLoading]);

  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const addGoal = (goal: Omit<Goal, 'id' | 'createdAt' | 'status'>) => {
    const newGoal: Goal = {
      ...goal,
      id: generateId(),
      status: 'active',
      createdAt: new Date(),
    };
    setGoals((prev) => [...prev, newGoal]);
    return newGoal;
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
    );
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const addToGoal = (id: string, amount: number) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const newSaved = g.savedAmount + amount;
          const isFinished = newSaved >= g.targetAmount;
          return {
            ...g,
            savedAmount: newSaved,
            status: isFinished ? 'finished' : 'active',
          };
        }
        return g;
      })
    );
  };

  const getActiveGoals = () => goals.filter((g) => g.status === 'active');
  const getFinishedGoals = () => goals.filter((g) => g.status === 'finished');

  const getProgress = (goal: Goal) => {
    if (goal.targetAmount === 0) return 0;
    return Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
  };

  return {
    goals,
    isLoading,
    addGoal,
    updateGoal,
    deleteGoal,
    addToGoal,
    getActiveGoals,
    getFinishedGoals,
    getProgress,
  };
};