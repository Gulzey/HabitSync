import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

export default function RootLayout() {
  return (
    <View style={styles.root}>
      <StatusBar style="light" backgroundColor="#121212" />
      <Stack screenOptions={{ headerShown: false, contentStyle: styles.screen }} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#121212',
  },
  screen: {
    backgroundColor: '#121212',
  },
});
