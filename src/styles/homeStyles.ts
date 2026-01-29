import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: 50,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 24,
    paddingHorizontal: 8,
    color: colors.gray800,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
  },
  topBarRight: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
  iconText: {
    fontSize: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 5,
  },
  summaryLeft: {
    gap: 2,
  },
  summaryRight: {
    alignItems: 'flex-end',
  },
  summaryText: {
    fontSize: 13,
  },
  summaryLabel: {
    color: colors.gray700,
  },
  incomeAmount: {
    color: colors.income,
  },
  expenseAmount: {
    color: colors.expense,
  },
  totalLabel: {
    fontSize: 12,
    color: colors.gray700,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  positive: {
    color: colors.income,
  },
  negative: {
    color: colors.expense,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  weekDayText: {
    width: 44,
    textAlign: 'center',
    fontSize: 12,
    color: colors.gray500,
    fontWeight: '500',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  dayCell: {
    width: '14.28%',
    height: 64,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 4,
  },
  dayContent: {
    alignItems: 'center',
    padding: 4,
    borderRadius: 8,
    minWidth: 40,
  },
  dayText: {
    fontSize: 15,
    color: colors.gray800,
  },
  todayCircle: {
    backgroundColor: colors.gray300,
  },
  todayText: {
    fontWeight: '600',
  },
  amountContainer: {
    marginTop: 2,
    alignItems: 'center',
  },
  dayIncome: {
    fontSize: 8,
    color: colors.income,
    fontWeight: '500',
  },
  dayExpense: {
    fontSize: 8,
    color: colors.expense,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
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
  fabText: {
    fontSize: 24,
    color: colors.white,
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
  backgroundColor: colors.white,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  paddingHorizontal: 20,
  paddingTop: 12,
  paddingBottom: 12,


  maxHeight: '82%',

  minHeight: 260,
},

  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.gray400,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalDate: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  transactionsList: {
    maxHeight: 200,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  transactionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionLeft: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray800,
  },
  transactionNote: {
    fontSize: 12,
    color: colors.gray600,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    marginLeft: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  editButton: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    marginLeft: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  deleteButtonText: {
    fontSize: 12,
    color: colors.expense,
    fontWeight: '600',
  },
  editButtonText: {
    fontSize: 12,
    color: colors.gray700,
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.gray500,
    fontSize: 14,
  },
  addButton: {
    backgroundColor: colors.black,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.gray200,
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: colors.black,
  },
  typeButtonText: {
    fontSize: 14,
    color: colors.gray700,
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: colors.white,
  },
  amountInput: {
    fontSize: 36,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    padding: 10,
  },
  noteInput: {
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    paddingVertical: 12,
    marginBottom: 20,
  },
  categoryPicker: {
    marginBottom: 20,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.gray200,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: colors.black,
  },
  categoryChipText: {
    fontSize: 14,
    color: colors.gray700,
  },
  categoryChipTextActive: {
    color: colors.white,
  },
});
