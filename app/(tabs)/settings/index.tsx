import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Switch, TouchableOpacity, View, useColorScheme } from 'react-native';
import { Text } from '../../../src/components/Text';
import { useSettings } from '../../../src/context/SettingsContext';
import { useNotifications } from '../../../src/hooks/useNotifications';
import { colors } from '../../../src/styles/colors';
import { settingsStyles as styles } from '../../../src/styles/settingsStyles';
import { clearAllData, exportData, importData } from '../../../src/utils/backup';

export default function SettingsScreen() {
  const isDark = useColorScheme() === 'dark';
  const { settings, isLoading } = useSettings();
  const { 
    settings: notifSettings, 
    scheduleDailyReminder, 
    cancelDailyReminder,
  } = useNotifications();

  const [showTimePicker, setShowTimePicker] = useState(false);
  const initialPeriod = notifSettings.dailyReminderTime.hour >= 12 ? 'PM' : 'AM';
  const initialHour12 = notifSettings.dailyReminderTime.hour % 12 || 12;
  const [tempHour12, setTempHour12] = useState(initialHour12);
  const [tempMinuteIndex, setTempMinuteIndex] = useState(
    60 + notifSettings.dailyReminderTime.minute
  );
  const [tempPeriod, setTempPeriod] = useState<'AM' | 'PM'>(initialPeriod);

  const handleDailyReminderToggle = async (value: boolean) => {
    if (value) {
      await scheduleDailyReminder(
        notifSettings.dailyReminderTime.hour,
        notifSettings.dailyReminderTime.minute
      );
      Alert.alert('Daily Reminder Set', `You'll be reminded at ${formatTime(notifSettings.dailyReminderTime.hour, notifSettings.dailyReminderTime.minute)} every day.`);
    } else {
      await cancelDailyReminder();
    }
  };

  const handleTimeConfirm = async () => {
    setShowTimePicker(false);
    const minuteValue = tempMinuteIndex % 60;
    const hour24 =
      tempPeriod === 'AM' ? tempHour12 % 12 : (tempHour12 % 12) + 12;
    if (notifSettings.dailyReminderEnabled) {
      await scheduleDailyReminder(hour24, minuteValue);
      Alert.alert('Reminder Updated', `You'll be reminded at ${formatTime(hour24, minuteValue)} every day.`);
    }
  };

  const handleExportData = async () => {
    const success = await exportData();
    if (success) {
      Alert.alert('Export Complete', 'Your Quilly backup is ready.');
    }
  };

  const handleImportData = async () => {
    await importData();
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will remove transactions, budgets, reminders, goals, and settings from this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            clearAllData();
          },
        },
      ]
    );
  };

  const formatTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  };

  const languageLabel =
    settings.language === 'system'
      ? 'System'
      : settings.language === 'en'
        ? 'English'
        : '한국어';

  const currencyLabel = settings.currency === 'CAD' ? '$ CAD' : '₩ KRW';

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      
      {/* Notifications Section */}
      <Text style={styles.sectionTitle}>Notifications</Text>
      <View style={styles.section}>
        
        {/* Daily Reminder Toggle */}
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowText}>Daily Reminder</Text>
            <Text style={styles.rowSubtext}>Remind me to record spending</Text>
          </View>
          <Switch
            value={notifSettings.dailyReminderEnabled}
            onValueChange={handleDailyReminderToggle}
          />
        </View>

        {/* Reminder Time */}
        {notifSettings.dailyReminderEnabled && (
          <TouchableOpacity 
            style={styles.row} 
            onPress={() => {
              const hour = notifSettings.dailyReminderTime.hour;
              setTempHour12(hour % 12 || 12);
              setTempPeriod(hour >= 12 ? 'PM' : 'AM');
              setTempMinuteIndex(60 + notifSettings.dailyReminderTime.minute);
              setShowTimePicker(true);
            }}
          >
            <Text style={styles.rowText}>Reminder Time</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.rowSubtext}>
                {formatTime(notifSettings.dailyReminderTime.hour, notifSettings.dailyReminderTime.minute)}
              </Text>
              <Text style={styles.arrow}>›</Text>
            </View>
          </TouchableOpacity>
        )}

      </View>

      {/* Time Picker Modal */}
      {showTimePicker && (
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { marginTop: 0 },
              { color: colors.gray800 },
            ]}
          >
            Select Time
          </Text>
          <View
            style={[
              { flexDirection: 'row', justifyContent: 'center' },
              isDark && {
                backgroundColor: colors.gray800,
                borderRadius: 10,
                paddingVertical: 4,
              },
            ]}
          >
            <Picker
              selectedValue={tempHour12}
              onValueChange={(val) => setTempHour12(val)}
              style={[
                { flex: 1, height: 130 },
                isDark && { color: colors.white, backgroundColor: colors.gray800 },
              ]}
              itemStyle={isDark ? { color: colors.white } : undefined}
            >
              {Array.from({ length: 12 }, (_, i) => {
                const hour = i + 1;
                return (
                <Picker.Item 
                  key={hour} 
                  label={`${hour}`} 
                  value={hour} 
                />
                );
              })}
            </Picker>
            <Picker
              selectedValue={tempMinuteIndex}
              onValueChange={(val) => setTempMinuteIndex(val)}
              style={[
                { flex: 1, height: 130 },
                isDark && { color: colors.white, backgroundColor: colors.gray800 },
              ]}
              itemStyle={isDark ? { color: colors.white } : undefined}
            >
              {Array.from({ length: 180 }, (_, i) => {
                const m = i % 60;
                return (
                  <Picker.Item 
                    key={i} 
                    label={m.toString().padStart(2, '0')} 
                    value={i} 
                  />
                );
              })}
            </Picker>
            <Picker
              selectedValue={tempPeriod}
              onValueChange={(val) => setTempPeriod(val)}
              style={[
                { flex: 0.8, height: 130 },
                isDark && { color: colors.white, backgroundColor: colors.gray800 },
              ]}
              itemStyle={isDark ? { color: colors.white } : undefined}
            >
              {(['AM', 'PM'] as const).map((p) => (
                <Picker.Item key={p} label={p} value={p} />
              ))}
            </Picker>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 }}>
            <TouchableOpacity onPress={() => setShowTimePicker(false)}>
              <Text style={{ color: colors.gray700, fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleTimeConfirm}>
              <Text
                style={{
                  color: colors.black,
                  fontSize: 16,
                  fontWeight: '600',
                }}
              >
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Preferences Section */}
      <Text style={styles.sectionTitle}>Preferences</Text>
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.row}
          onPress={() => router.push('/settings/language')}
        >
          <Text style={styles.rowText}>Language</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.rowSubtext}>{languageLabel}</Text>
            <Text style={styles.arrow}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.row, { borderBottomWidth: 0 }]}
          onPress={() => router.push('/settings/currency')}
        >
          <Text style={styles.rowText}>Currency</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.rowSubtext}>{currencyLabel}</Text>
            <Text style={styles.arrow}>›</Text>
          </View>
        </TouchableOpacity>

      </View>

      {/* Data Section */}
      <Text style={styles.sectionTitle}>Data</Text>
      <View style={styles.section}>
        <TouchableOpacity style={styles.row} onPress={handleExportData}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowText}>Export Backup</Text>
            <Text style={styles.rowSubtext}>Save transactions, budgets, reminders, and goals</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={handleImportData}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowText}>Import Backup</Text>
            <Text style={styles.rowSubtext}>Restore data from a Quilly backup file</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.row, { borderBottomWidth: 0 }]} onPress={handleClearData}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowText, { color: colors.expense }]}>Clear All Data</Text>
            <Text style={styles.rowSubtext}>Reset local data on this device</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* About Section */}
      <Text style={styles.sectionTitle}>About</Text>
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.rowText}>Storage</Text>
          <Text style={styles.rowSubtext}>Local only</Text>
        </View>
        <View style={[styles.row, { borderBottomWidth: 0 }]}>
          <Text style={styles.rowText}>Version</Text>
          <Text style={styles.rowSubtext}>1.0.0</Text>
        </View>
      </View>

    </ScrollView>
  );
}
