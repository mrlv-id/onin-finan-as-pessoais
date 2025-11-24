export interface FixedAccountWithDays {
  id: string;
  name: string;
  amount: number;
  category: string;
  due_day: number;
  is_active: boolean;
  daysUntilDue: number;
}

export const calculateDaysUntilDue = (dueDay: number): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Create date for this month's due day
  let dueDate = new Date(currentYear, currentMonth, dueDay);
  dueDate.setHours(0, 0, 0, 0);

  // If due day has passed this month, consider next month
  if (currentDay > dueDay) {
    dueDate = new Date(currentYear, currentMonth + 1, dueDay);
    dueDate.setHours(0, 0, 0, 0);
  }

  // Calculate difference in days
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

export const sortAccountsByDueDate = <T extends { due_day: number }>(
  accounts: T[]
): (T & { daysUntilDue: number })[] => {
  return accounts
    .map(account => ({
      ...account,
      daysUntilDue: calculateDaysUntilDue(account.due_day),
    }))
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue);
};

export const getDueBadgeText = (daysUntilDue: number): string | null => {
  if (daysUntilDue === 0) return "Vence hoje";
  if (daysUntilDue === 1) return "Vence amanhã";
  if (daysUntilDue === 2) return "Vence em 2 dias";
  if (daysUntilDue === 3) return "Vence em 3 dias";
  return null;
};
