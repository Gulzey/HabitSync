import AsyncStorage from '@react-native-async-storage/async-storage';

const HABITS_STORAGE_KEY = 'habitsync:habits';
const USER_NAME_STORAGE_KEY = 'habitsync:userName';
const MAX_USER_NAME_LENGTH = 10;

function normalizeDate(dateString) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    throw new Error('dateString must use the YYYY-MM-DD format.');
  }

  const date = new Date(`${dateString}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new Error('dateString must use the YYYY-MM-DD format.');
  }

  return dateString;
}

function getPreviousDateString(dateString) {
  const date = new Date(`${normalizeDate(dateString)}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - 1);

  return date.toISOString().slice(0, 10);
}

function sortCompletedDates(completedDates = []) {
  return [...new Set(completedDates)].map(normalizeDate).sort();
}

function calculateStreaks(completedDates = [], anchorDateString) {
  const sortedDates = sortCompletedDates(completedDates);
  const completedSet = new Set(sortedDates);
  let longestStreak = 0;
  let streakRun = 0;
  let previousDate = null;

  sortedDates.forEach((dateString) => {
    if (previousDate && getPreviousDateString(dateString) === previousDate) {
      streakRun += 1;
    } else {
      streakRun = 1;
    }

    longestStreak = Math.max(longestStreak, streakRun);
    previousDate = dateString;
  });

  let currentStreak = 0;
  let cursor = normalizeDate(anchorDateString);

  while (completedSet.has(cursor)) {
    currentStreak += 1;
    cursor = getPreviousDateString(cursor);
  }

  return {
    completedDates: sortedDates,
    currentStreak,
    longestStreak,
  };
}

export async function loadHabits() {
  try {
    const storedHabits = await AsyncStorage.getItem(HABITS_STORAGE_KEY);

    if (!storedHabits) {
      return [];
    }

    const parsedHabits = JSON.parse(storedHabits);

    return Array.isArray(parsedHabits) ? parsedHabits : [];
  } catch (error) {
    console.warn('Failed to load habits from storage.', error);
    return [];
  }
}

export async function saveHabits(habits) {
  const nextHabits = Array.isArray(habits) ? habits : [];
  await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(nextHabits));

  return nextHabits;
}

export async function loadUserName() {
  try {
    const storedUserName = await AsyncStorage.getItem(USER_NAME_STORAGE_KEY);
    const normalizedUserName = storedUserName?.trim().slice(0, MAX_USER_NAME_LENGTH);

    return normalizedUserName || 'User';
  } catch (error) {
    console.warn('Failed to load user name from storage.', error);
    return 'User';
  }
}

export async function saveUserName(userName) {
  const nextUserName = userName.trim().slice(0, MAX_USER_NAME_LENGTH) || 'User';
  await AsyncStorage.setItem(USER_NAME_STORAGE_KEY, nextUserName);

  return nextUserName;
}

export async function toggleHabit(habitId, dateString) {
  const normalizedDate = normalizeDate(dateString);
  const habits = await loadHabits();

  const nextHabits = habits.map((habit) => {
    if (habit.id !== habitId) {
      return habit;
    }

    const completedDates = sortCompletedDates(habit.completedDates);
    const completedSet = new Set(completedDates);

    if (completedSet.has(normalizedDate)) {
      completedSet.delete(normalizedDate);
    } else {
      completedSet.add(normalizedDate);
    }

    const streaks = calculateStreaks([...completedSet], normalizedDate);

    return {
      ...habit,
      completedDates: streaks.completedDates,
      currentStreak: streaks.currentStreak,
      longestStreak: Math.max(streaks.longestStreak, 0),
    };
  });

  await saveHabits(nextHabits);

  return nextHabits;
}
