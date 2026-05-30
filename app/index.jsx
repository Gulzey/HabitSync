import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Keyboard,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  StatusBar as NativeStatusBar,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  loadHabits,
  loadUserName,
  saveHabits,
  saveUserName,
  syncDataWithCloud,
  toggleHabit,
} from '../utils/storage';

const THEMES = {
  dark: {
    name: 'dark',
    background: '#121212',
    surface: '#1E1E1E',
    elevated: '#242424',
    border: '#303030',
    borderStrong: '#555555',
    text: '#FFFFFF',
    muted: '#9A9A9A',
    inputPlaceholder: '#777777',
    accent: '#BFA7FF',
    accentSoft: '#2A2438',
    accentBorder: '#5B4B85',
    accentText: '#D8C9FF',
    buttonText: '#121212',
    dangerSurface: '#2A2A2A',
    dangerText: '#B8B8B8',
    disabled: '#322C3D',
  },
  light: {
    name: 'light',
    background: '#F7F5FC',
    surface: '#FFFFFF',
    elevated: '#F0ECFA',
    border: '#DED7EE',
    borderStrong: '#B9ABD6',
    text: '#18151F',
    muted: '#6D6478',
    inputPlaceholder: '#948AA3',
    accent: '#8E6CFF',
    accentSoft: '#EFE8FF',
    accentBorder: '#D7C9FF',
    accentText: '#5F3DE0',
    buttonText: '#FFFFFF',
    dangerSurface: '#F1EDF7',
    dangerText: '#6D6478',
    disabled: '#D8D0E8',
  },
};

const MENU_ITEMS = [
  { label: 'Home', route: '/' },
  { label: 'FAQ', route: '/faq' },
  { label: 'Settings', route: '/settings' },
];

const MOTIVATIONAL_QUOTES = [
  'Small wins compound.',
  'Consistency beats intensity.',
  'Keep the chain alive.',
  'Progress is built one check at a time.',
  'Make today easy to repeat.',
];

const CLOUD_SYNC_USER_ID = 'local-device-user';

function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getWeekStart(date) {
  const weekStart = new Date(date);
  const day = weekStart.getDay();
  const daysFromMonday = day === 0 ? 6 : day - 1;

  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - daysFromMonday);

  return weekStart;
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
}

function addWeeks(date, weeks) {
  return addDays(date, weeks * 7);
}

function isCompletedToday(habit, todayString) {
  return Array.isArray(habit.completedDates) && habit.completedDates.includes(todayString);
}

