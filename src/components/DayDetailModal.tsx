import { Alert, ScrollView, TouchableOpacity, View } from 'react-native';
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
  onDeleteTransaction: (dateKey: string, itemIndex: number) => void;  // ← Add this
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
}: DayDetailModalProps) => {

  const handleDelete = (index: number, category: string) => {
    Alert.alert(
      'Delete Transaction',
      `Are you sure you want to delete "${category}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDeleteTransaction(dateKey, index),
        },
      ]
    );
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
              <TouchableOpacity 
                key={index} 
                style={styles.transactionItem}
                onLongPress={() => handleDelete(index, item.category)}
              >
                <View style={styles.transactionLeft}>
                  <Text style={styles.transactionCategory}>{item.category}</Text>
                  <Text style={styles.transactionNote}>{item.note}</Text>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    item.type === 'income' ? styles.incomeAmount : styles.expenseAmount,
                  ]}
                >
                  {item.type === 'income' ? '+' : '-'}${item.amount}
                </Text>
              </TouchableOpacity>
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