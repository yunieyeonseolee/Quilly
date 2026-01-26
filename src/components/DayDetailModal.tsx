import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { homeStyles as styles } from '../styles/homeStyles';
import { TxDay } from '../types/transaction';

type DayDetailModalProps = {
  isVisible: boolean;
  dateFormatted: string;
  transaction: TxDay | null;
  onClose: () => void;
  onAddPress: () => void;
  onModalHide: () => void;
};

export const DayDetailModal = ({
  isVisible,
  dateFormatted,
  transaction,
  onClose,
  onAddPress,
  onModalHide,
}: DayDetailModalProps) => {
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
                <Text
                  style={[
                    styles.transactionAmount,
                    item.type === 'income' ? styles.incomeAmount : styles.expenseAmount,
                  ]}
                >
                  {item.type === 'income' ? '+' : '-'}${item.amount}
                </Text>
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