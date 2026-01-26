import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Keyboard,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import { colors } from '../styles/colors';
import { homeStyles as styles } from '../styles/homeStyles';

type CurrencyCode = 'USD' | 'KRW';

type NewTransaction = {
  type: 'expense' | 'income';
  amount: string;
  note: string;
  category: string;
};

type AddTransactionModalProps = {
  isVisible: boolean;
  newTransaction: NewTransaction;
  onClose: () => void;
  onSave: (date?: Date) => void;
  onChangeTransaction: (transaction: NewTransaction) => void;
  currencyCode: CurrencyCode;
  showDatePicker?: boolean;
  initialDate?: Date;
};

const currencySymbolMap: Record<CurrencyCode, string> = {
  USD: '$',
  KRW: '₩',
};

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const AddTransactionModal = ({
  isVisible,
  newTransaction,
  onClose,
  onSave,
  onChangeTransaction,
  currencyCode,
  showDatePicker = false,
  initialDate,
}: AddTransactionModalProps) => {
  const [view, setView] = useState<'form' | 'category' | 'date'>('form');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  // Date picker state (iOS wheel)
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tempDate, setTempDate] = useState(new Date());

  const amountRef = useRef<TextInput>(null);

  const expenseCategories = useMemo(
    () => [
      'Groceries',
      'Food',
      'Transport',
      'Shopping',
      'Entertainment',
      'Bills',
      'Subscriptions',
      'E-transfer',
      'Other',
    ],
    []
  );

  const incomeCategories = useMemo(
    () => ['Salary', 'Allowance', 'Bank Transfer', 'E-transfer', 'Other'],
    []
  );

  const categoriesForType =
    newTransaction.type === 'expense' ? expenseCategories : incomeCategories;

  const currencySymbol = currencySymbolMap[currencyCode] ?? '$';

  const closeAll = () => {
    Keyboard.dismiss();
    setView('form');
    setIsAddingCustom(false);
    setCustomCategory('');
    onClose();
  };

  const goBackToForm = () => {
    setView('form');
    setIsAddingCustom(false);
    setCustomCategory('');
    setTimeout(() => amountRef.current?.focus(), 150);
  };

  const openCategoryPage = () => setView('category');

  const openDatePicker = () => {
    Keyboard.dismiss();
    setTempDate(selectedDate);
    setView('date');
  };

  const confirmDate = () => {
    setSelectedDate(tempDate);
    setView('form');
  };

  const cancelDate = () => {
    setTempDate(selectedDate);
    setView('form');
  };

  const selectCategory = (cat: string) => {
    onChangeTransaction({ ...newTransaction, category: cat });
    goBackToForm();
  };

  const addCustomAndSelect = () => {
    const trimmed = customCategory.trim();
    if (!trimmed) return;
    selectCategory(trimmed);
  };

  const handleSave = () => {
    if (showDatePicker) onSave(selectedDate);
    else onSave();
  };

  const canSave =
    newTransaction.amount.trim().length > 0 && newTransaction.category.trim().length > 0;

  // Reset state when modal opens
  useEffect(() => {
    if (!isVisible) return;

    setView('form');
    setIsAddingCustom(false);
    setCustomCategory('');

    const base = initialDate ?? new Date();
    setSelectedDate(base);
    setTempDate(base);

    const t = setTimeout(() => amountRef.current?.focus(), 250);
    return () => clearTimeout(t);
  }, [isVisible, initialDate]);

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const maxSheetHeight = Math.floor(Dimensions.get('window').height * 0.88);
  const footerHeight = 84;

  const renderDateCard = () => {
    return (
      <View style={local.dateCard}>
        <View style={local.nativePickerWrap}>
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="spinner"
            themeVariant="light"
            onChange={(_, date) => {
              if (date) setTempDate(date);
            }}
            style={local.wheel}
          />
        </View>

        <View style={local.datePickerButtonsSmall}>
          <TouchableOpacity style={local.datePickerButton} onPress={cancelDate}>
            <Text style={local.cancelText}>취소</Text>
          </TouchableOpacity>
          <TouchableOpacity style={local.datePickerButton} onPress={confirmDate}>
            <Text style={local.confirmText}>확인</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={closeAll}
      onSwipeComplete={closeAll}
      swipeDirection={['down']}
      style={[styles.modal, view === 'date' ? local.centeredModal : undefined]}
      backdropTransitionOutTiming={0}
      avoidKeyboard
      propagateSwipe
    >
      {view === 'date' ? (
        renderDateCard()
      ) : (
        <View style={local.kav}>
          <SafeAreaView style={local.safeArea}>
            <View
              style={[
                styles.modalContent,
                local.sheet,
                {
                  maxHeight: maxSheetHeight,
                },
              ]}
            >
              <View style={styles.modalHandle} />

              {/* Header */}
              <View style={local.headerRow}>
                {view !== 'form' ? (
                  <TouchableOpacity onPress={goBackToForm} style={local.headerBtn}>
                    <Text style={local.headerBtnText}>‹</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={local.headerBtnPlaceholder} />
                )}

                <Text style={styles.modalDate}>
                  {view === 'form' && 'Add Transaction'}
                  {view === 'category' && 'Select Category'}
                </Text>

                <TouchableOpacity onPress={closeAll} style={local.headerBtn}>
                  <Text style={local.headerBtnText}>×</Text>
                </TouchableOpacity>
              </View>

              {view === 'form' ? (
                <View style={local.body}>
                  <ScrollView
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[
                      local.scrollContent,
                      { paddingBottom: footerHeight + 12 },
                    ]}
                  >
                    {/* Type Toggle */}
                    <View style={styles.typeToggle}>
                      <TouchableOpacity
                        style={[
                          styles.typeButton,
                          newTransaction.type === 'expense' && styles.typeButtonActive,
                        ]}
                        onPress={() =>
                          onChangeTransaction({
                            ...newTransaction,
                            type: 'expense',
                            category: '',
                          })
                        }
                      >
                        <Text
                          style={[
                            styles.typeButtonText,
                            newTransaction.type === 'expense' && styles.typeButtonTextActive,
                          ]}
                        >
                          Expense
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.typeButton,
                          newTransaction.type === 'income' && styles.typeButtonActive,
                        ]}
                        onPress={() =>
                          onChangeTransaction({
                            ...newTransaction,
                            type: 'income',
                            category: '',
                          })
                        }
                      >
                        <Text
                          style={[
                            styles.typeButtonText,
                            newTransaction.type === 'income' && styles.typeButtonTextActive,
                          ]}
                        >
                          Income
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Amount */}
                    <View style={local.amountWrap}>
                      <Text style={local.currencySymbol}>{currencySymbol}</Text>
                      <TextInput
                        ref={amountRef}
                        style={local.amountInput}
                        placeholder="0"
                        keyboardType="decimal-pad"
                        value={newTransaction.amount}
                        onChangeText={(text) =>
                          onChangeTransaction({ ...newTransaction, amount: text })
                        }
                        returnKeyType="done"
                      />
                    </View>

                    {/* Date Row */}
                    {showDatePicker && (
                      <TouchableOpacity style={local.row} onPress={openDatePicker}>
                        <Text style={local.rowLabel}>Date</Text>
                        <Text style={local.rowValue}>{formatDate(selectedDate)}</Text>
                        <Text style={local.rowChevron}>›</Text>
                      </TouchableOpacity>
                    )}

                    {/* Category row */}
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={openCategoryPage}
                      style={local.row}
                    >
                      <Text style={local.rowLabel}>Category</Text>
                      <Text
                        style={[
                          local.rowValue,
                          !newTransaction.category && local.rowPlaceholder,
                        ]}
                      >
                        {newTransaction.category ? newTransaction.category : 'Select category'}
                      </Text>
                      <Text style={local.rowChevron}>›</Text>
                    </TouchableOpacity>

                    {/* Note Input */}
                    <TextInput
                      style={styles.noteInput}
                      placeholder="Add a note..."
                      value={newTransaction.note}
                      onChangeText={(text) =>
                        onChangeTransaction({ ...newTransaction, note: text })
                      }
                      returnKeyType="done"
                    />
                  </ScrollView>

                  {/* Save pinned */}
                  <View style={[local.footerPinned, { height: footerHeight }]}>
                    <TouchableOpacity
                      style={[styles.addButton, !canSave && local.disabledBtn, { marginTop: 0 }]}
                      onPress={handleSave}
                      disabled={!canSave}
                    >
                      <Text style={[styles.addButtonText, !canSave && local.disabledBtnText]}>
                        Save
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                // category
                <View style={local.body}>
                  <ScrollView
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={local.scrollContent}
                  >
                    {/* + Add custom */}
                    <TouchableOpacity
                      style={local.addCustomRow}
                      onPress={() => setIsAddingCustom((v) => !v)}
                      activeOpacity={0.85}
                    >
                      <Text style={local.addCustomPlus}>＋</Text>
                      <Text style={local.addCustomText}>Add custom</Text>
                    </TouchableOpacity>

                    {isAddingCustom && (
                      <View style={local.customWrap}>
                        <TextInput
                          value={customCategory}
                          onChangeText={setCustomCategory}
                          placeholder="Type a category name..."
                          style={local.customInput}
                          returnKeyType="done"
                          onSubmitEditing={addCustomAndSelect}
                        />
                        <TouchableOpacity
                          style={[local.customSave, !customCategory.trim() && local.disabledBtn]}
                          disabled={!customCategory.trim()}
                          onPress={addCustomAndSelect}
                        >
                          <Text style={local.customSaveText}>Add</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    <Text style={local.sectionTitle}>
                      {newTransaction.type === 'expense'
                        ? 'Expense categories'
                        : 'Income categories'}
                    </Text>

                    <View style={local.list}>
                      {categoriesForType.map((cat) => {
                        const selected = newTransaction.category === cat;
                        return (
                          <TouchableOpacity
                            key={cat}
                            style={[local.listRow, selected && local.listRowSelected]}
                            onPress={() => selectCategory(cat)}
                            activeOpacity={0.85}
                          >
                            <Text style={[local.listText, selected && local.listTextSelected]}>
                              {cat}
                            </Text>
                            {selected && <Text style={local.check}>✓</Text>}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </ScrollView>
                </View>
              )}
            </View>
          </SafeAreaView>
        </View>
      )}
    </Modal>
  );
};

const local = StyleSheet.create({
  kav: { flex: 1 },
  safeArea: { flex: 1, justifyContent: 'flex-end' },

  centeredModal: {
    justifyContent: 'center',
    margin: 0,
    paddingHorizontal: 16,
  },

  sheet: {
    flexGrow: 1,
    flexShrink: 1,
    width: '100%',
    alignSelf: 'center',
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  headerBtnPlaceholder: { width: 36, height: 36 },
  headerBtnText: { fontSize: 20, fontWeight: '700' },

  body: { flex: 1 },
  scrollContent: { paddingBottom: 16 },

  amountWrap: {
    marginTop: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  currencySymbol: {
    fontSize: 40,
    fontWeight: '600',
    marginRight: 4,
  },
  amountInput: {
    fontSize: 40,
    fontWeight: '600',
    minWidth: 50,
    textAlign: 'left',
  },

  row: {
    marginBottom: 12,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(0,0,0,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowLabel: { fontSize: 14, fontWeight: '700', opacity: 0.85 },
  rowValue: { flex: 1, fontSize: 14, textAlign: 'right', opacity: 0.9, marginRight: 8 },
  rowPlaceholder: { opacity: 0.5 },
  rowChevron: { fontSize: 18, opacity: 0.6 },

  footerPinned: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: 'white',
  },

  sectionTitle: {
    marginTop: 12,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '700',
    opacity: 0.65,
    textTransform: 'uppercase',
  },

  addCustomRow: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(0,0,0,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addCustomPlus: { fontSize: 18, fontWeight: '800', opacity: 0.85 },
  addCustomText: { fontSize: 14, fontWeight: '700', opacity: 0.85 },

  customWrap: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  customInput: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(0,0,0,0.05)',
    fontSize: 14,
  },
  customSave: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  customSaveText: { color: 'white', fontWeight: '800' },

  list: { borderRadius: 12, overflow: 'hidden' },
  listRow: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listRowSelected: { backgroundColor: 'rgba(0,0,0,0.08)' },
  listText: { fontSize: 14, fontWeight: '700', opacity: 0.85 },
  listTextSelected: { opacity: 1 },
  check: { fontSize: 16, fontWeight: '900', opacity: 0.9 },

  disabledBtn: { opacity: 0.45 },
  disabledBtnText: { opacity: 0.9 },

  // Small centered iOS date picker card
  dateCard: {
    backgroundColor: colors.white,
    borderRadius: 25,
    paddingTop: 5,
    paddingBottom: 10,
    paddingHorizontal: 10,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },

  nativePickerWrap: {
    backgroundColor: colors.white,
    overflow: 'hidden',
  },

  wheel: {
    height: 170,
  },

  datePickerButtonsSmall: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 28
  },

  datePickerButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
  },

  cancelText: {
    fontSize: 16,
    color: colors.gray600,
    fontWeight: '600',
  },
  confirmText: {
    fontSize: 16,
    color: colors.black,
    fontWeight: '700',
  },
});
