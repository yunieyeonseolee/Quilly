import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from '../../../src/components/Text';
import { useSettings } from '../../../src/context/SettingsContext';
import { settingsStyles as styles } from '../../../src/styles/settingsStyles';

const currencies = [
  { value: 'CAD', label: '$ CAD' },
  { value: 'KRW', label: '₩ KRW' },
] as const;

export default function CurrencyScreen() {
  const { settings, updateSettings } = useSettings();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.sectionTitle}>Currency</Text>
      <View style={styles.section}>
        {currencies.map((cur, index) => {
          const selected = settings.currency === cur.value;
          const isLast = index === currencies.length - 1;
          return (
            <TouchableOpacity
              key={cur.value}
              style={[styles.row, isLast && { borderBottomWidth: 0 }]}
              onPress={() => updateSettings({ currency: cur.value })}
            >
              <Text style={styles.rowText}>{cur.label}</Text>
              {selected && <Text style={styles.arrow}>✓</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}
