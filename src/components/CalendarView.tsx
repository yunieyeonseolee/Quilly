import { TouchableOpacity, View } from 'react-native';
import { Text } from './Text';
import { homeStyles as styles } from '../styles/homeStyles';
import { TxDay } from '../types/transaction';
import { getDaysInMonth, isToday, weekDays } from '../utils/dateUtils';

type CalendarViewProps = {
  currentDate: Date;
  getDayTransaction: (day: number | null) => TxDay | null;
  onDayPress: (day: number | null) => void;
};

export const CalendarView = ({
  currentDate,
  getDayTransaction,
  onDayPress,
}: CalendarViewProps) => {
  const days = getDaysInMonth(currentDate);

  return (
    <>
      <View style={styles.weekDaysRow}>
        {weekDays.map((day) => (
          <Text key={day} style={styles.weekDayText}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {days.map((day, index) => {
          const transaction = getDayTransaction(day);

          return (
            <TouchableOpacity
              key={index}
              style={styles.dayCell}
              onPress={() => onDayPress(day)}
            >
              {day && (
                <View style={[styles.dayContent, isToday(currentDate, day) && styles.todayCircle]}>
                  <Text style={[styles.dayText, isToday(currentDate, day) && styles.todayText]}>
                    {day}
                  </Text>
                  {transaction && (
                    <View style={styles.amountContainer}>
                      {transaction.income > 0 && (
                        <Text style={styles.dayIncome}>+{transaction.income}</Text>
                      )}
                      {transaction.expense > 0 && (
                        <Text style={styles.dayExpense}>-{transaction.expense}</Text>
                      )}
                    </View>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
};
