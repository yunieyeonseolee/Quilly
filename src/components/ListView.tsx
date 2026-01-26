import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
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
};

export const ListView = ({
  currentDate,
  monthTransactions,
  onDatePress,
}: ListViewProps) => {
  return (
    <ScrollView style={listViewStyles.listContainer}>
      {monthTransactions.length > 0 ? (
        monthTransactions.map((dateGroup, groupIndex) => (
          <TouchableOpacity
            key={dateGroup.dateKey}
            style={listViewStyles.dateGroup}
            onPress={() => onDatePress(dateGroup.day)}
          >
            <View style={listViewStyles.dateColumn}>
              <Text style={listViewStyles.dateText}>
                {currentDate.getMonth() + 1}/{dateGroup.day}
              </Text>
            </View>

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
                  <Text
                    style={
                      item.type === 'income'
                        ? listViewStyles.transactionIncome
                        : listViewStyles.transactionExpense
                    }
                  >
                    {item.type === 'income' ? '+' : '-'}${item.amount}
                  </Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={listViewStyles.emptyList}>
          <Text style={listViewStyles.emptyListText}>No transactions this month</Text>
        </View>
      )}
    </ScrollView>
  );
};