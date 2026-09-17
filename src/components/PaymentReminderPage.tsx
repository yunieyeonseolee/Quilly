import { Picker } from '@react-native-picker/picker';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { useNotifications } from '../hooks/useNotifications';
import { usePaymentReminders } from '../hooks/usePaymentReminders';
import { colors } from '../styles/colors';
import { PaymentReminder } from '../types/paymentReminder';
import { Text } from './Text';

type PaymentReminderPageProps = {
  onClose: () => void;
};

const categories = ['Subscriptions', 'Bills', 'Rent', 'Insurance', 'Loan', 'Other'] as const;

type Frequency = 'weekly' | 'monthly' | 'yearly';
type ActivePicker = null | 'dueDay' | 'category' | 'remindDaysBefore';

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const remindOptions = [
  { label: 'On the day', value: 0 },
  { label: '1 day before', value: 1 },
  { label: '2 days before', value: 2 },
  { label: '3 days before', value: 3 },
  { label: '1 week before', value: 7 },
];

function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function dueLabel(frequency: Frequency, dueDay: number) {
  if (frequency === 'weekly') return weekdayLabels[dueDay] ?? 'Sun';
  return `${ordinal(dueDay)}`;
}

function remindLabel(remindDaysBefore: number) {
  return remindOptions.find((o) => o.value === remindDaysBefore)?.label ?? 'On the day';
}

type SelectRowProps = {
  label: string;
  value: string;
  onPress: () => void;
};

const SelectRow = ({ label, value, onPress }: SelectRowProps) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.selectRow} activeOpacity={0.7}>
      <Text style={styles.selectRowLabel}>{label}</Text>
      <View style={styles.selectRowRight}>
        <Text style={styles.selectRowValue}>{value}</Text>
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
};

type PickerSheetProps = {
  visible: boolean;
  title: string;
  onCancel: () => void;
  onDone: () => void;
  children: React.ReactNode;
};

const PickerSheet = ({ visible, title, onCancel, onDone, children }: PickerSheetProps) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <Pressable style={styles.sheetBackdrop} onPress={onCancel} />
      <View style={styles.sheet}>
        <View style={styles.sheetHeader}>
          <TouchableOpacity onPress={onCancel} style={styles.sheetHeaderBtn}>
            <Text style={styles.sheetHeaderBtnText}>Cancel</Text>
          </TouchableOpacity>

          <Text style={styles.sheetTitle}>{title}</Text>

          <TouchableOpacity onPress={onDone} style={styles.sheetHeaderBtn}>
            <Text style={styles.sheetHeaderBtnText}>Done</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sheetBody}>{children}</View>
      </View>
    </Modal>
  );
};

