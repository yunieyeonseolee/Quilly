import { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../src/components/Text';
import { useSettings } from '../../src/context/SettingsContext';
import { useGoals } from '../../src/hooks/useGoals';
import { colors } from '../../src/styles/colors';
import { Goal } from '../../src/types/goal';
import { exportData } from '../../src/utils/backup';

type TabType = 'analytics' | 'active' | 'finished';
type GoalCategory = Goal['category'];

type GoalForm = {
  title: string;
  emoji: string;
  targetAmount: string;
  savedAmount: string;
  category: GoalCategory;
  notes: string;
};

const defaultGoalForm: GoalForm = {
  title: '',
  emoji: '🎯',
  targetAmount: '',
  savedAmount: '',
  category: 'savings',
  notes: '',
};

const categoryOptions: { label: string; value: GoalCategory }[] = [
  { label: 'Savings', value: 'savings' },
  { label: 'Travel', value: 'travel' },
  { label: 'Purchase', value: 'purchase' },
  { label: 'Other', value: 'other' },
];

export default function MilestonesScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [isGoalModalVisible, setIsGoalModalVisible] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [goalForm, setGoalForm] = useState<GoalForm>(defaultGoalForm);
  const insets = useSafeAreaInsets();
  const addButtonBottom = Math.max(insets.bottom + 92, 104);
  const { settings } = useSettings();
  const currencySymbol = settings.currency === 'KRW' ? '₩' : '$';

  const {
    goals,
    isLoading,
    addGoal,
    updateGoal,
    deleteGoal,
    getActiveGoals,
    getFinishedGoals,
    getProgress,
  } = useGoals();

  const activeGoals = getActiveGoals();
  const finishedGoals = getFinishedGoals();

  const openAddGoal = () => {
    setEditingGoalId(null);
    setGoalForm(defaultGoalForm);
    setIsGoalModalVisible(true);
  };

  const openEditGoal = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setGoalForm({
      title: goal.title,
      emoji: goal.emoji || '🎯',
      targetAmount: String(goal.targetAmount),
      savedAmount: String(goal.savedAmount),
      category: goal.category,
      notes: goal.notes || '',
    });
    setIsGoalModalVisible(true);
  };

  const closeGoalModal = () => {
    setIsGoalModalVisible(false);
    setEditingGoalId(null);
    setGoalForm(defaultGoalForm);
  };

  const saveGoal = () => {
    const title = goalForm.title.trim();
    const targetAmount = parseFloat(goalForm.targetAmount);
    const savedAmount = goalForm.savedAmount.trim() ? parseFloat(goalForm.savedAmount) : 0;

    if (!title) {
      Alert.alert('Missing Title', 'Please enter a goal title.');
      return;
    }

    if (Number.isNaN(targetAmount) || targetAmount <= 0) {
      Alert.alert('Invalid Target', 'Please enter a target amount greater than zero.');
      return;
    }

    if (Number.isNaN(savedAmount) || savedAmount < 0) {
      Alert.alert('Invalid Saved Amount', 'Please enter a valid saved amount.');
      return;
    }

    const payload = {
      title,
      emoji: goalForm.emoji.trim() || '🎯',
      targetAmount,
      savedAmount,
      category: goalForm.category,
      notes: goalForm.notes.trim(),
      status: savedAmount >= targetAmount ? 'finished' as const : 'active' as const,
    };

    if (editingGoalId) {
      updateGoal(editingGoalId, payload);
    } else {
      addGoal(payload);
    }

    closeGoalModal();
  };

  const confirmDeleteGoal = () => {
    if (!editingGoalId) return;

    Alert.alert('Delete Goal', 'Are you sure you want to delete this goal?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteGoal(editingGoalId);
          closeGoalModal();
        },
      },
    ]);
  };

  const handleExportData = async () => {
    const success = await exportData();
    if (success) {
      Alert.alert('Export Complete', 'Your Quilly backup is ready.');
    }
  };

  const renderGoalCard = (goal: Goal) => {
    const progress = getProgress(goal);

    return (
      <TouchableOpacity key={goal.id} style={styles.card} onPress={() => openEditGoal(goal)}>
        {/* Background Image */}
        <View style={styles.cardImageContainer}>
          {goal.backgroundImage ? (
            <Image source={{ uri: goal.backgroundImage }} style={styles.cardImage} />
          ) : (
            <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
              <Text style={styles.cardEmoji}>{goal.emoji || '🎯'}</Text>
            </View>
          )}
        </View>

        {/* Card Content */}
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{goal.title}</Text>
          <Text style={styles.cardStats}>
            {currencySymbol}{goal.savedAmount.toLocaleString()} / {currencySymbol}{goal.targetAmount.toLocaleString()}
          </Text>
          {goal.notes && (
            <Text style={styles.cardNote} numberOfLines={1}>{goal.notes}</Text>
          )}

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderAnalytics = () => (
    <View style={styles.analyticsContainer}>
      <View style={styles.analyticsCard}>
        <Text style={styles.analyticsLabel}>Total Goals</Text>
        <Text style={styles.analyticsValue}>{goals.length}</Text>
      </View>
      <View style={styles.analyticsCard}>
        <Text style={styles.analyticsLabel}>Active</Text>
        <Text style={styles.analyticsValue}>{activeGoals.length}</Text>
      </View>
      <View style={styles.analyticsCard}>
        <Text style={styles.analyticsLabel}>Finished</Text>
        <Text style={styles.analyticsValue}>{finishedGoals.length}</Text>
      </View>
      <View style={styles.analyticsCard}>
        <Text style={styles.analyticsLabel}>Total Saved</Text>
        <Text style={styles.analyticsValue}>
          {currencySymbol}{goals.reduce((sum, g) => sum + g.savedAmount, 0).toLocaleString()}
        </Text>
      </View>
    </View>
  );

  const renderGoals = (goalsList: Goal[]) => {
    if (goalsList.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No goals yet</Text>
          <Text style={styles.emptySubtext}>Tap + to add your first goal</Text>
        </View>
      );
    }

    return (
      <View style={styles.goalsList}>
        {goalsList.map(renderGoalCard)}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
        <View style={styles.profileRow}>
          <TouchableOpacity style={styles.downloadButton} onPress={handleExportData}>
            <Text style={styles.downloadIcon}>⬇️</Text>
          </TouchableOpacity>
          <Text style={styles.profileName}>Yunie</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'analytics' && styles.tabActive]}
            onPress={() => setActiveTab('analytics')}
          >
            <Text style={[styles.tabText, activeTab === 'analytics' && styles.tabTextActive]}>
              Analytics
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'active' && styles.tabActive]}
            onPress={() => setActiveTab('active')}
          >
            <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
              Active Goal
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'finished' && styles.tabActive]}
            onPress={() => setActiveTab('finished')}
          >
            <Text style={[styles.tabText, activeTab === 'finished' && styles.tabTextActive]}>
              Finished
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'active' && renderGoals(activeGoals)}
        {activeTab === 'finished' && renderGoals(finishedGoals)}
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity style={[styles.addButton, { bottom: addButtonBottom }]} onPress={openAddGoal}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      <Modal
        visible={isGoalModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeGoalModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeGoalModal} style={styles.modalHeaderButton}>
              <Text style={styles.modalHeaderText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editingGoalId ? 'Edit Goal' : 'New Goal'}</Text>
            <TouchableOpacity onPress={saveGoal} style={styles.modalHeaderButton}>
              <Text style={styles.modalHeaderText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
            <Text style={styles.inputLabel}>Title</Text>
            <TextInput
              style={styles.input}
              value={goalForm.title}
              onChangeText={(title) => setGoalForm((form) => ({ ...form, title }))}
              placeholder="Emergency fund"
              placeholderTextColor={colors.gray500}
            />

            <Text style={styles.inputLabel}>Emoji</Text>
            <TextInput
              style={styles.input}
              value={goalForm.emoji}
              onChangeText={(emoji) => setGoalForm((form) => ({ ...form, emoji }))}
              placeholder="🎯"
              placeholderTextColor={colors.gray500}
              maxLength={4}
            />

            <Text style={styles.inputLabel}>Target Amount</Text>
            <TextInput
              style={styles.input}
              value={goalForm.targetAmount}
              onChangeText={(targetAmount) => setGoalForm((form) => ({ ...form, targetAmount }))}
              placeholder="1000"
              placeholderTextColor={colors.gray500}
              keyboardType="decimal-pad"
            />

            <Text style={styles.inputLabel}>Saved Amount</Text>
            <TextInput
              style={styles.input}
              value={goalForm.savedAmount}
              onChangeText={(savedAmount) => setGoalForm((form) => ({ ...form, savedAmount }))}
              placeholder="0"
              placeholderTextColor={colors.gray500}
              keyboardType="decimal-pad"
            />

            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.categoryGrid}>
              {categoryOptions.map((option) => {
                const selected = goalForm.category === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.categoryButton, selected && styles.categoryButtonActive]}
                    onPress={() => setGoalForm((form) => ({ ...form, category: option.value }))}
                  >
                    <Text style={[styles.categoryText, selected && styles.categoryTextActive]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={goalForm.notes}
              onChangeText={(notes) => setGoalForm((form) => ({ ...form, notes }))}
              placeholder="Optional note"
              placeholderTextColor={colors.gray500}
              multiline
            />

            {editingGoalId && (
              <TouchableOpacity style={styles.deleteButton} onPress={confirmDeleteGoal}>
                <Text style={styles.deleteButtonText}>Delete Goal</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: colors.white,
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  downloadButton: {
    marginRight: 12,
  },
  downloadIcon: {
    fontSize: 20,
  },
  profileName: {
    fontSize: 24,
    fontFamily: 'KiwiMaru-Medium',
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: colors.gray200,
  },
  tabActive: {
    backgroundColor: colors.black,
  },
  tabText: {
    fontSize: 13,
    color: colors.gray600,
  },
  tabTextActive: {
    color: colors.white,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  contentContainer: {
    paddingBottom: 150,
  },
  goalsList: {
    flexDirection: 'column',
  },
  card: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardImageContainer: {
    width: '100%',
    height: 150,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImagePlaceholder: {
    backgroundColor: colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardEmoji: {
    fontSize: 40,
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: 'KiwiMaru-Medium',
    marginBottom: 4,
  },
  cardStats: {
    fontSize: 12,
    color: colors.gray600,
    marginBottom: 4,
  },
  cardNote: {
    fontSize: 11,
    color: colors.gray500,
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.gray200,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.black,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: colors.gray600,
    width: 35,
    textAlign: 'right',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray600,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.gray400,
    marginTop: 8,
  },
  analyticsContainer: {
    flexDirection: 'column',
  },
  analyticsCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  analyticsLabel: {
    fontSize: 13,
    color: colors.gray600,
    marginBottom: 8,
  },
  analyticsValue: {
    fontSize: 24,
    fontFamily: 'KiwiMaru-Medium',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonText: {
    fontSize: 28,
    color: colors.white,
    fontWeight: '300',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.gray100,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  modalHeaderButton: {
    minWidth: 64,
    minHeight: 36,
    justifyContent: 'center',
  },
  modalHeaderText: {
    fontSize: 15,
    color: colors.gray800,
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: 'KiwiMaru-Medium',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputLabel: {
    fontSize: 13,
    color: colors.gray700,
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.gray300,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    color: colors.gray800,
    fontSize: 16,
    fontFamily: 'KiwiMaru-Medium',
  },
  notesInput: {
    minHeight: 92,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray300,
    justifyContent: 'center',
  },
  categoryButtonActive: {
    backgroundColor: colors.black,
    borderColor: colors.black,
  },
  categoryText: {
    color: colors.gray800,
    fontSize: 13,
  },
  categoryTextActive: {
    color: colors.white,
  },
  deleteButton: {
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.expense,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 48,
  },
  deleteButtonText: {
    color: colors.expense,
    fontSize: 15,
  },
});
