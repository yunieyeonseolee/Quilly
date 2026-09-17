export type Goal = {
  id: string;
  title: string;
  emoji: string;
  targetAmount: number;
  savedAmount: number;
  deadline?: Date | null;
  category: 'travel' | 'savings' | 'purchase' | 'other';
  status: 'active' | 'finished';
  createdAt: Date;
  notes?: string;
  backgroundImage?: string;  // ← Add this line
};