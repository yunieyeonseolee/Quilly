import { Alert, Platform, ScrollView, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { homeStyles as styles } from '../styles/homeStyles';
import { TxDay } from '../types/transaction';
import { Text } from './Text';

type DayDetailModalProps = {
  isVisible: boolean;
  dateFormatted: string;
  dateKey: string;  // ← Add this
  transaction: TxDay | null;
  onClose: () => void;
  onAddPress: () => void;
  onModalHide: () => void;
  onDeleteTransaction: (dateKey: string, itemIndex: number, item: TxDay['items'][number]) => void;  // ← Add this
  onEditTransaction: (
    dateKey: string,
    itemIndex: number,
    item: { type: 'income' | 'expense'; amount: number; note: string; category: string; recurringId?: string }
  ) => void;
};

export const DayDetailModal = ({
  isVisible,
  dateFormatted,
  dateKey,
  transaction,
  onClose,
  onAddPress,
  onModalHide,
  onDeleteTransaction,
  onEditTransaction,
}: DayDetailModalProps) => {

  const handleDelete = (index: number, category: string, item: TxDay['items'][number]) => {
    const message = `Are you sure you want to delete "${category}"?`;

    if (Platform.OS === 'web' && typeof globalThis.confirm === 'function') {
      const confirmed = globalThis.confirm(message);
      if (confirmed) {
        onDeleteTransaction(dateKey, index, item);
        onClose();
      }
      return;
    }

    Alert.alert('Delete Transaction', message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          onDeleteTransaction(dateKey, index, item);
          onClose();
        },
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
      onModalHide={onModalHide}
    >
      <View style={styles.modalContent}>
        <View style={styles.modalHandle} />
        <Text style={styles.modalDate}>{dateFormatted}</Text>

        {transaction && transaction.items ? (
          <ScrollView style={styles.transactionsList}>
            {transaction.items.map((item, index) => (
              <View key={index} style={styles.transactionItem}>
                <View style={styles.transactionLeft}>
                  <Text style={styles.transactionCategory}>{item.category}</Text>
                  <Text style={styles.transactionNote}>{item.note}</Text>
                </View>
                <View style={styles.transactionRight}>
                  <Text
                    style={[
                      styles.transactionAmount,
                      item.type === 'income' ? styles.incomeAmount : styles.expenseAmount,
                    ]}
                  >
                    {item.type === 'income' ? '+' : '-'}${item.amount}
                  </Text>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => onEditTransaction(dateKey, index, item)}
                  >
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(index, item.category, item)}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No transactions</Text>
          </View>
        )}

        <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
          <Text style={styles.addButtonText}>+ Add Transaction</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};
