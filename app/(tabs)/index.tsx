import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';

export default function HomeScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [transactions] = useState({
    '2025-01-05': { 
      income: 0, 
      expense: 25,
      items: [
        { type: 'expense', amount: 25, note: 'Coffee & snacks', category: 'Food' }
      ]
    },
    '2025-01-08': { 
      income: 500, 
      expense: 0,
      items: [
        { type: 'income', amount: 500, note: 'Freelance payment', category: 'Work' }
      ]
    },
    '2025-01-12': { 
      income: 0, 
      expense: 85,
      items: [
        { type: 'expense', amount: 50, note: 'Groceries', category: 'Food' },
        { type: 'expense', amount: 35, note: 'Uber ride', category: 'Transport' }
      ]
    },
    '2025-01-15': { 
      income: 0, 
      expense: 42,
      items: [
        { type: 'expense', amount: 42, note: 'Lunch with friends', category: 'Food' }
      ]
    },
    '2025-01-18': { 
      income: 1000, 
      expense: 150,
      items: [
        { type: 'income', amount: 1000, note: 'Allowance', category: 'Allowance' },
        { type: 'expense', amount: 150, note: 'New shoes', category: 'Shopping' }
      ]
    },
    '2025-01-20': { 
      income: 0, 
      expense: 30,
      items: [
        { type: 'expense', amount: 30, note: 'Netflix subscription', category: 'Subscription' }
      ]
    },
    '2025-01-22': { 
      income: 0, 
      expense: 200,
      items: [
        { type: 'expense', amount: 200, note: 'Phone bill', category: 'Bills' }
      ]
    },
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const getDateKey = (day) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  const getDayTransaction = (day) => {
    if (!day) return null;
    const dateKey = getDateKey(day);
    return transactions[dateKey] || null;
  };

  const getMonthlyTotals = () => {
    let income = 0;
    let expense = 0;
    
    Object.keys(transactions).forEach(dateKey => {
      const [year, month] = dateKey.split('-').map(Number);
      if (year === currentDate.getFullYear() && month === currentDate.getMonth() + 1) {
        income += transactions[dateKey].income;
        expense += transactions[dateKey].expense;
      }
    });
    
    return { income, expense, total: income - expense };
  };

  const handleDayPress = (day) => {
    if (day) {
      setSelectedDay(day);
      setIsModalVisible(true);
    }
  };

  const getSelectedDateFormatted = () => {
    if (!selectedDay) return '';
    const dayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay).getDay();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return `${dayNames[dayOfWeek]}, ${monthNames[currentDate.getMonth()]} ${selectedDay}`;
  };

  const days = getDaysInMonth();
  const totals = getMonthlyTotals();
  const selectedTransaction = selectedDay ? getDayTransaction(selectedDay) : null;

  return (
    <View style={styles.container}>
      
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={goToPreviousMonth}>
            <Text style={styles.arrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {monthNames[currentDate.getMonth()]}
          </Text>
          <TouchableOpacity onPress={goToNextMonth}>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.topBarRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Text style={styles.iconText}>☰</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Text style={styles.iconText}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Text style={styles.iconText}>⏱</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Income/Expense Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryLeft}>
          <Text style={styles.summaryText}>
            <Text style={styles.summaryLabel}>Income </Text>
            <Text style={styles.incomeAmount}>+${totals.income}</Text>
          </Text>
          <Text style={styles.summaryText}>
            <Text style={styles.summaryLabel}>Expense </Text>
            <Text style={styles.expenseAmount}>-${totals.expense}</Text>
          </Text>
        </View>
        <View style={styles.summaryRight}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={[styles.totalAmount, totals.total >= 0 ? styles.positive : styles.negative]}>
            ${totals.total}
          </Text>
        </View>
      </View>

      {/* Weekday Headers */}
      <View style={styles.weekDaysRow}>
        {weekDays.map((day) => (
          <Text key={day} style={styles.weekDayText}>{day}</Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {days.map((day, index) => {
          const transaction = getDayTransaction(day);
          
          return (
            <TouchableOpacity 
              key={index} 
              style={styles.dayCell}
              onPress={() => handleDayPress(day)}
            >
              {day && (
                <View style={[styles.dayContent, isToday(day) && styles.todayCircle]}>
                  <Text style={[styles.dayText, isToday(day) && styles.todayText]}>
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

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabText}>✎</Text>
      </TouchableOpacity>

      {/* Day Detail Modal */}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setIsModalVisible(false)}
        onSwipeComplete={() => setIsModalVisible(false)}
        swipeDirection={['down']}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          {/* Modal Handle */}
          <View style={styles.modalHandle} />
          
          {/* Date Header */}
          <Text style={styles.modalDate}>{getSelectedDateFormatted()}</Text>
          
          {/* Transactions List */}
          {selectedTransaction && selectedTransaction.items ? (
            <ScrollView style={styles.transactionsList}>
              {selectedTransaction.items.map((item, index) => (
                <View key={index} style={styles.transactionItem}>
                  <View style={styles.transactionLeft}>
                    <Text style={styles.transactionCategory}>{item.category}</Text>
                    <Text style={styles.transactionNote}>{item.note}</Text>
                  </View>
                  <Text style={[
                    styles.transactionAmount,
                    item.type === 'income' ? styles.incomeAmount : styles.expenseAmount
                  ]}>
                    {item.type === 'income' ? '+' : '-'}${item.amount}
                  </Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No transactions</Text>
            </View>
          )}
          
          {/* Add Button */}
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Add Transaction</Text>
          </TouchableOpacity>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 24,
    paddingHorizontal: 8,
    color: '#333',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
  },
  topBarRight: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
  iconText: {
    fontSize: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  summaryLeft: {
    gap: 2,
  },
  summaryRight: {
    alignItems: 'flex-end',
  },
  summaryText: {
    fontSize: 13,
  },
  summaryLabel: {
    color: '#666',
  },
  incomeAmount: {
    color: '#4CAF50',
  },
  expenseAmount: {
    color: '#F44336',
  },
  totalLabel: {
    fontSize: 12,
    color: '#666',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  positive: {
    color: '#4CAF50',
  },
  negative: {
    color: '#F44336',
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  weekDayText: {
    width: 44,
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  dayCell: {
    width: '14.28%',
    height: 64,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 4,
  },
  dayContent: {
    alignItems: 'center',
    padding: 4,
    borderRadius: 8,
    minWidth: 40,
  },
  dayText: {
    fontSize: 15,
    color: '#333',
  },
  todayCircle: {
    backgroundColor: '#e8e8e8',
  },
  todayText: {
    fontWeight: '600',
  },
  amountContainer: {
    marginTop: 2,
    alignItems: 'center',
  },
  dayIncome: {
    fontSize: 8,
    color: '#4CAF50',
    fontWeight: '500',
  },
  dayExpense: {
    fontSize: 8,
    color: '#F44336',
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    fontSize: 24,
    color: '#fff',
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalDate: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  transactionsList: {
    maxHeight: 200,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  transactionLeft: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  transactionNote: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
  },
  addButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});