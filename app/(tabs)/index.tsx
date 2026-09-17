import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Text } from '../../src/components/Text';

import { AddTransactionModal } from '../../src/components/AddTransactionModal';
import { BudgetBar } from '../../src/components/BudgetBar';
import { CalendarView } from '../../src/components/CalendarView';
import { DayDetailModal } from '../../src/components/DayDetailModal';
import { FloatingButton } from '../../src/components/FloatingButton';
import { ListView } from '../../src/components/ListView';
import MonthYearModal from '../../src/components/MonthYearModal';
import { PaymentReminderModal } from '../../src/components/PaymentReminderModal';
import { RecurringManagerModal } from '../../src/components/RecurringManagerModal';
import { SearchModal } from '../../src/components/SearchModal';
import { SetBudgetModal } from '../../src/components/SetBudgetModal';
import { SummaryBar } from '../../src/components/SummaryBar';
import { TopBar } from '../../src/components/TopBar';

import { useBudget } from '../../src/hooks/useBudget';
import { useTransactions } from '../../src/hooks/useTransactions';

import { homeStyles as styles } from '../../src/styles/homeStyles';
import { formatSelectedDate, getDateKey } from '../../src/utils/dateUtils';

export default function HomeScreen() {
  const SEARCH_HISTORY_KEY = 'quilly_search_history';
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isBudgetModalVisible, setIsBudgetModalVisible] = useState(false);
  const [isRecurringModalVisible, setIsRecurringModalVisible] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPaymentReminderVisible, setIsPaymentReminderVisible] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [pendingModal, setPendingModal] = useState<null | 'add' | 'edit'>(null);
  const [isAddModalFromFloating, setIsAddModalFromFloating] = useState(false);
  const [editTarget, setEditTarget] = useState<{
    dateKey: string;
    itemIndex: number;
    item: {
      type: 'income' | 'expense';
      amount: number;
      note: string;
      category: string;
      recurringId?: string;
    };
  } | null>(null);

  const [isMYOpen, setIsMYOpen] = useState(false);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const { budget, updateBudget, resetBudget } = useBudget();

  const [newTransaction, setNewTransaction] = useState({
    type: 'expense' as 'expense' | 'income',
    amount: '',
    note: '',
    category: '',
    repeat: 'none' as 'none' | 'daily' | 'weekday' | 'weekly' | 'monthly',
    repeatEndDate: null as Date | null,
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
  addRecurringTransaction,
  deleteTransaction,
  editTransaction,
  recurring,
  deleteRecurringTransaction,
  searchTransactions,
} = useTransactions();


  const weeklySpent = getWeeklySpent();
  const monthlySpent = getMonthlySpent(budget.monthlyCycleAnchorDay);
  const searchResults = searchQuery.trim()
    ? searchTransactions(searchQuery)
    : [];

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
        if (data) setSearchHistory(JSON.parse(data));
      } catch (error) {
        console.error('Error loading search history:', error);
      }
    };
    loadHistory();
  }, []);

  useEffect(() => {
    const saveHistory = async () => {
      try {
        await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory));
      } catch (error) {
        console.error('Error saving search history:', error);
      }
    };
    saveHistory();
  }, [searchHistory]);

  const commitSearch = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setSearchHistory((prev) => {
      const next = [trimmed, ...prev.filter((item) => item !== trimmed)];
      return next.slice(0, 10);
    });
  };

  const handleSelectHistory = (value: string) => {
    setSearchQuery(value);
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
  };

  const openSearch = () => {
    setIsSearchVisible(true);
  };

  const closeSearch = () => {
    setIsSearchVisible(false);
  };

  const handleSearchSelect = (dateKey: string) => {
    commitSearch(searchQuery);
    const [year, month, day] = dateKey.split('-').map(Number);
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(day);
    setIsModalVisible(true);
    setIsSearchVisible(false);
  };

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
      setPendingModal(null);
      setSelectedDay(day);
      setIsModalVisible(true);
    }
  };

  const closeDayModal = () => {
    setPendingModal(null);
    setIsModalVisible(false);
  };

 const openAddModal = () => {
  setIsAddModalFromFloating(false);
  setPendingModal('add');
  setIsModalVisible(false);
};
  const closeAddModal = () => {
    setIsAddModalVisible(false);
    setIsAddModalFromFloating(false);
    setEditTarget(null);
    setNewTransaction({
      type: 'expense',
      amount: '',
      note: '',
      category: '',
      repeat: 'none',
      repeatEndDate: null,
    });
  };

