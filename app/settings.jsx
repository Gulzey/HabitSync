import { useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, Pressable, Switch, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

function SettingSwitchCard({ title, description, value, onValueChange, disabled = false, badge }) {
  return (
    <View style={[styles.card, disabled && styles.cardDisabled]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleWrap}>
          <Text style={[styles.cardTitle, disabled && styles.disabledText]}>{title}</Text>
          {badge && <Text style={styles.badge}>{badge}</Text>}
        </View>
        <Switch
          disabled={disabled}
          ios_backgroundColor="#3A3A3A"
          onValueChange={onValueChange}
          thumbColor={disabled ? '#7A7A7A' : value ? '#FFFFFF' : '#B8B8B8'}
          trackColor={{ false: disabled ? '#2A2A2A' : '#3A3A3A', true: '#BFA7FF' }}
          value={value}
        />
      </View>
      <Text style={[styles.cardText, disabled && styles.disabledText]}>{description}</Text>
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const [localFirstEnabled, setLocalFirstEnabled] = useState(true);
  const [cloudBackupEnabled, setCloudBackupEnabled] = useState(false);
  const [themeSyncEnabled, setThemeSyncEnabled] = useState(true);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor="#121212" />
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable onPress={() => router.push('/')} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>

        <Text style={styles.eyebrow}>HabitSync</Text>
        <Text style={styles.title}>Settings</Text>

        <SettingSwitchCard
          title="Local-first tracking"
          description="Keep habit data saved directly on this device for fast offline access."
          value={localFirstEnabled}
          onValueChange={setLocalFirstEnabled}
        />

        <SettingSwitchCard
          title="Cloud backup"
          badge="Coming soon"
          description="Optional cloud backup is planned, but HabitSync is local-first for this release. Your data stays on this device."
          disabled
          value={cloudBackupEnabled}
          onValueChange={setCloudBackupEnabled}
        />

        <SettingSwitchCard
          title="Theme"
          description="Keep your theme preference ready for app-wide sync when profile settings are added."
          value={themeSyncEnabled}
          onValueChange={setThemeSyncEnabled}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#121212',
    flex: 1,
  },
  container: {
    padding: 20,
    paddingTop: 56,
  },
  backButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#1E1E1E',
    borderColor: '#303030',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 22,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  backButtonText: {
    color: '#BFA7FF',
    fontSize: 14,
    fontWeight: '800',
  },
  eyebrow: {
    color: '#BFA7FF',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '900',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderColor: '#303030',
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
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#2A2438',
    borderColor: '#5B4B85',
    borderRadius: 999,
    borderWidth: 1,
    color: '#D8C9FF',
    fontSize: 11,
    fontWeight: '900',
    marginTop: 7,
    paddingHorizontal: 9,
    paddingVertical: 4,
    textTransform: 'uppercase',
  },
  cardText: {
    color: '#A8A8A8',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  disabledText: {
    color: '#777777',
  },
});
