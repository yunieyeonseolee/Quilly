import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [language, setLanguage] = useState('system');
  const [currency, setCurrency] = useState('USD');

  return (
    <ScrollView style={styles.container}>
      
      {/* Preferences Section */}
      <Text style={styles.sectionTitle}>Preferences</Text>
      <View style={styles.section}>
        
        {/* Notifications */}
        <View style={styles.row}>
          <Text style={styles.rowText}>Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
        </View>

        {/* Language */}
        <View style={styles.rowColumn}>
          <Text style={styles.rowText}>Language</Text>
          <View style={styles.options}>
            <TouchableOpacity
              style={[styles.optionButton, language === 'system' && styles.optionSelected]}
              onPress={() => setLanguage('system')}
            >
              <Text style={[styles.optionText, language === 'system' && styles.optionTextSelected]}>System</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, language === 'en' && styles.optionSelected]}
              onPress={() => setLanguage('en')}
            >
              <Text style={[styles.optionText, language === 'en' && styles.optionTextSelected]}>English</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, language === 'ko' && styles.optionSelected]}
              onPress={() => setLanguage('ko')}
            >
              <Text style={[styles.optionText, language === 'ko' && styles.optionTextSelected]}>한국어</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Currency */}
        <View style={styles.rowColumn}>
          <Text style={styles.rowText}>Currency</Text>
          <View style={styles.options}>
            <TouchableOpacity
              style={[styles.optionButton, currency === 'USD' && styles.optionSelected]}
              onPress={() => setCurrency('USD')}
            >
              <Text style={[styles.optionText, currency === 'USD' && styles.optionTextSelected]}>$ USD</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, currency === 'KRW' && styles.optionSelected]}
              onPress={() => setCurrency('KRW')}
            >
              <Text style={[styles.optionText, currency === 'KRW' && styles.optionTextSelected]}>₩ KRW</Text>
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
        <View style={styles.row}>
          <Text style={styles.rowText}>Version</Text>
          <Text style={styles.rowSubtext}>1.0.0</Text>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginTop: 20,
    textTransform: 'uppercase',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  rowColumn: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  rowText: {
    fontSize: 16,
  },
  rowSubtext: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    maxWidth: 250,
  },
  arrow: {
    fontSize: 20,
    color: '#ccc',
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
    backgroundColor: '#eee',
  },
  optionSelected: {
    backgroundColor: '#000',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  optionTextSelected: {
    color: '#fff',
  },
});