const handleAddTransaction = (date?: Date) => {
  if (!newTransaction.amount) return;

  const amount = parseFloat(newTransaction.amount);
  if (Number.isNaN(amount)) return;

  if (editTarget) {
    editTransaction(
      editTarget.dateKey,
      editTarget.itemIndex,
      {
      type: newTransaction.type,
      amount,
      note: newTransaction.note || 'No note',
      category: newTransaction.category,
      },
      editTarget.item
    );
  } else if (newTransaction.repeat !== 'none') {
    const startDate = isAddModalFromFloating && date
      ? date
      : selectedDay
        ? new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay)
        : new Date();
    const endDate =
      newTransaction.repeatEndDate &&
      newTransaction.repeatEndDate < startDate
        ? startDate
        : newTransaction.repeatEndDate;

    addRecurringTransaction(
      startDate,
      newTransaction.type,
      amount,
      newTransaction.note,
      newTransaction.category,
      newTransaction.repeat,
      endDate
    );
  } else if (isAddModalFromFloating && date) {
    // From floating button - use the date picker date
    addTransactionWithDate(date, newTransaction.type, amount, newTransaction.note, newTransaction.category);
  } else if (selectedDay) {
    // From calendar - use selected day
    addTransaction(currentDate, selectedDay, newTransaction.type, amount, newTransaction.note, newTransaction.category);
  }

  setNewTransaction({
    type: 'expense',
    amount: '',
    note: '',
    category: '',
    repeat: 'none',
    repeatEndDate: null,
  });
  setIsAddModalVisible(false);
  setIsAddModalFromFloating(false);
  setEditTarget(null);
};
  const handleModalHide = () => {
    if (pendingModal) {
      setIsAddModalVisible(true);
      setPendingModal(null);
    }
  };

  const openEditTransaction = (
    dateKey: string,
    itemIndex: number,
    item: { type: 'income' | 'expense'; amount: number; note: string; category: string; recurringId?: string },
    closeDayFirst: boolean
  ) => {
    setEditTarget({ dateKey, itemIndex, item });
    setNewTransaction({
      type: item.type,
      amount: String(item.amount),
      note: item.note,
      category: item.category,
      repeat: 'none',
      repeatEndDate: null,
    });
    setIsAddModalFromFloating(false);

    if (closeDayFirst) {
      setPendingModal('edit');
      setIsModalVisible(false);
    } else {
      setIsAddModalVisible(true);
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
        onSearchPress={openSearch}
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
          onEditTransaction={(dateKey, itemIndex, item) =>
            openEditTransaction(dateKey, itemIndex, item, false)
          }
          onDeleteTransaction={deleteTransaction}
        />
      )}

      <FloatingButton
  onPaymentReminder={() => setIsPaymentReminderVisible(true)}
  onSetBudget={() => setIsBudgetModalVisible(true)}
  onNewTransaction={() => {
    setIsAddModalFromFloating(true);
    setIsAddModalVisible(true);
  }}
  onManageRecurring={() => setIsRecurringModalVisible(true)}
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
  onEditTransaction={(dateKey, itemIndex, item) =>
    openEditTransaction(dateKey, itemIndex, item, true)
  }
/>

      <AddTransactionModal
        isVisible={isAddModalVisible}
        newTransaction={newTransaction}
        onClose={closeAddModal}
        onSave={handleAddTransaction}
        onChangeTransaction={setNewTransaction}
        showDatePicker={isAddModalFromFloating}
        initialDate={new Date()}
        allowRepeat={!editTarget}
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

      <RecurringManagerModal
        isVisible={isRecurringModalVisible}
        recurring={recurring}
        onClose={() => setIsRecurringModalVisible(false)}
        onDeleteRecurring={deleteRecurringTransaction}
      />

      <SearchModal
        isVisible={isSearchVisible}
        query={searchQuery}
        results={searchResults}
        history={searchHistory}
        onQueryChange={setSearchQuery}
        onCommitQuery={commitSearch}
        onSelectHistory={handleSelectHistory}
        onClearHistory={handleClearHistory}
        onClose={closeSearch}
        onSelectDate={handleSearchSelect}
      />

      <PaymentReminderModal
  isVisible={isPaymentReminderVisible}
  onClose={() => setIsPaymentReminderVisible(false)}
/>
    </View>
  );
}
