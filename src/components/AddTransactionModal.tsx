import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Keyboard,
  Platform,
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
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
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
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Date picker state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tempYear, setTempYear] = useState(new Date().getFullYear());
  const [tempMonth, setTempMonth] = useState(new Date().getMonth());
  const [tempDay, setTempDay] = useState(new Date().getDate());

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

  const categoriesForType = newTransaction.type === 'expense' ? expenseCategories : incomeCategories;
  const currencySymbol = currencySymbolMap[currencyCode] ?? '$';

  const closeAll = () => {
    Keyboard.dismiss();
    setView('form');
    setIsAddingCustom(false);
    setCustomCategory('');
    setKeyboardHeight(0);
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
    setTempYear(selectedDate.getFullYear());
    setTempMonth(selectedDate.getMonth());
    setTempDay(selectedDate.getDate());
    setView('date');
  };

  const confirmDate = () => {
    const daysInMonth = new Date(tempYear, tempMonth + 1, 0).getDate();
    const safeDay = Math.min(tempDay, daysInMonth);
    setSelectedDate(new Date(tempYear, tempMonth, safeDay));
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
    if (showDatePicker) {
      onSave(selectedDate);
    } else {
      onSave();
    }
  };

  const canSave =
    newTransaction.amount.trim().length > 0 && newTransaction.category.trim().length > 0;

  // Reset state when modal opens
  useEffect(() => {
    if (!isVisible) return;
    setView('form');
    setIsAddingCustom(false);
    setCustomCategory('');
    
    // Set initial date
    if (initialDate) {
      setSelectedDate(initialDate);
      setTempYear(initialDate.getFullYear());
      setTempMonth(initialDate.getMonth());
      setTempDay(initialDate.getDate());
    } else {
      const now = new Date();
      setSelectedDate(now);
      setTempYear(now.getFullYear());
      setTempMonth(now.getMonth());
      setTempDay(now.getDate());
    }
    
    const t = setTimeout(() => amountRef.current?.focus(), 250);
    return () => clearTimeout(t);
  }, [isVisible, initialDate]);

  // Keyboard handling
  useEffect(() => {
    if (!isVisible) {
      setKeyboardHeight(0);
      return;
    }

    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (e: any) => setKeyboardHeight(e?.endCoordinates?.height ?? 0);
    const onHide = () => setKeyboardHeight(0);

    const s = Keyboard.addListener(showEvt, onShow);
    const h = Keyboard.addListener(hideEvt, onHide);

    return () => {
      s.remove();
      h.remove();
    };
  }, [isVisible]);

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }
  };

  const maxSheetHeight = Math.floor(Dimensions.get('window').height * 0.88);
  const lift = keyboardHeight ? Math.min(Math.max(keyboardHeight - 12, 0), 280) : 0;
  const footerHeight = 84;

  // Date Picker View - Native iOS Style
  const renderDatePicker = () => {
    const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const daysInMonth = new Date(tempYear, tempMonth + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <View style={local.body}>
        <View style={local.pickerContainer}>
          {/* Year */}
          <Picker
            selectedValue={tempYear}
            onValueChange={(val) => setTempYear(val)}
            style={local.picker}
            itemStyle={local.pickerItemStyle}
          >
            {years.map((year) => (
              <Picker.Item key={year} label={`${year}년`} value={year} />
            ))}
          </Picker>

          {/* Month */}
          <Picker
            selectedValue={tempMonth + 1}
            onValueChange={(val) => setTempMonth(val - 1)}
            style={local.picker}
            itemStyle={local.pickerItemStyle}
          >
            {months.map((month) => (
              <Picker.Item key={month} label={`${month}월`} value={month} />
            ))}
          </Picker>

          {/* Day */}
          <Picker
            selectedValue={tempDay}
            onValueChange={(val) => setTempDay(val)}
            style={local.picker}
            itemStyle={local.pickerItemStyle}
          >
            {days.map((day) => (
              <Picker.Item key={day} label={`${day}일`} value={day} />
            ))}
          </Picker>
        </View>

        {/* Buttons */}
        <View style={local.datePickerButtons}>
          <TouchableOpacity style={local.datePickerButton} onPress={goBackToForm}>
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
      style={styles.modal}
      backdropTransitionOutTiming={0}
      avoidKeyboard={false}
      propagateSwipe
    >
      <View style={local.kav}>
        <SafeAreaView style={local.safeArea}>
          <View
            style={[
              styles.modalContent,
              local.sheet,
              {
                maxHeight: maxSheetHeight,
                marginBottom: lift,
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
                {view === 'date' && 'Select Date'}
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
                  contentContainerStyle={[local.scrollContent, { paddingBottom: footerHeight + 12 }]}
                >
                  {/* Type Toggle */}
                  <View style={styles.typeToggle}>
                    <TouchableOpacity
                      style={[
                        styles.typeButton,
                        newTransaction.type === 'expense' && styles.typeButtonActive,
                      ]}
                      onPress={() => onChangeTransaction({ ...newTransaction, type: 'expense', category: '' })}
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
                      onPress={() => onChangeTransaction({ ...newTransaction, type: 'income', category: '' })}
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
                      keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
                      value={newTransaction.amount}
                      onChangeText={(text) =>
                        onChangeTransaction({ ...newTransaction, amount: text })
                      }
                      returnKeyType="done"
                    />
                  </View>

                  {/* Date Row - Only show if showDatePicker is true */}
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
                    <Text style={[local.rowValue, !newTransaction.category && local.rowPlaceholder]}>
                      {newTransaction.category ? newTransaction.category : 'Select category'}
                    </Text>
                    <Text style={local.rowChevron}>›</Text>
                  </TouchableOpacity>

                  {/* Note Input */}
                  <TextInput
                    style={styles.noteInput}
                    placeholder="Add a note..."
                    value={newTransaction.note}
                    onChangeText={(text) => onChangeTransaction({ ...newTransaction, note: text })}
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
            ) : view === 'category' ? (
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
                    {newTransaction.type === 'expense' ? 'Expense categories' : 'Income categories'}
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
            ) : (
              renderDatePicker()
            )}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const local = StyleSheet.create({
  kav: { flex: 1 },
  safeArea: { flex: 1, justifyContent: 'flex-end' },

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

  // Native iOS Picker styles
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    marginVertical: 20,
  },
  picker: {
    flex: 1,
    height: 200,
  },
  pickerItemStyle: {
    fontSize: 20,
    fontWeight: '500',
  },
  datePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingBottom: 20,
  },
  datePickerButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  cancelText: {
    fontSize: 16,
    color: colors.gray600,
  },
  confirmText: {
    fontSize: 16,
    color: colors.black,
    fontWeight: '600',
  },
});