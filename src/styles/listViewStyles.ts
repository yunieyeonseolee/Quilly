import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const listViewStyles = StyleSheet.create({
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  dateGroup: {
    flexDirection: 'row',
    minHeight: 60,
  },
  dateColumn: {
    width: 50,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray800,
  },
  timelineColumn: {
    width: 20,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray400,
    marginTop: 6,
  },
  line: {
    flex: 1,
    width: 1,
    backgroundColor: colors.gray300,
    marginVertical: 4,
  },
  transactionsColumn: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 16,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  transactionActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionNote: {
    fontSize: 14,
    color: colors.gray800,
    flex: 1,
  },
  transactionIncome: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.income,
  },
  transactionExpense: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.expense,
  },
  editButton: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    marginLeft: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editButtonText: {
    fontSize: 12,
    color: colors.gray700,
    fontWeight: '600',
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteButtonText: {
    fontSize: 12,
    color: colors.expense,
    fontWeight: '600',
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyListText: {
    fontSize: 14,
    color: colors.gray500,
  },
});
