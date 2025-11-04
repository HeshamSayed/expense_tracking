/**
 * App.tsx Example
 * Main application entry point with navigation and theme configuration
 *
 * INSTRUCTIONS:
 * 1. Rename this file to App.tsx
 * 2. Install all required dependencies (see DEPENDENCIES.md)
 * 3. Update the navigation imports based on your project structure
 * 4. Configure your theme colors
 */

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { colors } from './src/theme/colors';

/**
 * Custom theme based on MoneyGuard brand identity
 */
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary, // #2E7D32 - Forest Green
    secondary: colors.secondary, // #1565C0 - Deep Blue
    tertiary: colors.accent, // #FF6F00 - Amber Orange
    error: colors.error, // #C62828 - Deep Red
    background: colors.background, // #F5F7FA - Light Gray
    surface: colors.surface, // #FFFFFF - White
    onPrimary: colors.white,
    onSecondary: colors.white,
    onBackground: colors.textPrimary,
    onSurface: colors.textPrimary,
  },
};

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize app (load fonts, check auth state, etc.)
    const initializeApp = async () => {
      try {
        // TODO: Add your initialization logic here
        // - Load custom fonts
        // - Check authentication state
        // - Initialize analytics
        // - Initialize AdMob (if using)

        // Example:
        // await Font.loadAsync({
        //   'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
        //   'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
        // });

        // For AdMob initialization:
        // import mobileAds from 'react-native-google-mobile-ads';
        // await mobileAds().initialize();

        setIsReady(true);
      } catch (error) {
        console.error('App initialization error:', error);
        setIsReady(true); // Set ready anyway to show error screen
      }
    };

    initializeApp();
  }, []);

  if (!isReady) {
    // TODO: Replace with proper splash screen or loading screen
    return null; // or <SplashScreen />
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <StatusBar
            barStyle="dark-content"
            backgroundColor={colors.background}
          />
          <AuthNavigator />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

/**
 * Advanced App.tsx with Authentication State Management
 *
 * If you want to handle both authenticated and unauthenticated states:
 *
 * import { createNativeStackNavigator } from '@react-navigation/native-stack';
 * import { AuthNavigator } from './src/navigation/AuthNavigator';
 * import { MainNavigator } from './src/navigation/MainNavigator';
 *
 * const RootStack = createNativeStackNavigator();
 *
 * export default function App() {
 *   const [isAuthenticated, setIsAuthenticated] = useState(false);
 *   const [isLoading, setIsLoading] = useState(true);
 *
 *   useEffect(() => {
 *     // Check if user is already logged in
 *     const checkAuthStatus = async () => {
 *       try {
 *         const token = await SecureStore.getItemAsync('authToken');
 *         setIsAuthenticated(!!token);
 *       } catch (error) {
 *         console.error('Auth check error:', error);
 *       } finally {
 *         setIsLoading(false);
 *       }
 *     };
 *
 *     checkAuthStatus();
 *   }, []);
 *
 *   if (isLoading) {
 *     return <SplashScreen />;
 *   }
 *
 *   return (
 *     <SafeAreaProvider>
 *       <PaperProvider theme={theme}>
 *         <NavigationContainer>
 *           <RootStack.Navigator screenOptions={{ headerShown: false }}>
 *             {isAuthenticated ? (
 *               <RootStack.Screen name="Main" component={MainNavigator} />
 *             ) : (
 *               <RootStack.Screen name="Auth" component={AuthNavigator} />
 *             )}
 *           </RootStack.Navigator>
 *         </NavigationContainer>
 *       </PaperProvider>
 *     </SafeAreaProvider>
 *   );
 * }
 */
