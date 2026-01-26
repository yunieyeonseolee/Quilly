import { useEffect, useState } from 'react';
import {
  Alert,
  Keyboard,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import { colors } from '../styles/colors';
import { Budget } from '../types/budget';

type SetBudgetModalProps = {
  isVisible: boolean;
  budget: Budget;
  currencySymbol: string;
  onClose: () => void;
  onSave: (budget: Budget) => void;
  onReset: () => void;
};

export const SetBudgetModal = ({
  isVisible,
  budget,
  currencySymbol,
  onClose,
  onSave,
  onReset,
}: SetBudgetModalProps) => {
  const [weeklyAmount, setWeeklyAmount] = useState('');
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [showWeeklyOnMain, setShowWeeklyOnMain] = useState(true);
  const [showMonthlyOnMain, setShowMonthlyOnMain] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setWeeklyAmount(budget.weeklyAmount > 0 ? budget.weeklyAmount.toString() : '');
      setMonthlyAmount(budget.monthlyAmount > 0 ? budget.monthlyAmount.toString() : '');
      setShowWeeklyOnMain(budget.showWeeklyOnMain);
      setShowMonthlyOnMain(budget.showMonthlyOnMain);
    }
  }, [isVisible, budget]);

  const handleSave = () => {
    Keyboard.dismiss();
    onSave({
      weeklyAmount: parseFloat(weeklyAmount) || 0,
      monthlyAmount: parseFloat(monthlyAmount) || 0,
      showWeeklyOnMain,
      showMonthlyOnMain,
    });
    onClose();
  };

  const handleClose = () => {
    Keyboard.dismiss();
    onClose();
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Budget',
      'Are you sure you want to reset all budget settings?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            onReset();
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={handleClose}
      onSwipeComplete={handleClose}
      swipeDirection={['down']}
      style={styles.modal}
      backdropTransitionOutTiming={0}
      avoidKeyboard
      propagateSwipe
    >
      <View style={styles.content}>
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <View style={{ width: 36 }} />
          <Text style={styles.title}>Set Budget</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Weekly Budget Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Budget</Text>
            <View style={styles.amountRow}>
              <Text style={styles.currencySymbol}>{currencySymbol}</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                keyboardType="numeric"
                value={weeklyAmount}
                onChangeText={setWeeklyAmount}
                returnKeyType="done"
              />
            </View>
          </View>

          {/* Monthly Budget Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Monthly Budget</Text>
            <View style={styles.amountRow}>
              <Text style={styles.currencySymbol}>{currencySymbol}</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                keyboardType="numeric"
                value={monthlyAmount}
                onChangeText={setMonthlyAmount}
                returnKeyType="done"
              />
            </View>
          </View>

          {/* Display Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Display on Main</Text>
            
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Show weekly budget</Text>
              <Switch
                value={showWeeklyOnMain}
                onValueChange={setShowWeeklyOnMain}
              />
            </View>

            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Show monthly budget</Text>
              <Switch
                value={showMonthlyOnMain}
                onValueChange={setShowMonthlyOnMain}
              />
            </View>

            {showWeeklyOnMain && showMonthlyOnMain && (
              <Text style={styles.hint}>
                Swipe left/right on the budget bar to switch views
              </Text>
            )}
          </View>

          {/* Reset Button */}
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Reset Budget</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  content: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.gray400,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  closeBtnText: {
    fontSize: 20,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray700,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  toggleLabel: {
    fontSize: 16,
    color: colors.gray800,
  },
  hint: {
    fontSize: 12,
    color: colors.gray600,
    marginTop: 8,
    fontStyle: 'italic',
  },
  resetButton: {
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  resetButtonText: {
    fontSize: 16,
    color: colors.expense,
    fontWeight: '500',
  },
  footer: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  saveButton: {
    backgroundColor: colors.black,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});