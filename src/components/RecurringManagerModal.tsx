import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import { useSettings } from '../hooks/useSettings';
import { colors } from '../styles/colors';
import { homeStyles as styles } from '../styles/homeStyles';
import { RecurringTransaction } from '../types/transaction';
import { monthNames } from '../utils/dateUtils';
import { Text } from './Text';

type RecurringManagerModalProps = {
  isVisible: boolean;
  recurring: RecurringTransaction[];
  onClose: () => void;
  onDeleteRecurring: (id: string) => void;
};

const formatDate = (dateKey: string) => {
  const [year, month, day] = dateKey.split('-').map(Number);
  return `${monthNames[month - 1]} ${day}, ${year}`;
};

const repeatLabel = (pattern: RecurringTransaction['pattern']) => {
  switch (pattern) {
    case 'daily':
      return 'Daily';
    case 'weekday':
      return 'Weekdays (Mon–Fri)';
    case 'weekly':
      return 'Weekly';
    case 'monthly':
      return 'Monthly';
    default:
      return 'Custom';
  }
};

export const RecurringManagerModal = ({
  isVisible,
  recurring,
  onClose,
  onDeleteRecurring,
}: RecurringManagerModalProps) => {
  const { settings, updateSettings } = useSettings();
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempTime, setTempTime] = useState(new Date());

  useEffect(() => {
    if (!isVisible) return;
    const minutes = settings.recurringApplyTimeMinutes ?? 22 * 60;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const base = new Date();
    base.setHours(hours, mins, 0, 0);
    setTempTime(base);
    setShowTimePicker(false);
  }, [isVisible, settings.recurringApplyTimeMinutes]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const time = new Date();
    time.setHours(hours, mins, 0, 0);
    return time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const saveTime = () => {
    const minutes = tempTime.getHours() * 60 + tempTime.getMinutes();
    updateSettings({ recurringApplyTimeMinutes: minutes });
    setShowTimePicker(false);
  };
  const confirmDelete = (rule: RecurringTransaction) => {
    const message = `Delete recurring transaction "${rule.category}"?`;

    if (Platform.OS === 'web' && typeof globalThis.confirm === 'function') {
      if (globalThis.confirm(message)) onDeleteRecurring(rule.id);
      return;
    }

    Alert.alert('Delete Recurring', message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => onDeleteRecurring(rule.id),
      },
    ]);
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={['down']}
      style={styles.modal}
      backdropTransitionOutTiming={0}
    >
      <View style={styles.modalContent}>
        <View style={styles.modalHandle} />
        <Text style={styles.modalDate}>Manage Recurring</Text>

        <View style={local.settingCard}>
          <TouchableOpacity
            style={local.settingRow}
            onPress={() => setShowTimePicker((v) => !v)}
          >
            <Text style={local.settingLabel}>Scheduled for</Text>
            <Text style={local.settingValue}>
              {formatTime(settings.recurringApplyTimeMinutes ?? 22 * 60)}
            </Text>
          </TouchableOpacity>
          {showTimePicker && (
            <View style={local.timePickerWrap}>
              <DateTimePicker
                value={tempTime}
                mode="time"
                display="spinner"
                themeVariant="light"
                onChange={(_, date) => {
                  if (date) setTempTime(date);
                }}
              />
              <View style={local.timePickerButtons}>
                <TouchableOpacity
                  style={local.timePickerButton}
                  onPress={() => setShowTimePicker(false)}
                >
                  <Text style={local.timePickerCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={local.timePickerButton}
                  onPress={saveTime}
                >
                  <Text style={local.timePickerSave}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {recurring.length === 0 ? (
          <View style={local.emptyState}>
            <Text style={local.emptyText}>No recurring transactions</Text>
          </View>
        ) : (
          <ScrollView style={local.list}>
            {recurring.map((rule) => (
              <View key={rule.id} style={local.card}>
                <View style={local.cardHeader}>
                  <View style={local.cardLeft}>
                    <Text style={local.category}>{rule.category}</Text>
                    <Text style={local.note}>{rule.note}</Text>
                  </View>
                  <Text
                    style={[
                      local.amount,
                      rule.type === 'income' ? local.income : local.expense,
                    ]}
                  >
                    {rule.type === 'income' ? '+' : '-'}${rule.amount}
                  </Text>
                </View>
                <Text style={local.meta}>
                  {repeatLabel(rule.pattern)} · Starts {formatDate(rule.startDate)}
                  {rule.endDate ? ` · Ends ${formatDate(rule.endDate)}` : ' · No end'}
                </Text>
                <TouchableOpacity
                  style={local.deleteButton}
                  onPress={() => confirmDelete(rule)}
                >
                  <Text style={local.deleteButtonText}>Delete series</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        <TouchableOpacity style={styles.addButton} onPress={onClose}>
          <Text style={styles.addButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const local = StyleSheet.create({
  settingCard: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray800,
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray700,
  },
  timePickerWrap: {
    marginTop: 10,
  },
  timePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 6,
  },
  timePickerButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  timePickerCancel: {
    fontSize: 14,
    color: colors.gray600,
    fontWeight: '600',
  },
  timePickerSave: {
    fontSize: 14,
    color: colors.black,
    fontWeight: '700',
  },
  list: {
    maxHeight: 300,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLeft: {
    flex: 1,
    marginRight: 12,
  },
  category: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray800,
  },
  note: {
    fontSize: 12,
    color: colors.gray600,
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
  income: {
    color: colors.income,
  },
  expense: {
    color: colors.expense,
  },
  meta: {
    marginTop: 8,
    fontSize: 12,
    color: colors.gray600,
  },
  deleteButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.expense,
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray500,
  },
});
