import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

const NOTIFICATION_SETTINGS_KEY = 'quilly_notification_settings';

type NotificationSettings = {
  dailyReminderEnabled: boolean;
  dailyReminderTime: { hour: number; minute: number };
  paymentRemindersEnabled: boolean;
};

const defaultSettings: NotificationSettings = {
  dailyReminderEnabled: false,
  dailyReminderTime: { hour: 20, minute: 0 }, // 8:00 PM
  paymentRemindersEnabled: true,
};

export const useNotifications = () => {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);
  const notificationsConfigured = useRef(false);

  // Load settings from AsyncStorage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
        if (data) {
          setSettings(JSON.parse(data));
        }
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
      setIsLoading(false);
    };
    loadSettings();
  }, []);

  // Save settings when they change
  useEffect(() => {
    if (!isLoading) {
      const saveSettings = async () => {
        try {
          await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
        } catch (error) {
          console.error('Error saving notification settings:', error);
        }
      };
      saveSettings();
    }
  }, [settings, isLoading]);

  useEffect(() => {
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const ensureNotificationsReady = async () => {
    if (Platform.OS === 'web') return false;

    const Notifications = await import('expo-notifications');

    if (!notificationsConfigured.current) {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      // Listener for when notification is received while app is open
      notificationListener.current = Notifications.addNotificationReceivedListener(() => {});

      // Listener for when user taps on notification
      responseListener.current = Notifications.addNotificationResponseReceivedListener(() => {});
      notificationsConfigured.current = true;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    if (existingStatus === 'granted') return true;

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  };

  // Schedule daily reminder
  const scheduleDailyReminder = async (hour: number, minute: number) => {
    const isReady = await ensureNotificationsReady();
    if (!isReady) return;

    const Notifications = await import('expo-notifications');

    // Cancel existing daily reminders
    await cancelDailyReminder();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Record your spending 📝',
        body: "Don't forget to add today's transactions!",
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });

    setSettings(prev => ({
      ...prev,
      dailyReminderEnabled: true,
      dailyReminderTime: { hour, minute },
    }));
  };

  // Cancel daily reminder
  const cancelDailyReminder = async () => {
    if (Platform.OS === 'web') return;

    const Notifications = await import('expo-notifications');

    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduled) {
      if (notification.content.title === 'Record your spending 📝') {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
    setSettings(prev => ({ ...prev, dailyReminderEnabled: false }));
  };

  // Schedule payment reminder
  const schedulePaymentReminder = async (
    name: string,
    amount: number,
    dueDate: Date,
    daysBefore: number = 1
  ) => {
    const isReady = await ensureNotificationsReady();
    if (!isReady) return null;

    const Notifications = await import('expo-notifications');

    const reminderDate = new Date(dueDate);
    reminderDate.setDate(reminderDate.getDate() - daysBefore);
    reminderDate.setHours(10, 0, 0, 0); // 10:00 AM

    // Don't schedule if reminder date is in the past
    if (reminderDate <= new Date()) {
      return null;
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Payment Due Soon 💳',
        body: `${name} ($${amount.toFixed(2)}) is due ${daysBefore === 1 ? 'tomorrow' : `in ${daysBefore} days`}!`,
        sound: true,
        data: { type: 'payment_reminder', name },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminderDate,
      },
    });

    return id;
  };

  // Cancel a specific notification
  const cancelNotification = async (notificationId: string) => {
    if (Platform.OS === 'web') return;

    const Notifications = await import('expo-notifications');
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  };

  // Send a test notification
  const sendTestNotification = async () => {
    if (Platform.OS === 'web') {
      alert('Notifications only work on mobile devices');
      return;
    }

    const isReady = await ensureNotificationsReady();
    if (!isReady) return;

    const Notifications = await import('expo-notifications');

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Test Notification 🎉',
        body: 'Notifications are working!',
        sound: true,
      },
      trigger: null, // Send immediately
    });
  };

  // Update settings
  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return {
    settings,
    isLoading,
    scheduleDailyReminder,
    cancelDailyReminder,
    schedulePaymentReminder,
    cancelNotification,
    sendTestNotification,
    updateSettings,
  };
};
