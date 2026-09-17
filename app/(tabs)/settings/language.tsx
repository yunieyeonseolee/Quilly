import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from '../../../src/components/Text';
import { useSettings } from '../../../src/context/SettingsContext';
import { settingsStyles as styles } from '../../../src/styles/settingsStyles';

const languages = [
  { value: 'system', label: 'System' },
  { value: 'en', label: 'English' },
  { value: 'ko', label: '한국어' },
] as const;

export default function LanguageScreen() {
  const { settings, updateSettings } = useSettings();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.sectionTitle}>Language</Text>
      <View style={styles.section}>
        {languages.map((lang, index) => {
          const selected = settings.language === lang.value;
          const isLast = index === languages.length - 1;
          return (
            <TouchableOpacity
              key={lang.value}
              style={[styles.row, isLast && { borderBottomWidth: 0 }]}
              onPress={() => updateSettings({ language: lang.value })}
            >
              <Text style={styles.rowText}>{lang.label}</Text>
              {selected && <Text style={styles.arrow}>✓</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}
