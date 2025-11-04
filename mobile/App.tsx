/**
 * MoneyGuard - Main App Component
 * @format
 */

import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import {Provider as PaperProvider, DefaultTheme, DarkTheme} from 'react-native-paper';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const paperTheme = isDarkMode ? DarkTheme : DefaultTheme;

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={paperTheme}>
        <SafeAreaView style={styles.container}>
          <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor={paperTheme.colors.background}
          />
          <View style={styles.content}>
            <Text style={styles.title}>Welcome to MoneyGuard</Text>
            <Text style={styles.subtitle}>Your Smart Expense Tracker</Text>
            <Text style={styles.info}>
              This is the base setup. Start building your app by editing App.tsx
            </Text>
          </View>
        </SafeAreaView>
      </PaperProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 16,
    textAlign: 'center',
    color: '#666',
  },
  info: {
    fontSize: 16,
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
});

export default App;
