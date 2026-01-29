import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Modal from 'react-native-modal';
import { colors } from '../styles/colors';
import { Text } from './Text';

type Props = {
  isVisible: boolean;
  initialYear: number;
  initialMonth: number; // 1-12
  onClose: () => void;
  onConfirm: (year: number, month: number) => void; // month 1-12
};

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

export default function MonthYearModal({
  isVisible,
  initialYear,
  initialMonth,
  onClose,
  onConfirm,
}: Props) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);

  // keep it in sync when reopened
  React.useEffect(() => {
    if (isVisible) {
      setYear(initialYear);
      setMonth(initialMonth);
    }
  }, [isVisible, initialYear, initialMonth]);

  const rows = useMemo(() => {
    const out: number[][] = [];
    for (let i = 0; i < MONTHS.length; i += 4) out.push(MONTHS.slice(i, i + 4));
    return out; // 3 rows x 4 cols
  }, []);

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      backdropOpacity={0.4}
      animationIn="fadeIn"
      animationOut="fadeOut"
      useNativeDriver
    >
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            hitSlop={12}
            style={styles.arrowBtn}
            onPress={() => setYear((y) => y - 1)}
          >
            <Text style={styles.arrow}>‹</Text>
          </Pressable>

          <Text style={styles.title}>{year}</Text>

          <Pressable
            hitSlop={12}
            style={styles.arrowBtn}
            onPress={() => setYear((y) => y + 1)}
          >
            <Text style={styles.arrow}>›</Text>
          </Pressable>
        </View>

        {/* Month grid */}
        <View style={styles.grid}>
          {rows.map((r, rowIdx) => (
            <View key={rowIdx} style={styles.row}>
              {r.map((m) => {
                const selected = m === month;
                return (
                  <Pressable
                    key={m}
                    onPress={() => {
                      setMonth(m);
                      onConfirm(year, m);
                    }}
                    style={[styles.cell, selected && styles.cellSelected]}
                  >
                    <Text style={[styles.cellText, selected && styles.cellTextSelected]}>
                      {m}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray800,
  },
  arrowBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    fontSize: 26,
    color: colors.gray800,
    fontWeight: '400',
  },
  grid: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cell: {
    width: '22%',
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',

  },
  cellSelected: {
    backgroundColor: colors.gray300,
  },
  cellText: {
    fontSize: 16,
    color: colors.gray800,
  },
  cellTextSelected: {
    fontWeight: '700',
  },
});
