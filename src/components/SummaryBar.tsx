import { Text, View } from 'react-native';
import { homeStyles as styles } from '../styles/homeStyles';

type SummaryBarProps = {
  income: number;
  expense: number;
  total: number;
};

export const SummaryBar = ({ income, expense, total }: SummaryBarProps) => {
  return (
    <View style={styles.summaryRow}>
      <View style={styles.summaryLeft}>
        <Text style={styles.summaryText}>
          <Text style={styles.summaryLabel}>Income </Text>
          <Text style={styles.incomeAmount}>+${income}</Text>
        </Text>
        <Text style={styles.summaryText}>
          <Text style={styles.summaryLabel}>Expense </Text>
          <Text style={styles.expenseAmount}>-${expense}</Text>
        </Text>
      </View>
      <View style={styles.summaryRight}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={[styles.totalAmount, total >= 0 ? styles.positive : styles.negative]}>
          ${total}
        </Text>
      </View>
    </View>
  );
};