export const PaymentReminderPage = ({ onClose }: PaymentReminderPageProps) => {
  const { settings } = useSettings();
  const currencySymbol = settings.currency === 'KRW' ? '₩' : '$';

  const {
    reminders,
    addReminder,
    deleteReminder,
    getDaysUntilDue,
    getNextDueDate,
    updateReminder,
  } = usePaymentReminders();
  const { schedulePaymentReminder, cancelNotification } = useNotifications();

  const [isAdding, setIsAdding] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [newReminder, setNewReminder] = useState({
    name: '',
    amount: '',
    dueDay: 1, // monthly: 1..31, weekly: 0..6
    frequency: 'monthly' as Frequency,
    category: 'Subscriptions',
    remindDaysBefore: 1,
  });

  // Sheet state
  const [activePicker, setActivePicker] = useState<ActivePicker>(null);

  // Temp values while sheet is open
  const [tempDueDay, setTempDueDay] = useState<number>(newReminder.dueDay);
  const [tempCategory, setTempCategory] = useState<string>(newReminder.category);
  const [tempRemind, setTempRemind] = useState<number>(newReminder.remindDaysBefore);

  const resetForm = () => {
    setNewReminder({
      name: '',
      amount: '',
      dueDay: 1,
      frequency: 'monthly',
      category: 'Subscriptions',
      remindDaysBefore: 1,
    });
    setEditingId(null);
    setIsAdding(false);
  };

  const openAdd = () => {
    setEditingId(null);
    setIsAdding(true);
    setNewReminder({
      name: '',
      amount: '',
      dueDay: 1,
      frequency: 'monthly',
      category: 'Subscriptions',
      remindDaysBefore: 1,
    });
  };

  const openEdit = (reminder: PaymentReminder) => {
    setEditingId(reminder.id);
    setIsAdding(true);
    setNewReminder({
      name: reminder.name,
      amount: String(reminder.amount),
      dueDay: reminder.dueDay,
      frequency: reminder.frequency as Frequency,
      category: reminder.category,
      remindDaysBefore: reminder.remindDaysBefore,
    });
  };

  const openPicker = (which: ActivePicker) => {
    if (!which) return;

    if (which === 'dueDay') setTempDueDay(newReminder.dueDay);
    if (which === 'category') setTempCategory(newReminder.category);
    if (which === 'remindDaysBefore') setTempRemind(newReminder.remindDaysBefore);

    setActivePicker(which);
  };

  const closePicker = () => setActivePicker(null);

  const handleDonePicker = () => {
    if (activePicker === 'dueDay') {
      setNewReminder((r) => ({ ...r, dueDay: tempDueDay }));
    } else if (activePicker === 'category') {
      setNewReminder((r) => ({ ...r, category: tempCategory }));
    } else if (activePicker === 'remindDaysBefore') {
      setNewReminder((r) => ({ ...r, remindDaysBefore: tempRemind }));
    }
    closePicker();
  };

  const handleFrequencyChange = (freq: Frequency) => {
    setNewReminder((r) => {
      if (freq === 'weekly') {
        const nextDueDay = r.dueDay >= 0 && r.dueDay <= 6 ? r.dueDay : 0;
        return { ...r, frequency: freq, dueDay: nextDueDay };
      }
      const nextDueDay = r.dueDay >= 1 && r.dueDay <= 31 ? r.dueDay : 1;
      return { ...r, frequency: freq, dueDay: nextDueDay };
    });
  };

  const validateForm = () => {
    if (!newReminder.name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return false;
    }
    const amt = parseFloat(newReminder.amount);
    if (!newReminder.amount || Number.isNaN(amt) || amt <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const payload = {
      name: newReminder.name.trim(),
      amount: parseFloat(newReminder.amount),
      dueDay: newReminder.dueDay,
      frequency: newReminder.frequency,
      category: newReminder.category,
      remindDaysBefore: newReminder.remindDaysBefore,
    };

    const temporaryReminder: PaymentReminder = {
      id: editingId || 'preview',
      ...payload,
      enabled: true,
    };
    const existingReminder = editingId
      ? reminders.find((reminder) => reminder.id === editingId)
      : null;

    if (existingReminder?.notificationId) {
      await cancelNotification(existingReminder.notificationId);
    }

    const notificationId = await schedulePaymentReminder(
      payload.name,
      payload.amount,
      getNextDueDate(temporaryReminder),
      payload.remindDaysBefore
    );

    if (editingId) {
      updateReminder(editingId, {
        ...payload,
        enabled: existingReminder?.enabled ?? true,
        notificationId: notificationId || undefined,
      });
    } else {
      addReminder({
        ...payload,
        enabled: true,
        notificationId: notificationId || undefined,
      });
    }

    resetForm();
  };

  const handleDelete = (reminder: PaymentReminder) => {
    Alert.alert('Delete Reminder', `Are you sure you want to delete "${reminder.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (reminder.notificationId) {
            await cancelNotification(reminder.notificationId);
          }
          deleteReminder(reminder.id);
        },
      },
    ]);
  };

  const handleToggleReminder = async (reminder: PaymentReminder) => {
    if (reminder.enabled) {
      if (reminder.notificationId) {
        await cancelNotification(reminder.notificationId);
      }
      updateReminder(reminder.id, { enabled: false, notificationId: undefined });
      return;
    }

    const notificationId = await schedulePaymentReminder(
      reminder.name,
      reminder.amount,
      getNextDueDate(reminder),
      reminder.remindDaysBefore
    );
    updateReminder(reminder.id, {
      enabled: true,
      notificationId: notificationId || undefined,
    });
  };

  const formatDueText = (reminder: PaymentReminder) => {
    const days = getDaysUntilDue(reminder);
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `Due in ${days} days`;
  };

  const sheetTitle = useMemo(() => {
    if (activePicker === 'dueDay') return newReminder.frequency === 'weekly' ? 'Day of Week' : 'Due Day';
    if (activePicker === 'category') return 'Category';
    if (activePicker === 'remindDaysBefore') return 'Remind Me';
    return '';
  }, [activePicker, newReminder.frequency]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Payment Reminders</Text>
        <TouchableOpacity onPress={openAdd} style={styles.addButton}>
          <Text style={styles.addText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {/* Add/Edit Form */}
        {isAdding && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>{editingId ? 'Edit Reminder' : 'New Reminder'}</Text>

            <TextInput
              style={styles.input}
              placeholder="Name (e.g., Netflix)"
              value={newReminder.name}
              onChangeText={(text) => setNewReminder({ ...newReminder, name: text })}
              placeholderTextColor={colors.gray500}
            />

            <View style={styles.amountRow}>
              <Text style={styles.currencySymbol}>{currencySymbol}</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
                value={newReminder.amount}
                onChangeText={(text) => setNewReminder({ ...newReminder, amount: text })}
                placeholderTextColor={colors.gray500}
              />
            </View>

            <Text style={styles.label}>Frequency</Text>
            <View style={styles.frequencyOptions}>
              {(['weekly', 'monthly', 'yearly'] as const).map((freq) => (
                <TouchableOpacity
                  key={freq}
                  style={[styles.frequencyButton, newReminder.frequency === freq && styles.frequencyButtonActive]}
                  onPress={() => handleFrequencyChange(freq)}
                >
                  <Text style={[styles.frequencyText, newReminder.frequency === freq && styles.frequencyTextActive]}>
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.selectSection}>
              <SelectRow
                label={newReminder.frequency === 'weekly' ? 'Day of Week' : 'Due day'}
                value={dueLabel(newReminder.frequency, newReminder.dueDay)}
                onPress={() => openPicker('dueDay')}
              />
              <SelectRow label="Category" value={newReminder.category} onPress={() => openPicker('category')} />
              <SelectRow
                label="Remind me"
                value={remindLabel(newReminder.remindDaysBefore)}
                onPress={() => openPicker('remindDaysBefore')}
              />
            </View>

            <View style={styles.formButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>{editingId ? 'Save Changes' : 'Add Reminder'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Reminders List */}
        {reminders.length === 0 && !isAdding ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No payment reminders</Text>
            <Text style={styles.emptySubtext}>Tap + to add a recurring payment reminder</Text>
          </View>
        ) : (
          reminders.map((reminder) => (
            <View key={reminder.id} style={styles.reminderCard}>
              <View style={styles.reminderHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reminderName}>{reminder.name}</Text>
                  <Text style={styles.reminderCategory}>{reminder.category}</Text>
                </View>
                <Text style={styles.reminderAmount}>
                  {currencySymbol}
                  {reminder.amount.toFixed(2)}
                </Text>
              </View>

              <View style={styles.reminderFooter}>
                <Text style={styles.reminderDue}>{formatDueText(reminder)}</Text>

                <View style={styles.reminderActions}>
                  <TouchableOpacity
                    onPress={() => openEdit(reminder)}
                    style={[styles.actionBtn, styles.actionBtnNeutral]}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.actionBtnTextNeutral}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDelete(reminder)}
                    style={[styles.actionBtn, styles.actionBtnDanger]}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.actionBtnTextDanger}>Delete</Text>
                  </TouchableOpacity>

                  <Switch value={reminder.enabled} onValueChange={() => handleToggleReminder(reminder)} />
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Single picker sheet */}
      <PickerSheet visible={activePicker !== null} title={sheetTitle} onCancel={closePicker} onDone={handleDonePicker}>
        {activePicker === 'dueDay' && (
          <Picker
            selectedValue={tempDueDay}
            onValueChange={(val) => setTempDueDay(val)}
            style={styles.sheetPicker}
            itemStyle={styles.sheetPickerItem}
          >
            {newReminder.frequency === 'weekly'
              ? weekdayLabels.map((day, i) => <Picker.Item key={day} label={day} value={i} />)
              : Array.from({ length: 31 }, (_, i) => {
                  const d = i + 1;
                  return <Picker.Item key={d} label={ordinal(d)} value={d} />;
                })}
          </Picker>
        )}

        {activePicker === 'category' && (
          <Picker
            selectedValue={tempCategory}
            onValueChange={(val) => setTempCategory(val)}
            style={styles.sheetPicker}
            itemStyle={styles.sheetPickerItem}
          >
            {categories.map((cat) => (
              <Picker.Item key={cat} label={cat} value={cat} />
            ))}
          </Picker>
        )}

        {activePicker === 'remindDaysBefore' && (
          <Picker
            selectedValue={tempRemind}
            onValueChange={(val) => setTempRemind(val)}
            style={styles.sheetPicker}
            itemStyle={styles.sheetPickerItem}
          >
            {remindOptions.map((o) => (
              <Picker.Item key={o.value} label={o.label} value={o.value} />
            ))}
          </Picker>
        )}
      </PickerSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray100 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 28, fontWeight: '300' },
  title: { fontSize: 18, fontFamily: 'KiwiMaru-Medium' },
  addButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  addText: { fontSize: 28, fontWeight: '300' },

  content: { flex: 1, padding: 16 },

  form: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 16 },
  formTitle: { fontSize: 16, fontFamily: 'KiwiMaru-Medium', marginBottom: 16 },

  input: {
    backgroundColor: colors.gray100,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
    color: colors.black,
  },

  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  currencySymbol: { fontSize: 18, fontWeight: '600', marginRight: 8, color: colors.black },
  amountInput: { flex: 1, fontSize: 18, paddingVertical: 14, color: colors.black },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray600,
    marginBottom: 8,
    marginTop: 8,
    textTransform: 'uppercase',
  },

  frequencyOptions: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  frequencyButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.gray200,
    alignItems: 'center',
  },
  frequencyButtonActive: { backgroundColor: colors.black },
  frequencyText: { fontSize: 14, color: colors.gray700 },
  frequencyTextActive: { color: colors.white },

  selectSection: { marginTop: 10, borderRadius: 12, overflow: 'hidden', backgroundColor: colors.gray100 },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  selectRowLabel: { fontSize: 15, color: colors.gray800, fontWeight: '600' },
  selectRowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  selectRowValue: { fontSize: 15, color: colors.gray600 },
  chevron: { fontSize: 22, color: colors.gray400, marginTop: -1 },

  formButtons: { flexDirection: 'row', gap: 12, marginTop: 16 },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: colors.gray200,
    alignItems: 'center',
  },
  cancelButtonText: { fontSize: 16, color: colors.gray700 },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: colors.black,
    alignItems: 'center',
  },
  saveButtonText: { fontSize: 16, color: colors.white, fontWeight: '600' },

  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, color: colors.gray600 },
  emptySubtext: { fontSize: 14, color: colors.gray400, marginTop: 8 },

  reminderCard: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 12 },
  reminderHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  reminderName: { fontSize: 16, fontFamily: 'KiwiMaru-Medium' },
  reminderCategory: { fontSize: 13, color: colors.gray500, marginTop: 2 },
  reminderAmount: { fontSize: 18, fontWeight: '600' },

  reminderFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reminderDue: { fontSize: 14, color: colors.gray600 },

  reminderActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  actionBtn: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  actionBtnNeutral: {
    backgroundColor: colors.gray200,
  },
  actionBtnDanger: {
    backgroundColor: 'rgba(255, 59, 48, 0.12)',
  },
  actionBtnTextNeutral: {
    fontSize: 14,
    color: colors.gray800,
    fontWeight: '600',
  },
  actionBtnTextDanger: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '700',
  },

  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    backgroundColor: colors.white,
  },
  sheetHeaderBtn: { paddingVertical: 6, paddingHorizontal: 6, minWidth: 64 },
  sheetHeaderBtnText: { fontSize: 16, color: colors.gray800, fontWeight: '600' },
  sheetTitle: { fontSize: 15, color: colors.gray800, fontWeight: '700' },
  sheetBody: { paddingBottom: 22 },
  sheetPicker: { height: 216, backgroundColor: colors.white },
  sheetPickerItem: { fontSize: 20, color: colors.gray800 },
});
