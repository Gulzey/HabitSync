import { useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, Pressable, Switch, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const SETTINGS_THEMES = {
  dark: {
    background: '#121212',
    surface: '#1E1E1E',
    border: '#303030',
    text: '#FFFFFF',
    muted: '#A8A8A8',
    accent: '#BFA7FF',
    badgeBackground: '#2A2438',
    badgeBorder: '#5B4B85',
    disabledText: '#777777',
    disabledTrack: '#2A2A2A',
    track: '#3A3A3A',
  },
  light: {
    background: '#F7F5FC',
    surface: '#FFFFFF',
    border: '#DED7EE',
    text: '#18151F',
    muted: '#6D6478',
    accent: '#8E6CFF',
    badgeBackground: '#EFE8FF',
    badgeBorder: '#D7C9FF',
    disabledText: '#948AA3',
    disabledTrack: '#D8D0E8',
    track: '#CFC6DF',
  },
};

function SettingSwitchCard({ title, description, value, onValueChange, disabled = false, badge, theme }) {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.border },
        disabled && styles.cardDisabled,
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleWrap}>
          <Text style={[styles.cardTitle, { color: disabled ? theme.disabledText : theme.text }]}>{title}</Text>
          {badge && (
            <Text
              style={[
                styles.badge,
                {
                  backgroundColor: theme.badgeBackground,
                  borderColor: theme.badgeBorder,
                  color: theme.accent,
                },
              ]}
            >
              {badge}
            </Text>
          )}
        </View>
        <Switch
          disabled={disabled}
          ios_backgroundColor={theme.track}
          onValueChange={onValueChange}
          thumbColor={disabled ? '#7A7A7A' : value ? '#FFFFFF' : '#B8B8B8'}
          trackColor={{ false: disabled ? theme.disabledTrack : theme.track, true: theme.accent }}
          value={value}
        />
      </View>
      <Text style={[styles.cardText, { color: disabled ? theme.disabledText : theme.muted }]}>
        {description}
      </Text>
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const [localFirstEnabled, setLocalFirstEnabled] = useState(true);
  const [cloudBackupEnabled, setCloudBackupEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  const theme = darkModeEnabled ? SETTINGS_THEMES.dark : SETTINGS_THEMES.light;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar style={darkModeEnabled ? 'light' : 'dark'} backgroundColor={theme.background} />
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable
          onPress={() => router.push('/')}
          style={[styles.backButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <Text style={[styles.backButtonText, { color: theme.accent }]}>Back</Text>
        </Pressable>

        <Text style={[styles.eyebrow, { color: theme.accent }]}>HabitSync</Text>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>

        <SettingSwitchCard
          title="Local-first tracking"
          description="Keep habit data saved directly on this device for fast offline access."
          value={localFirstEnabled}
          onValueChange={setLocalFirstEnabled}
          theme={theme}
        />

        <SettingSwitchCard
          title="Cloud backup"
          badge="Coming soon"
          description="Optional cloud backup is planned, but HabitSync is local-first for this release. Your data stays on this device."
          disabled
          value={cloudBackupEnabled}
          onValueChange={setCloudBackupEnabled}
          theme={theme}
        />

        <SettingSwitchCard
          title={darkModeEnabled ? 'Dark mode' : 'Light mode'}
          description="Switch this settings screen between dark and light mode."
          value={darkModeEnabled}
          onValueChange={setDarkModeEnabled}
          theme={theme}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingTop: 56,
  },
  backButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 22,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    marginTop: 8,
  },
  card: {
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 14,
    padding: 16,
  },
  cardDisabled: {
    opacity: 0.72,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitleWrap: {
    flex: 1,
    paddingRight: 12,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    fontSize: 11,
    fontWeight: '900',
    marginTop: 7,
    paddingHorizontal: 9,
    paddingVertical: 4,
    textTransform: 'uppercase',
  },
  cardText: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
});
