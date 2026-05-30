import { useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, Pressable, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const FAQ_ITEMS = [
  {
    question: 'How are streaks calculated?',
    answer: 'HabitSync counts consecutive checked days ending on the selected day.',
  },
  {
    question: 'Where are my habits stored?',
    answer:
      'HabitSync is local-first. Your habits, streaks, and progress are saved on this device first with AsyncStorage.',
  },
  {
    question: 'How will cloud backup work?',
    answer:
      'Cloud backup will be optional. If you enable it in Settings, HabitSync will keep saving locally first, then push a backup to the cloud when syncing is available.',
  },
  {
    question: 'Can I edit a habit after creating it?',
    answer: 'For now, remove the habit and add it again with the updated name.',
  },
];

export default function FAQScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor="#121212" />
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable onPress={() => router.push('/')} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>

        <Text style={styles.eyebrow}>HabitSync</Text>
        <Text style={styles.title}>FAQ</Text>

        <View style={styles.list}>
          {FAQ_ITEMS.map((item) => (
            <View key={item.question} style={styles.card}>
              <Text style={styles.question}>{item.question}</Text>
              <Text style={styles.answer}>{item.answer}</Text>
            </View>
          ))}
        </View>
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
  list: {
    marginTop: 22,
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderColor: '#303030',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
  },
  question: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  answer: {
    color: '#A8A8A8',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
});
