import { useState } from 'react';
import { View } from 'react-native';
import { Text } from '../../src/components/Text';

import { AddTransactionModal } from '../../src/components/AddTransactionModal';
import { BudgetBar } from '../../src/components/BudgetBar';
import { CalendarView } from '../../src/components/CalendarView';
import { DayDetailModal } from '../../src/components/DayDetailModal';
import { FloatingButton } from '../../src/components/FloatingButton';
import { ListView } from '../../src/components/ListView';
import MonthYearModal from '../../src/components/MonthYearModal';
import { SetBudgetModal } from '../../src/components/SetBudgetModal';
import { SummaryBar } from '../../src/components/SummaryBar';
import { TopBar } from '../../src/components/TopBar';

import { useBudget } from '../../src/hooks/useBudget';
import { useTransactions } from '../../src/hooks/useTransactions';

import { homeStyles as styles } from '../../src/styles/homeStyles';
import { formatSelectedDate, getDateKey } from '../../src/utils/dateUtils';

export default function HomeScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isBudgetModalVisible, setIsBudgetModalVisible] = useState(false);
  const [pendingAdd, setPendingAdd] = useState(false);
  const [isAddModalFromFloating, setIsAddModalFromFloating] = useState(false);

  const [isMYOpen, setIsMYOpen] = useState(false);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const { budget, updateBudget, resetBudget } = useBudget();

  const [newTransaction, setNewTransaction] = useState({
    type: 'expense' as 'expense' | 'income',
    amount: '',
    note: '',
    category: 'Food',
  });

  const {
  isLoading,
  getDayTransaction,
  getMonthlyTotals,
  getMonthTransactions,
  addTransaction,
  addTransactionWithDate,
  getWeeklySpent,
  getMonthlySpent,
  deleteTransaction,
} = useTransactions();


  const weeklySpent = getWeeklySpent();
  const monthlySpent = getMonthlySpent();

  // ---- Month change (buttons) ----
  const goToPreviousMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // ---- Day modal logic ----
  const handleDayPress = (day: number | null) => {
    if (day) {
      setPendingAdd(false);
      setSelectedDay(day);
      setIsModalVisible(true);
    }
  };

  const closeDayModal = () => {
    setPendingAdd(false);
    setIsModalVisible(false);
  };

 const openAddModal = () => {
  setIsAddModalFromFloating(false);
  setPendingAdd(true);
  setIsModalVisible(false);
};
  const closeAddModal = () => {
    setIsAddModalVisible(false);
  };

const handleAddTransaction = (date?: Date) => {
  if (!newTransaction.amount) return;

  const amount = parseFloat(newTransaction.amount);
  if (Number.isNaN(amount)) return;

  if (isAddModalFromFloating && date) {
    // From floating button - use the date picker date
    addTransactionWithDate(date, newTransaction.type, amount, newTransaction.note, newTransaction.category);
  } else if (selectedDay) {
    // From calendar - use selected day
    addTransaction(currentDate, selectedDay, newTransaction.type, amount, newTransaction.note, newTransaction.category);
  }

  setNewTransaction({ type: 'expense', amount: '', note: '', category: '' });
  setIsAddModalVisible(false);
  setIsAddModalFromFloating(false);
};
  const handleModalHide = () => {
    if (pendingAdd) {
      setIsAddModalVisible(true);
      setPendingAdd(false);
    }
  };

  const totals = getMonthlyTotals(currentDate);
  const monthTransactions = getMonthTransactions(currentDate);
  const selectedTransaction = selectedDay ? getDayTransaction(currentDate, selectedDay) : null;
  const dateFormatted = selectedDay ? formatSelectedDate(currentDate, selectedDay) : '';

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar
        currentDate={currentDate}
        viewMode={viewMode}
        onPreviousMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
        onToggleView={() => setViewMode(viewMode === 'calendar' ? 'list' : 'calendar')}
        onMonthYearPress={() => setIsMYOpen(true)}
      />

      <SummaryBar income={totals.income} expense={totals.expense} total={totals.total} />

      <BudgetBar
        budget={budget}
        weeklySpent={weeklySpent}
        monthlySpent={monthlySpent}
        onPress={() => setIsBudgetModalVisible(true)}
      />

      {viewMode === 'calendar' ? (
        <View style={{ flex: 1 }}>
          <CalendarView
            currentDate={currentDate}
            getDayTransaction={(day) => getDayTransaction(currentDate, day)}
            onDayPress={handleDayPress}
          />
        </View>
      ) : (
        <ListView
          currentDate={currentDate}
          monthTransactions={monthTransactions}
          onDatePress={handleDayPress}
        />
      )}

      <FloatingButton
  onPaymentReminder={() => console.log('Payment Reminder')}
  onSetBudget={() => setIsBudgetModalVisible(true)}
  onNewTransaction={() => {
    setIsAddModalFromFloating(true);
    setIsAddModalVisible(true);
  }}
/>
      <DayDetailModal
  isVisible={isModalVisible}
  dateFormatted={dateFormatted}
  dateKey={selectedDay ? getDateKey(currentDate, selectedDay) : ''}
  transaction={selectedTransaction}
  onClose={closeDayModal}
  onAddPress={openAddModal}
  onModalHide={handleModalHide}
  onDeleteTransaction={deleteTransaction}
/>

      <AddTransactionModal
        isVisible={isAddModalVisible}
        newTransaction={newTransaction}
        onClose={closeAddModal}
        onSave={handleAddTransaction}
        onChangeTransaction={setNewTransaction}
        showDatePicker={isAddModalFromFloating}
        initialDate={new Date()}
      />

      <SetBudgetModal
        isVisible={isBudgetModalVisible}
        budget={budget}
        onClose={() => setIsBudgetModalVisible(false)}
        onSave={(newBudget) => updateBudget(newBudget)}
        onReset={resetBudget}
      />

      <MonthYearModal
        isVisible={isMYOpen}
        initialYear={currentYear}
        initialMonth={currentMonth}
        onClose={() => setIsMYOpen(false)}
        onConfirm={(y, m) => {
          const day = Math.min(currentDate.getDate(), 28);
          setCurrentDate(new Date(y, m - 1, day));
          setIsMYOpen(false);
        }}
      />
    </View>
  );
}
