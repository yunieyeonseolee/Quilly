export type PaymentReminder = {
  id: string;
  name: string;
  amount: number;
  dueDay: number;           // Day of month (1-31)
  frequency: 'weekly' | 'monthly' | 'yearly';
  category: string;
  remindDaysBefore: number; // How many days before to remind
  enabled: boolean;
  notificationId?: string;  // To cancel notification later
};