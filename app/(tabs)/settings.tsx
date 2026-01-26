import { ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSettings } from '../../src/hooks/useSettings';
import { settingsStyles as styles } from '../../src/styles/settingsStyles';

export default function SettingsScreen() {
  const { settings, isLoading, updateSettings } = useSettings();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      
      {/* Preferences Section */}
      <Text style={styles.sectionTitle}>Preferences</Text>
      <View style={styles.section}>
        
        {/* Notifications */}
        <View style={styles.row}>
          <Text style={styles.rowText}>Notifications</Text>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={(value) => updateSettings({ notificationsEnabled: value })}
          />
        </View>

        {/* Language */}
        <View style={styles.rowColumn}>
          <Text style={styles.rowText}>Language</Text>
          <View style={styles.options}>
            <TouchableOpacity
              style={[styles.optionButton, settings.language === 'system' && styles.optionSelected]}
              onPress={() => updateSettings({ language: 'system' })}
            >
              <Text style={[styles.optionText, settings.language === 'system' && styles.optionTextSelected]}>System</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, settings.language === 'en' && styles.optionSelected]}
              onPress={() => updateSettings({ language: 'en' })}
            >
              <Text style={[styles.optionText, settings.language === 'en' && styles.optionTextSelected]}>English</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, settings.language === 'ko' && styles.optionSelected]}
              onPress={() => updateSettings({ language: 'ko' })}
            >
              <Text style={[styles.optionText, settings.language === 'ko' && styles.optionTextSelected]}>한국어</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Currency */}
        <View style={styles.rowColumn}>
          <Text style={styles.rowText}>Currency</Text>
          <View style={styles.options}>
            <TouchableOpacity
              style={[styles.optionButton, settings.currency === 'USD' && styles.optionSelected]}
              onPress={() => updateSettings({ currency: 'USD' })}
            >
              <Text style={[styles.optionText, settings.currency === 'USD' && styles.optionTextSelected]}>$ USD</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, settings.currency === 'KRW' && styles.optionSelected]}
              onPress={() => updateSettings({ currency: 'KRW' })}
            >
              <Text style={[styles.optionText, settings.currency === 'KRW' && styles.optionTextSelected]}>₩ KRW</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>

      {/* Data Section */}
      <Text style={styles.sectionTitle}>Data</Text>
      <View style={styles.section}>
        <View style={styles.row}>
          <View>
            <Text style={styles.rowText}>iCloud Backup</Text>
            <Text style={styles.rowSubtext}>Your data is backed up automatically when iCloud Backup is enabled on your device.</Text>
          </View>
        </View>
      </View>

      {/* About Section */}
      <Text style={styles.sectionTitle}>About</Text>
      <View style={styles.section}>
        <TouchableOpacity style={styles.row}>
          <Text style={styles.rowText}>Terms of Service</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}>
          <Text style={styles.rowText}>Privacy Policy</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <View style={[styles.row, { borderBottomWidth: 0 }]}>
          <Text style={styles.rowText}>Version</Text>
          <Text style={styles.rowSubtext}>1.0.0</Text>
        </View>
      </View>

    </ScrollView>
  );
}