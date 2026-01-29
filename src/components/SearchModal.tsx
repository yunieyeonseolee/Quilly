import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import { SearchResult } from '../types/transaction';
import { monthNames } from '../utils/dateUtils';
import { colors } from '../styles/colors';
import { homeStyles as styles } from '../styles/homeStyles';
import { Text } from './Text';
import { TextInput } from './TextInput';

type SearchModalProps = {
  isVisible: boolean;
  query: string;
  results: SearchResult[];
  history: string[];
  onQueryChange: (value: string) => void;
  onCommitQuery: (value: string) => void;
  onSelectHistory: (value: string) => void;
  onClearHistory: () => void;
  onClose: () => void;
  onSelectDate: (dateKey: string) => void;
};

const formatDate = (dateKey: string) => {
  const [year, month, day] = dateKey.split('-').map(Number);
  return `${monthNames[month - 1]} ${day}, ${year}`;
};

export const SearchModal = ({
  isVisible,
  query,
  results,
  history,
  onQueryChange,
  onCommitQuery,
  onSelectHistory,
  onClearHistory,
  onClose,
  onSelectDate,
}: SearchModalProps) => {
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={['down']}
      style={local.fullModal}
      backdropTransitionOutTiming={0}
      avoidKeyboard
      propagateSwipe
    >
      <SafeAreaView style={local.safeArea}>
        <KeyboardAvoidingView
          style={local.keyboardWrap}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[local.container, local.sheetContent]}>
            <View style={styles.modalHandle} />
            <View style={local.topBar}>
              <Text style={local.title}>Search</Text>
              <TouchableOpacity onPress={onClose} style={local.closeBtn}>
                <Text style={local.closeText}>×</Text>
              </TouchableOpacity>
            </View>

          <TextInput
            style={local.searchInput}
            placeholder="Search transactions..."
            value={query}
            onChangeText={onQueryChange}
            returnKeyType="search"
            onSubmitEditing={() => onCommitQuery(query)}
            autoFocus
          />

          <View style={local.resultsArea}>
            {query.trim().length === 0 ? (
              <View style={local.historySection}>
                <View style={local.historyHeader}>
                  <Text style={local.historyTitle}>Recent searches</Text>
                  {history.length > 0 && (
                    <TouchableOpacity onPress={onClearHistory}>
                      <Text style={local.clearHistoryText}>Clear</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {history.length === 0 ? (
                  <View style={local.emptyState}>
                    <Text style={local.emptyText}>No recent searches</Text>
                  </View>
                ) : (
                  <ScrollView style={local.list} contentContainerStyle={local.listContent}>
                    {history.map((item) => (
                      <TouchableOpacity
                        key={item}
                        style={local.historyRow}
                        onPress={() => onSelectHistory(item)}
                      >
                        <Text style={local.historyText}>{item}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            ) : results.length === 0 ? (
              <View style={local.emptyState}>
                <Text style={local.emptyText}>No results</Text>
              </View>
            ) : (
                <ScrollView style={local.list} contentContainerStyle={local.listContent}>
                  {results.map((result, index) => (
                    <TouchableOpacity
                      key={`${result.dateKey}-${index}`}
                      style={local.row}
                      onPress={() => onSelectDate(result.dateKey)}
                    >
                      <View style={local.rowLeft}>
                        <Text style={local.category}>{result.item.category}</Text>
                        <Text style={local.note}>{result.item.note}</Text>
                        <Text style={local.date}>{formatDate(result.dateKey)}</Text>
                      </View>
                      <Text
                        style={[
                          local.amount,
                          result.item.type === 'income' ? local.income : local.expense,
                        ]}
                      >
                        {result.item.type === 'income' ? '+' : '-'}${result.item.amount}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const local = StyleSheet.create({
  fullModal: {
    margin: 0,
    justifyContent: 'flex-start',
  },
  safeArea: {
    flex: 1,
  },
  keyboardWrap: {
    flex: 1,
  },
  sheetContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  closeText: {
    fontSize: 18,
    fontWeight: '700',
  },
  searchInput: {
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.gray100,
    fontSize: 14,
  },
  resultsArea: {
    flex: 1,
    marginTop: 12,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  historySection: {
    flex: 1,
    marginTop: 4,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  historyTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.gray600,
    textTransform: 'uppercase',
  },
  clearHistoryText: {
    fontSize: 12,
    color: colors.gray600,
    fontWeight: '600',
  },
  historyRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: colors.gray100,
    marginBottom: 8,
  },
  historyText: {
    fontSize: 14,
    color: colors.gray800,
  },
  row: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
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
  date: {
    fontSize: 12,
    color: colors.gray500,
    marginTop: 6,
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
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray500,
  },
  container: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});
