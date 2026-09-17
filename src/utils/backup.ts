import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

const BACKUP_KEYS = [
  'quilly_transactions',
  'quilly_recurring_transactions',
  'quilly_recurring_skips',
  'quilly_settings',
  'quilly_budget',
  'quilly_goals',
  'quilly_payment_reminders',
  'quilly_notification_settings',
  'quilly_search_history',
];

export const exportData = async (): Promise<boolean> => {
  try {
    const backup: Record<string, any> = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      data: {},
    };

    // Gather all data
    for (const key of BACKUP_KEYS) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        backup.data[key] = JSON.parse(value);
      }
    }

    const jsonString = JSON.stringify(backup, null, 2);
    const fileName = `quilly_backup_${new Date().toISOString().split('T')[0]}.json`;

    if (Platform.OS === 'web') {
      // Web: Download file
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      return true;
    } else {
      // Mobile: Save and share file
    const directory = (FileSystem as any).documentDirectory as string | null;
      if (!directory) {
        Alert.alert('Error', 'Cannot access file system');
        return false;
      }
      
      const filePath = `${directory}${fileName}`;
      await FileSystem.writeAsStringAsync(filePath, jsonString);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'application/json',
          dialogTitle: 'Export Quilly Backup',
        });
        return true;
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
        return false;
      }
    }
  } catch (error) {
    console.error('Export error:', error);
    Alert.alert('Error', 'Failed to export data');
    return false;
  }
};

export const importData = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') {
      // Web: Use file input
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e: any) => {
          const file = e.target.files[0];
          if (!file) {
            resolve(false);
            return;
          }

          const reader = new FileReader();
          reader.onload = async (event) => {
            try {
              const jsonString = event.target?.result as string;
              const result = await processImport(jsonString);
              resolve(result);
            } catch {
              Alert.alert('Error', 'Invalid backup file');
              resolve(false);
            }
          };
          reader.readAsText(file);
        };
        input.click();
      });
    } else {
      // Mobile: Use document picker
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) {
        return false;
      }

      const fileUri = result.assets[0].uri;
      const jsonString = await FileSystem.readAsStringAsync(fileUri);
      return await processImport(jsonString);
    }
  } catch (error) {
    console.error('Import error:', error);
    Alert.alert('Error', 'Failed to import data');
    return false;
  }
};

const processImport = async (jsonString: string): Promise<boolean> => {
  try {
    const backup = JSON.parse(jsonString);

    // Validate backup format
    if (!backup.version || !backup.data) {
      Alert.alert('Error', 'Invalid backup file format');
      return false;
    }

    // Import each key
    for (const key of BACKUP_KEYS) {
      if (backup.data[key]) {
        await AsyncStorage.setItem(key, JSON.stringify(backup.data[key]));
      }
    }

    Alert.alert('Success', 'Data imported successfully! Please restart the app.');
    return true;
  } catch (error) {
    console.error('Process import error:', error);
    Alert.alert('Error', 'Failed to process backup file');
    return false;
  }
};

export const clearAllData = async (): Promise<boolean> => {
  try {
    for (const key of BACKUP_KEYS) {
      await AsyncStorage.removeItem(key);
    }
    Alert.alert('Success', 'All data cleared. Please restart the app.');
    return true;
  } catch (error) {
    console.error('Clear data error:', error);
    Alert.alert('Error', 'Failed to clear data');
    return false;
  }
};
