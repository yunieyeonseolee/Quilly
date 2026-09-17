import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const settingsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray100,
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 170,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray100,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray700,
    marginBottom: 8,
    marginTop: 20,
    textTransform: 'uppercase',
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  rowColumn: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  rowText: {
    fontSize: 16,
    color: colors.gray800,
  },
  rowSubtext: {
    fontSize: 12,
    color: colors.gray600,
    marginTop: 4,
    maxWidth: 250,
  },
  arrow: {
    fontSize: 20,
    color: colors.gray400,
  },
  options: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.gray200,
  },
  optionSelected: {
    backgroundColor: colors.black,
  },
  optionText: {
    fontSize: 14,
    color: colors.gray800,
  },
  optionTextSelected: {
    color: colors.white,
  },
});
