import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { colors } from '../styles/colors';
import { Budget } from '../types/budget';
import { useCurrency } from '../hooks/useCurrency';
import { Text } from './Text';

type BudgetBarProps = {
  budget: Budget;
  weeklySpent: number;
  monthlySpent: number;
  onPress: () => void;
};

const PAGE_HEIGHT = 80;

export const BudgetBar = ({
  budget,
  weeklySpent,
  monthlySpent,
  onPress,
}: BudgetBarProps) => {
  const { currencySymbol } = useCurrency();
  const showWeekly = budget.showWeeklyOnMain && budget.weeklyAmount > 0;
  const showMonthly = budget.showMonthlyOnMain && budget.monthlyAmount > 0;

  const renderBudgetItem = (label: string, spent: number, total: number) => {
    const percentage = Math.min((spent / total) * 100, 100);
    const remaining = total - spent;
    const isOverBudget = spent > total;

    return (
      <View style={styles.budgetItem}>
        <View style={styles.header}>
          <Text style={styles.label}>{label}</Text>
          <Text style={[styles.amount, isOverBudget && styles.overBudget]}>
            {currencySymbol}
            {spent.toLocaleString()} / {currencySymbol}
            {total.toLocaleString()}
          </Text>
        </View>

        <View style={styles.barBackground}>
          <View
            style={[
              styles.barFill,
              { width: `${percentage}%` },
              isOverBudget && styles.barOverBudget,
            ]}
          />
        </View>

        <Text style={[styles.remaining, isOverBudget && styles.overBudget]}>
          {isOverBudget
            ? `${currencySymbol}${Math.abs(remaining).toLocaleString()} over budget`
            : `${currencySymbol}${remaining.toLocaleString()} remaining`}
        </Text>
      </View>
    );
  };

  const pages: Array<{ key: 'weekly' | 'monthly'; node: React.ReactNode }> = [];
  if (showWeekly) {
    pages.push({
      key: 'weekly',
      node: renderBudgetItem('Weekly Budget', weeklySpent, budget.weeklyAmount),
    });
  }
  if (showMonthly) {
    pages.push({
      key: 'monthly',
      node: renderBudgetItem('Monthly Budget', monthlySpent, budget.monthlyAmount),
    });
  }

  // If nothing to show, display setup prompt
  if (pages.length === 0) {
    return (
      <Pressable style={[styles.container, styles.fixedHeight]} onPress={onPress}>
        <Text style={styles.setupText}>+ Set up a budget</Text>
      </Pressable>
    );
  }

  // If both shown: vertical paging (only ONE visible at a time)
  if (pages.length > 1) {
    return (
      <View style={[styles.container, styles.fixedHeight]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          snapToInterval={PAGE_HEIGHT}
          snapToAlignment="start"
          decelerationRate="fast"
          disableIntervalMomentum
          bounces={false}
          overScrollMode="never"
        >
          {pages.map((p) => (
            <Pressable key={p.key} onPress={onPress} style={styles.page}>
              {p.node}
            </Pressable>
          ))}
        </ScrollView>
      </View>
    );
  }

  // Only one shown: no scroll needed
  return (
    <Pressable style={[styles.container, styles.fixedHeight, styles.page]} onPress={onPress}>
      {pages[0].node}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 8,
    marginBottom: 5,
    overflow: 'hidden',
  },
  fixedHeight: {
    height: PAGE_HEIGHT,
  },
  page: {
    height: PAGE_HEIGHT,
    padding: 14,
    justifyContent: 'center',
  },
  setupText: {
    fontSize: 14,
    color: colors.gray600,
    textAlign: 'center',
  },

  budgetItem: {},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray700,
  },
  amount: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray800,
  },
  barBackground: {
    height: 8,
    backgroundColor: colors.gray300,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.income,
    borderRadius: 4,
  },
  barOverBudget: {
    backgroundColor: colors.expense,
  },
  remaining: {
    fontSize: 12,
    color: colors.gray600,
    marginTop: 6,
    textAlign: 'right',
  },
  overBudget: {
    color: colors.expense,
  },
});
