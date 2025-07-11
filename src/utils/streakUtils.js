import { formatDate, addDays } from './dateUtils.js';

export const calculateStreak = (completions, habitId) => {
  if (!completions || !habitId) return 0;
  
  const habitCompletions = completions
    .filter(completion => completion.habitId === habitId)
    .map(completion => completion.date)
    .sort((a, b) => new Date(b) - new Date(a));
  
  if (habitCompletions.length === 0) return 0;
  
  const today = formatDate(new Date());
  const yesterday = formatDate(addDays(new Date(), -1));
  
  let streak = 0;
  let currentDate = new Date();
  
  if (habitCompletions.includes(today)) {
    streak = 1;
    currentDate = addDays(currentDate, -1);
  } else if (habitCompletions.includes(yesterday)) {
    streak = 1;
    currentDate = addDays(currentDate, -2);
  } else {
    return 0;
  }
  
  while (true) {
    const dateStr = formatDate(currentDate);
    if (habitCompletions.includes(dateStr)) {
      streak++;
      currentDate = addDays(currentDate, -1);
    } else {
      break;
    }
  }
  
  return streak;
};

export const calculateLongestStreak = (completions, habitId) => {
  if (!completions || !habitId) return 0;
  
  const habitCompletions = completions
    .filter(completion => completion.habitId === habitId)
    .map(completion => completion.date)
    .sort((a, b) => new Date(a) - new Date(b));
  
  if (habitCompletions.length === 0) return 0;
  
  let longestStreak = 1;
  let currentStreak = 1;
  
  for (let i = 1; i < habitCompletions.length; i++) {
    const prevDate = new Date(habitCompletions[i - 1]);
    const currDate = new Date(habitCompletions[i]);
    const daysDiff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  
  return longestStreak;
};

export const getCompletionRate = (completions, habitId, days = 30) => {
  if (!completions || !habitId) return 0;
  
  const endDate = new Date();
  const startDate = addDays(endDate, -days);
  
  const habitCompletions = completions
    .filter(completion => 
      completion.habitId === habitId &&
      new Date(completion.date) >= startDate &&
      new Date(completion.date) <= endDate
    );
  
  return Math.round((habitCompletions.length / days) * 100);
};

export const getWeeklyCompletions = (completions, habitId, weekOffset = 0) => {
  if (!completions || !habitId) return [];
  
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + (weekOffset * 7));
  
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    weekDates.push(formatDate(date));
  }
  
  const habitCompletions = completions
    .filter(completion => completion.habitId === habitId)
    .map(completion => completion.date);
  
  return weekDates.map(date => ({
    date,
    completed: habitCompletions.includes(date)
  }));
};

export const isCompletedToday = (completions, habitId) => {
  if (!completions || !habitId) return false;
  
  const today = formatDate(new Date());
  return completions.some(completion => 
    completion.habitId === habitId && completion.date === today
  );
};

export const getTotalCompletions = (completions, habitId) => {
  if (!completions || !habitId) return 0;
  
  return completions.filter(completion => completion.habitId === habitId).length;
};