function WeeklyProgress({ habits, theme, weekStart, onPreviousWeek, onNextWeek }) {
  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = addDays(weekStart, index);
        const dateString = formatDateString(date);
        const completedCount = habits.filter(
          (habit) => Array.isArray(habit.completedDates) && habit.completedDates.includes(dateString)
        ).length;

        return {
          dateString,
          dayLabel: date.toLocaleDateString(undefined, { weekday: 'short' }),
          completedCount,
        };
      }),
    [habits, weekStart]
  );
  const maxCompleted = Math.max(...weekDays.map((day) => day.completedCount), 1);
  const weekEnd = addDays(weekStart, 6);
  const weekLabel = `${weekStart.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })} - ${weekEnd.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;

  return (
    <View style={[styles.weeklyPanel, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.weeklyHeader}>
        <View>
          <Text style={[styles.weeklyTitle, { color: theme.text }]}>Weekly progress</Text>
          <Text style={[styles.weeklyRange, { color: theme.muted }]}>{weekLabel}</Text>
        </View>

        <View style={styles.weekControls}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Previous week"
            onPress={onPreviousWeek}
            style={({ pressed }) => [
              styles.weekButton,
              { backgroundColor: theme.elevated, borderColor: theme.border },
              pressed && styles.iconButtonPressed,
            ]}
          >
            <Text style={[styles.weekButtonText, { color: theme.text }]}>{'<'}</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Next week"
            onPress={onNextWeek}
            style={({ pressed }) => [
              styles.weekButton,
              { backgroundColor: theme.elevated, borderColor: theme.border },
              pressed && styles.iconButtonPressed,
            ]}
          >
            <Text style={[styles.weekButtonText, { color: theme.text }]}>{'>'}</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.graphRow}>
        {weekDays.map((day) => {
          const barHeight = 12 + (day.completedCount / maxCompleted) * 72;

          return (
            <View key={day.dateString} style={styles.graphColumn}>
              <Text style={[styles.graphCount, { color: theme.text }]}>{day.completedCount}</Text>
              <View style={[styles.barTrack, { backgroundColor: theme.elevated }]}>
                <View
                  style={[
                    styles.barFill,
                    {
                      backgroundColor: day.completedCount > 0 ? theme.accent : theme.borderStrong,
                      height: barHeight,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.dayLabel, { color: theme.muted }]}>{day.dayLabel}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function MenuIcon({ color }) {
  return (
    <View style={styles.menuIcon}>
      <View style={[styles.menuIconLine, { backgroundColor: color }]} />
      <View style={[styles.menuIconLine, { backgroundColor: color }]} />
      <View style={[styles.menuIconLine, { backgroundColor: color }]} />
    </View>
  );
}

function MoonIcon({ color, cutoutColor }) {
  return (
    <View style={[styles.moonIcon, { backgroundColor: color }]}>
      <View style={[styles.moonCutout, { backgroundColor: cutoutColor }]} />
    </View>
  );
}

function HabitCard({ habit, todayString, onToggle, onRequestRemove, theme }) {
  const completed = isCompletedToday(habit, todayString);
  const translateX = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(completed ? 1 : 0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 12 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(Math.max(gestureState.dx, -96));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const shouldDelete = gestureState.dx < -72;

        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          friction: 7,
          tension: 80,
        }).start();

        if (shouldDelete) {
          onRequestRemove(habit);
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          friction: 7,
          tension: 80,
        }).start();
      },
    })
  ).current;

  useEffect(() => {
    Animated.spring(checkScale, {
      toValue: completed ? 1 : 0,
      useNativeDriver: true,
      friction: 5,
      tension: 140,
    }).start();
  }, [checkScale, completed]);

  function handleTogglePress() {
    Animated.sequence([
      Animated.spring(pressScale, {
        toValue: 0.92,
        useNativeDriver: true,
        friction: 5,
        tension: 180,
      }),
      Animated.spring(pressScale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 4,
        tension: 160,
      }),
    ]).start();

    onToggle(habit.id);
  }

  return (
    <View style={styles.swipeWrap}>
      <View style={[styles.deleteBehind, { backgroundColor: theme.accentSoft }]}>
        <Text style={[styles.deleteBehindText, { color: theme.accentText }]}>Delete</Text>
      </View>

      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.card,
          {
            backgroundColor: theme.surface,
            borderColor: completed ? theme.accentBorder : theme.border,
            transform: [{ translateX }],
          },
        ]}
      >
        <View style={styles.cardContent}>
          <Text style={[styles.habitTitle, { color: theme.text }]} numberOfLines={2}>
            {habit.title}
          </Text>

          <View
            style={[
              styles.streakBadge,
              { backgroundColor: theme.accentSoft, borderColor: theme.accentBorder },
            ]}
          >
            <View style={[styles.streakDot, { backgroundColor: theme.accent }]} />
            <Text style={[styles.streakText, { color: theme.accentText }]}>
              {habit.currentStreak || 0} day streak
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: completed }}
          onPress={handleTogglePress}
        >
          <Animated.View
            style={[
              styles.checkButton,
              {
                backgroundColor: completed ? theme.accent : theme.elevated,
                borderColor: completed ? theme.accent : theme.borderStrong,
                transform: [{ scale: pressScale }],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.checkMarkWrap,
                {
                  opacity: checkScale,
                  transform: [{ scale: checkScale }],
                },
              ]}
            >
              <View style={[styles.checkMark, { borderColor: theme.buttonText }]} />
            </Animated.View>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeMode, setThemeMode] = useState('dark');
  const [userName, setUserName] = useState('User');
  const [draftUserName, setDraftUserName] = useState('User');
  const [editingUserName, setEditingUserName] = useState(false);
  const [userNameHasChanged, setUserNameHasChanged] = useState(false);
  const [visibleWeekStart, setVisibleWeekStart] = useState(() => getWeekStart(new Date()));
  const [pendingDeleteHabit, setPendingDeleteHabit] = useState(null);
  const [syncRevision, setSyncRevision] = useState(0);
  const todayString = useMemo(getTodayString, []);
  const theme = THEMES[themeMode];

  useEffect(() => {
    let mounted = true;

    async function hydrateDashboard() {
      const [storedHabits, storedUserName] = await Promise.all([loadHabits(), loadUserName()]);

      if (mounted) {
        setHabits(storedHabits);
        setUserName(storedUserName);
        setDraftUserName(storedUserName);
        setUserNameHasChanged(storedUserName !== 'User');
        setLoading(false);
      }
    }

    hydrateDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      syncDataWithCloud(CLOUD_SYNC_USER_ID);
    }
  }, [loading, syncRevision]);

  const completedCount = habits.filter((habit) => isCompletedToday(habit, todayString)).length;
  const completionPercentage = habits.length
    ? Math.round((completedCount / habits.length) * 100)
    : 0;
  const quote = MOTIVATIONAL_QUOTES[completedCount % MOTIVATIONAL_QUOTES.length];

  async function handleToggleHabit(habitId) {
    const previousHabits = habits;

    setHabits((currentHabits) =>
      currentHabits.map((habit) => {
        if (habit.id !== habitId) {
          return habit;
        }

        const completedDates = Array.isArray(habit.completedDates) ? habit.completedDates : [];
        const completedToday = completedDates.includes(todayString);
        const nextCompletedDates = completedToday
          ? completedDates.filter((date) => date !== todayString)
          : [...completedDates, todayString];

        return {
          ...habit,
          completedDates: nextCompletedDates,
          currentStreak: completedToday
            ? Math.max((habit.currentStreak || 1) - 1, 0)
            : (habit.currentStreak || 0) + 1,
          longestStreak: completedToday
            ? habit.longestStreak || 0
            : Math.max(habit.longestStreak || 0, (habit.currentStreak || 0) + 1),
        };
      })
    );

    try {
      const persistedHabits = await toggleHabit(habitId, todayString);
      setHabits(persistedHabits);
      setSyncRevision((revision) => revision + 1);
    } catch (error) {
      console.warn('Failed to toggle habit.', error);
      setHabits(previousHabits);
    }
  }

  async function handleAddHabit() {
    const title = newHabitTitle.trim();

    if (!title) {
      return;
    }

    const nextHabit = {
      id: `${Date.now()}`,
      title,
      completedDates: [],
      currentStreak: 0,
      longestStreak: 0,
    };
    const nextHabits = [nextHabit, ...habits];

    setHabits(nextHabits);
    setNewHabitTitle('');
    Keyboard.dismiss();

    try {
      await saveHabits(nextHabits);
      setSyncRevision((revision) => revision + 1);
    } catch (error) {
      console.warn('Failed to add habit.', error);
      setHabits(habits);
      setNewHabitTitle(title);
    }
  }

  async function handleRemoveHabit(habitId) {
    const nextHabits = habits.filter((habit) => habit.id !== habitId);
    const previousHabits = habits;

    setHabits(nextHabits);

    try {
      await saveHabits(nextHabits);
      setSyncRevision((revision) => revision + 1);
    } catch (error) {
      console.warn('Failed to remove habit.', error);
      setHabits(previousHabits);
    }
  }

  function handleConfirmDelete() {
    if (pendingDeleteHabit) {
      handleRemoveHabit(pendingDeleteHabit.id);
      setPendingDeleteHabit(null);
    }
  }

  function toggleThemeMode() {
    setThemeMode((currentMode) => (currentMode === 'dark' ? 'light' : 'dark'));
  }

  function handleOpenMenuItem(route) {
    setMenuOpen(false);

    if (route !== pathname) {
      router.push(route);
    }
  }

  async function handleSaveUserName() {
    const nextUserName = draftUserName.trim() || 'User';

    setUserName(nextUserName);
    setDraftUserName(nextUserName);
    setEditingUserName(false);
    setUserNameHasChanged(nextUserName !== 'User');

    try {
      await saveUserName(nextUserName);
    } catch (error) {
      console.warn('Failed to save user name.', error);
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar style={theme.name === 'dark' ? 'light' : 'dark'} backgroundColor={theme.background} />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <View style={styles.topBar}>
            <Text style={[styles.eyebrow, { color: theme.accent }]}>HabitSync</Text>

            <View style={styles.headerActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Toggle color mode"
                onPress={toggleThemeMode}
                style={({ pressed }) => [
                  styles.iconButton,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                  pressed && styles.iconButtonPressed,
                ]}
              >
                <MoonIcon color={theme.accent} cutoutColor={theme.surface} />
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open menu"
                onPress={() => setMenuOpen((isOpen) => !isOpen)}
                style={({ pressed }) => [
                  styles.iconButton,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                  pressed && styles.iconButtonPressed,
                ]}
              >
                <MenuIcon color={theme.text} />
              </Pressable>
            </View>

            {menuOpen && (
              <View
                style={[
                  styles.dropdown,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                {MENU_ITEMS.map((item) => (
                  <Pressable
                    accessibilityRole="button"
                    key={item.label}
                    onPress={() => handleOpenMenuItem(item.route)}
                    style={({ pressed }) => [
                      styles.dropdownItem,
                      pressed && { backgroundColor: theme.accentSoft },
                    ]}
                  >
                    <Text style={[styles.dropdownText, { color: theme.text }]}>{item.label}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          <View style={styles.greetingRow}>
            <Text style={[styles.title, { color: theme.text }]}>Hi </Text>

            {editingUserName ? (
              <TextInput
                autoCapitalize="words"
                autoFocus
                onBlur={handleSaveUserName}
                onChangeText={setDraftUserName}
                onSubmitEditing={handleSaveUserName}
                returnKeyType="done"
                selectTextOnFocus
                style={[
                  styles.userNameInput,
                  {
                    borderColor: theme.accentBorder,
                    color: theme.text,
                  },
                ]}
                value={draftUserName}
              />
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Edit user name"
                onPress={() => setEditingUserName(true)}
                style={styles.userNameButton}
              >
                <Text style={[styles.title, { color: theme.text }]}>{userName}</Text>
                {!userNameHasChanged && (
                  <Text style={[styles.penIcon, { color: theme.accent }]}>edit</Text>
                )}
              </Pressable>
            )}
          </View>

          <View style={styles.progressSummary}>
            <Text style={[styles.progressText, { color: theme.text }]}>{completionPercentage}% complete</Text>
            <Text style={[styles.progressMeta, { color: theme.muted }]}>
              {completedCount}/{habits.length} habits checked
            </Text>
          </View>

          <View style={[styles.progressTrack, { backgroundColor: theme.elevated }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: theme.accent, width: `${completionPercentage}%` },
              ]}
            />
          </View>
        </View>

        <View style={styles.addHabitRow}>
          <TextInput
            autoCapitalize="sentences"
            onChangeText={setNewHabitTitle}
            onSubmitEditing={handleAddHabit}
            placeholder="New habit"
            placeholderTextColor={theme.inputPlaceholder}
            returnKeyType="done"
            style={[
              styles.addHabitInput,
              { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text },
            ]}
            value={newHabitTitle}
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add habit"
            disabled={!newHabitTitle.trim()}
            onPress={handleAddHabit}
            style={({ pressed }) => [
              styles.addHabitButton,
              { backgroundColor: theme.accent },
              !newHabitTitle.trim() && { backgroundColor: theme.disabled },
              pressed && styles.addHabitButtonPressed,
            ]}
          >
            <Text style={[styles.addHabitButtonText, { color: theme.buttonText }]}>Add</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={theme.accent} />
          </View>
        ) : (
          <FlatList
            data={habits}
            style={styles.habitList}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <HabitCard
                habit={item}
                todayString={todayString}
                onToggle={handleToggleHabit}
                onRequestRemove={setPendingDeleteHabit}
                theme={theme}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={[styles.emptyState, { borderColor: theme.border }]}>
                <Text style={[styles.emptyTitle, { color: theme.text }]}>No habits yet</Text>
                <Text style={[styles.emptyText, { color: theme.muted }]}>
                  Add habits to start tracking your daily rhythm.
                </Text>
              </View>
            }
          />
        )}

        {!loading && (
          <View style={styles.fixedBottom}>
            <WeeklyProgress
              habits={habits}
              theme={theme}
              weekStart={visibleWeekStart}
              onPreviousWeek={() => setVisibleWeekStart((currentWeek) => addWeeks(currentWeek, -1))}
              onNextWeek={() => setVisibleWeekStart((currentWeek) => addWeeks(currentWeek, 1))}
            />

            <Text style={[styles.quoteText, { color: theme.muted }]}>{quote}</Text>
          </View>
        )}

        <Modal
          animationType="fade"
          onRequestClose={() => setPendingDeleteHabit(null)}
          transparent
          visible={Boolean(pendingDeleteHabit)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.confirmModal, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.confirmTitle, { color: theme.text }]}>Delete habit?</Text>
              <Text style={[styles.confirmText, { color: theme.muted }]}>
                Are you sure you want to delete {pendingDeleteHabit?.title}? This cannot be undone.
              </Text>

              <View style={styles.confirmActions}>
                <Pressable
                  onPress={() => setPendingDeleteHabit(null)}
                  style={({ pressed }) => [
                    styles.confirmButton,
                    { backgroundColor: theme.elevated, borderColor: theme.border },
                    pressed && styles.iconButtonPressed,
                  ]}
                >
                  <Text style={[styles.confirmButtonText, { color: theme.text }]}>Cancel</Text>
                </Pressable>

                <Pressable
                  onPress={handleConfirmDelete}
                  style={({ pressed }) => [
                    styles.confirmButton,
                    styles.confirmDeleteButton,
                    { backgroundColor: theme.accent, borderColor: theme.accent },
                    pressed && styles.iconButtonPressed,
                  ]}
                >
                  <Text style={[styles.confirmButtonText, { color: theme.buttonText }]}>Delete</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (NativeStatusBar.currentHeight || 0) + 18 : 12,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 22,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 3,
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    marginLeft: 8,
    width: 38,
  },
  iconButtonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.97 }],
  },
  menuIcon: {
    height: 14,
    justifyContent: 'space-between',
    width: 18,
  },
  menuIconLine: {
    borderRadius: 2,
    height: 2,
    width: '100%',
  },
  moonIcon: {
    borderRadius: 11,
    height: 22,
    position: 'relative',
    width: 22,
  },
  moonCutout: {
    borderRadius: 9,
    height: 18,
    position: 'absolute',
    right: -2,
    top: 2,
    width: 18,
  },
  dropdown: {
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 142,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 48,
    zIndex: 5,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  dropdownText: {
    fontSize: 15,
    fontWeight: '700',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 0,
  },
  greetingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  userNameButton: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  userNameInput: {
    borderBottomWidth: 2,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 0,
    minWidth: 120,
    paddingBottom: 0,
    paddingTop: 0,
  },
  penIcon: {
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 8,
    marginTop: 12,
    textTransform: 'uppercase',
  },
  progressSummary: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  progressText: {
    fontSize: 18,
    fontWeight: '700',
  },
  progressMeta: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressTrack: {
    borderRadius: 999,
    height: 10,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 999,
    height: '100%',
  },
  addHabitRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 18,
  },
  addHabitInput: {
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    minHeight: 52,
    paddingHorizontal: 14,
  },
  addHabitButton: {
    alignItems: 'center',
    borderRadius: 8,
    justifyContent: 'center',
    marginLeft: 10,
    minHeight: 52,
    paddingHorizontal: 18,
  },
  addHabitButtonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
  addHabitButtonText: {
    fontSize: 15,
    fontWeight: '900',
  },
  centerState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 8,
  },
  habitList: {
    flex: 1,
  },
  swipeWrap: {
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  deleteBehind: {
    alignItems: 'flex-end',
    bottom: 0,
    justifyContent: 'center',
    paddingRight: 22,
    position: 'absolute',
    right: 0,
    top: 0,
    width: 112,
  },
  deleteBehindText: {
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  card: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 88,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  cardContent: {
    flex: 1,
    paddingRight: 14,
  },
  habitTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 24,
  },
  streakBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  streakDot: {
    borderRadius: 4,
    height: 8,
    marginRight: 6,
    width: 8,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '700',
  },
  checkButton: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 2,
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  checkMarkWrap: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    width: 26,
  },
  checkMark: {
    borderBottomWidth: 6,
    borderRightWidth: 6,
    height: 19,
    transform: [{ rotate: '45deg' }],
    width: 11,
  },
  emptyState: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 36,
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
  },
  fixedBottom: {
    paddingBottom: Platform.OS === 'android' ? 34 : 26,
  },
  quoteText: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 10,
    textAlign: 'center',
  },
  weeklyPanel: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
  },
  weeklyHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  weeklyTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  weeklyRange: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },
  weekControls: {
    flexDirection: 'row',
  },
  weekButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    marginLeft: 8,
    width: 34,
  },
  weekButtonText: {
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 22,
  },
  graphRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    height: 126,
    justifyContent: 'space-between',
  },
  graphColumn: {
    alignItems: 'center',
    flex: 1,
  },
  graphCount: {
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 6,
  },
  barTrack: {
    alignItems: 'center',
    borderRadius: 999,
    height: 84,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    width: 18,
  },
  barFill: {
    borderRadius: 999,
    minHeight: 8,
    width: '100%',
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 7,
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.62)',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  confirmModal: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 18,
    width: '100%',
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  confirmText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
    marginTop: 8,
  },
  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 18,
  },
  confirmButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    marginLeft: 10,
    minHeight: 42,
    minWidth: 92,
    paddingHorizontal: 14,
  },
  confirmDeleteButton: {
    borderWidth: 1,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '900',
  },
});
