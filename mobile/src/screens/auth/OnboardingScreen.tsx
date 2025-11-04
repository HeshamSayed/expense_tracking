/**
 * OnboardingScreen.tsx
 * Welcome screen with feature highlights and navigation to auth screens
 */

import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import {
  Text,
  Button,
  Surface,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OnboardingSlide } from '../../types/auth.types';
import { colors } from '../../theme/colors';

const { width, height } = Dimensions.get('window');

const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Track Every Expense',
    description: 'Record your daily expenses effortlessly and see where your money goes with detailed categorization.',
    icon: '💰',
  },
  {
    id: '2',
    title: 'Smart Budgeting',
    description: 'Set budgets for different categories and get real-time alerts when you\'re close to your limits.',
    icon: '📊',
  },
  {
    id: '3',
    title: 'Insightful Reports',
    description: 'Visualize your spending patterns with beautiful charts and gain insights to make better financial decisions.',
    icon: '📈',
  },
  {
    id: '4',
    title: 'Secure & Private',
    description: 'Your financial data is encrypted and secure. We never sell your data. Period.',
    icon: '🔒',
  },
];

interface OnboardingScreenProps {
  navigation: any;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const theme = useTheme();

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(slideIndex);
  };

  const scrollToSlide = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * width,
      animated: true,
    });
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      scrollToSlide(currentIndex + 1);
    } else {
      navigation.navigate('Register');
    }
  };

  const handleSkip = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Skip button */}
      <View style={styles.skipContainer}>
        <Button
          mode="text"
          onPress={handleSkip}
          textColor={colors.textSecondary}
          style={styles.skipButton}
        >
          Skip
        </Button>
      </View>

      {/* Slides */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {SLIDES.map((slide, index) => (
          <View key={slide.id} style={styles.slide}>
            <Surface style={styles.iconContainer} elevation={2}>
              <Text style={styles.icon}>{slide.icon}</Text>
            </Surface>

            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.description}>{slide.description}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Pagination dots */}
      <View style={styles.paginationContainer}>
        {SLIDES.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentIndex && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>

      {/* Bottom buttons */}
      <View style={styles.bottomContainer}>
        <Button
          mode="contained"
          onPress={handleNext}
          style={styles.primaryButton}
          buttonColor={colors.primary}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
        </Button>

        {currentIndex === SLIDES.length - 1 && (
          <Button
            mode="outlined"
            onPress={handleSkip}
            style={styles.secondaryButton}
            textColor={colors.primary}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            I Already Have an Account
          </Button>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skipContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  skipButton: {
    marginRight: -8,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    marginBottom: 40,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.disabled,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  bottomContainer: {
    paddingHorizontal: 32,
    paddingBottom: 24,
    gap: 12,
  },
  primaryButton: {
    borderRadius: 8,
  },
  secondaryButton: {
    borderRadius: 8,
    borderColor: colors.primary,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OnboardingScreen;
