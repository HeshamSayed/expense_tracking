/**
 * AdMobBanner.tsx
 * Reusable AdMob banner component for displaying ads at the bottom of screens
 */

import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { colors } from '../theme/colors';

/**
 * NOTE: This is a placeholder component. To use real AdMob ads, you need to:
 *
 * 1. Install react-native-google-mobile-ads:
 *    npm install react-native-google-mobile-ads
 *
 * 2. Configure AdMob:
 *    - Android: Add AdMob App ID to android/app/src/main/AndroidManifest.xml
 *    - iOS: Add AdMob App ID to ios/YourApp/Info.plist
 *
 * 3. Initialize AdMob in your App.tsx:
 *    import mobileAds from 'react-native-google-mobile-ads';
 *    await mobileAds().initialize();
 *
 * 4. Replace this component with actual AdMob implementation
 */

interface AdMobBannerProps {
  testMode?: boolean; // Use test ads during development
}

export const AdMobBanner: React.FC<AdMobBannerProps> = ({ testMode = true }) => {
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);

  // Placeholder implementation
  // Replace with actual AdMob implementation when ready

  /**
   * Example AdMob implementation (uncomment when package is installed):
   *
   * import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
   *
   * const adUnitId = testMode
   *   ? TestIds.BANNER
   *   : Platform.select({
   *       ios: 'ca-app-pub-xxxxx/xxxxx',
   *       android: 'ca-app-pub-xxxxx/xxxxx',
   *     });
   *
   * return (
   *   <View style={styles.container}>
   *     <BannerAd
   *       unitId={adUnitId}
   *       size={BannerAdSize.BANNER}
   *       requestOptions={{
   *         requestNonPersonalizedAdsOnly: true,
   *       }}
   *       onAdLoaded={() => setAdLoaded(true)}
   *       onAdFailedToLoad={(error) => {
   *         console.error('Ad failed to load:', error);
   *         setAdError(true);
   *       }}
   *     />
   *   </View>
   * );
   */

  // Placeholder UI for development
  if (__DEV__) {
    return (
      <Surface style={styles.placeholderContainer} elevation={2}>
        <Text style={styles.placeholderText}>
          📱 AdMob Banner Placeholder
        </Text>
        <Text style={styles.placeholderSubtext}>
          320x50 • {testMode ? 'Test Mode' : 'Production Mode'}
        </Text>
      </Surface>
    );
  }

  // In production, return null if ad package is not configured
  return null;
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  placeholderContainer: {
    width: '100%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  placeholderText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  placeholderSubtext: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default AdMobBanner;
