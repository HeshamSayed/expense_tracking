import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text, useTheme, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// Import AdMob components
// import { BannerAd, BannerAdSize, TestIds } from '@react-native-google-mobile-ads/admob';

interface AdBannerProps {
  isPro: boolean;
  onUpgradePress?: () => void;
  adUnitId?: string;
  size?: 'banner' | 'large_banner' | 'medium_rectangle' | 'full_banner';
  showUpgradePrompt?: boolean;
}

export default function AdBanner({
  isPro,
  onUpgradePress,
  adUnitId,
  size = 'banner',
  showUpgradePrompt = true,
}: AdBannerProps) {
  const theme = useTheme();
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);

  // Don't show anything for Pro users
  if (isPro) {
    return null;
  }

  // Get AdMob unit ID based on platform
  const getAdUnitId = (): string => {
    if (adUnitId) return adUnitId;

    // Use test IDs in development, real IDs in production
    if (__DEV__) {
      // Test IDs from AdMob
      return Platform.select({
        ios: 'ca-app-pub-3940256099942544/2934735716', // Test banner ID
        android: 'ca-app-pub-3940256099942544/6300978111', // Test banner ID
        default: 'ca-app-pub-3940256099942544/6300978111',
      });
    }

    // TODO: Replace with your actual AdMob unit IDs
    return Platform.select({
      ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY', // Your iOS banner ID
      android: 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY', // Your Android banner ID
      default: 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY',
    });
  };

  // Get banner size
  const getBannerSize = () => {
    // Map size prop to AdMob BannerAdSize
    // Uncomment when using actual AdMob:
    /*
    const sizeMap = {
      banner: BannerAdSize.BANNER, // 320x50
      large_banner: BannerAdSize.LARGE_BANNER, // 320x100
      medium_rectangle: BannerAdSize.MEDIUM_RECTANGLE, // 300x250
      full_banner: BannerAdSize.FULL_BANNER, // 468x60
    };
    return sizeMap[size];
    */
    return size;
  };

  const handleAdLoaded = () => {
    setAdLoaded(true);
    setAdError(false);
  };

  const handleAdFailedToLoad = (error: any) => {
    console.warn('Ad failed to load:', error);
    setAdLoaded(false);
    setAdError(true);
  };

  // Render upgrade prompt if ads fail to load or as fallback
  const renderUpgradePrompt = () => {
    if (!showUpgradePrompt) return null;

    return (
      <View
        style={[
          styles.upgradePrompt,
          {
            backgroundColor: theme.colors.primaryContainer,
            borderColor: theme.colors.outline,
          },
        ]}
      >
        <View style={styles.upgradeContent}>
          <Icon
            name="crown"
            size={24}
            color={theme.colors.primary}
            style={styles.crownIcon}
          />
          <View style={styles.upgradeText}>
            <Text
              variant="labelLarge"
              style={[styles.upgradeTitle, { color: theme.colors.onPrimaryContainer }]}
            >
              Upgrade to Pro
            </Text>
            <Text
              variant="bodySmall"
              style={[styles.upgradeSubtitle, { color: theme.colors.onPrimaryContainer }]}
            >
              Remove ads and unlock all features
            </Text>
          </View>
          {onUpgradePress && (
            <Button
              mode="contained"
              onPress={onUpgradePress}
              compact
              style={styles.upgradeButton}
            >
              Upgrade
            </Button>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* AdMob Banner - Commented out until you configure AdMob */}
      {/*
      <BannerAd
        unitId={getAdUnitId()}
        size={getBannerSize()}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={handleAdLoaded}
        onAdFailedToLoad={handleAdFailedToLoad}
      />
      */}

      {/* Placeholder for ads during development */}
      {__DEV__ && (
        <View
          style={[
            styles.adPlaceholder,
            {
              backgroundColor: theme.colors.surfaceVariant,
              borderColor: theme.colors.outline,
            },
          ]}
        >
          <Icon
            name="advertisements"
            size={32}
            color={theme.colors.onSurfaceVariant}
            style={styles.adIcon}
          />
          <Text
            variant="bodyMedium"
            style={[styles.adPlaceholderText, { color: theme.colors.onSurfaceVariant }]}
          >
            Ad Space (Free Users)
          </Text>
          <Text
            variant="bodySmall"
            style={[styles.adPlaceholderSubtext, { color: theme.colors.onSurfaceVariant }]}
          >
            Configure AdMob to display ads
          </Text>
        </View>
      )}

      {/* Show upgrade prompt if ad failed or as fallback */}
      {(adError || __DEV__) && renderUpgradePrompt()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  adPlaceholder: {
    width: '100%',
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  adIcon: {
    marginBottom: 8,
  },
  adPlaceholderText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  adPlaceholderSubtext: {
    marginTop: 4,
    textAlign: 'center',
  },
  upgradePrompt: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginTop: 8,
  },
  upgradeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  crownIcon: {
    marginRight: 12,
  },
  upgradeText: {
    flex: 1,
  },
  upgradeTitle: {
    fontWeight: '600',
  },
  upgradeSubtitle: {
    marginTop: 2,
  },
  upgradeButton: {
    marginLeft: 12,
  },
});
