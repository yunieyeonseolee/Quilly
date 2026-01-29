import { Alert, Platform, ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from './Text';
import { listViewStyles } from '../styles/listViewStyles';
import { TxItem } from '../types/transaction';

type DateGroup = {
  dateKey: string;
  day: number;
  items: TxItem[];
};

type ListViewProps = {
  currentDate: Date;
  monthTransactions: DateGroup[];
  onDatePress: (day: number) => void;
  onEditTransaction: (dateKey: string, itemIndex: number, item: TxItem) => void;
  onDeleteTransaction: (dateKey: string, itemIndex: number, item: TxItem) => void;
};

export const ListView = ({
  currentDate,
  monthTransactions,
  onDatePress,
  onEditTransaction,
  onDeleteTransaction,
}: ListViewProps) => {
  const confirmDelete = (
    dateKey: string,
    itemIndex: number,
    category: string,
    item: TxItem
  ) => {
    const message = `Are you sure you want to delete "${category}"?`;

    if (Platform.OS === 'web' && typeof globalThis.confirm === 'function') {
      if (globalThis.confirm(message)) {
        onDeleteTransaction(dateKey, itemIndex, item);
      }
      return;
    }

    Alert.alert('Delete Transaction', message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => onDeleteTransaction(dateKey, itemIndex, item),
      },
    ]);
  };

  return (
    <ScrollView style={listViewStyles.listContainer}>
      {monthTransactions.length > 0 ? (
        monthTransactions.map((dateGroup, groupIndex) => (
          <View key={dateGroup.dateKey} style={listViewStyles.dateGroup}>
            <TouchableOpacity
              style={listViewStyles.dateColumn}
              onPress={() => onDatePress(dateGroup.day)}
            >
              <Text style={listViewStyles.dateText}>
                {currentDate.getMonth() + 1}/{dateGroup.day}
              </Text>
            </TouchableOpacity>

            <View style={listViewStyles.timelineColumn}>
              <View style={listViewStyles.dot} />
              {groupIndex < monthTransactions.length - 1 && (
                <View style={listViewStyles.line} />
              )}
            </View>

            <View style={listViewStyles.transactionsColumn}>
              {dateGroup.items.map((item, itemIndex) => (
                <View key={itemIndex} style={listViewStyles.transactionRow}>
                  <Text style={listViewStyles.transactionNote}>{item.note}</Text>
                  <View style={listViewStyles.transactionActions}>
                    <Text
                      style={
                        item.type === 'income'
                          ? listViewStyles.transactionIncome
                          : listViewStyles.transactionExpense
                      }
                    >
                      {item.type === 'income' ? '+' : '-'}${item.amount}
                    </Text>
                    <TouchableOpacity
                      style={listViewStyles.editButton}
                      onPress={() => onEditTransaction(dateGroup.dateKey, itemIndex, item)}
                    >
                      <Text style={listViewStyles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={listViewStyles.deleteButton}
                      onPress={() =>
                        confirmDelete(dateGroup.dateKey, itemIndex, item.category, item)
                      }
                    >
                      <Text style={listViewStyles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))
      ) : (
        <View style={listViewStyles.emptyList}>
          <Text style={listViewStyles.emptyListText}>No transactions this month</Text>
        </View>
      )}
    </ScrollView>
  );
};
