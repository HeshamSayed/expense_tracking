import { Platform } from 'react-native';
import MobileAds, {
  BannerAd,
  BannerAdSize,
  TestIds,
  InterstitialAd,
  RewardedAd,
  RewardedAdEventType,
  AdEventType,
} from 'react-native-google-mobile-ads';
import { AdConfig, AdResult } from '../types';

/**
 * AdMob Service
 *
 * Handles all AdMob advertising functionality:
 * - Initialize AdMob
 * - Show banner ads
 * - Show interstitial ads
 * - Show rewarded ads
 * - Manage ad loading and error handling
 */

// AdMob configuration
// TODO: Replace with your actual AdMob ad unit IDs
const AD_CONFIG: AdConfig = {
  // Banner Ad IDs
  bannerId: __DEV__
    ? TestIds.BANNER
    : Platform.select({
        ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
        android: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
      }) || TestIds.BANNER,

  // Interstitial Ad IDs
  interstitialId: __DEV__
    ? TestIds.INTERSTITIAL
    : Platform.select({
        ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
        android: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
      }) || TestIds.INTERSTITIAL,

  // Rewarded Ad IDs
  rewardedId: __DEV__
    ? TestIds.REWARDED
    : Platform.select({
        ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
        android: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
      }) || TestIds.REWARDED,

  // Test device IDs (for testing on real devices)
  testDeviceIds: __DEV__ ? ['EMULATOR'] : [],
};

class AdService {
  private interstitialAd: InterstitialAd | null = null;
  private rewardedAd: RewardedAd | null = null;
  private isInitialized = false;
  private interstitialLoaded = false;
  private rewardedLoaded = false;

  /**
   * Initialize AdMob
   * Call this once when the app starts
   */
  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) {
        console.log('AdMob already initialized');
        return true;
      }

      // Initialize Mobile Ads SDK
      await MobileAds().initialize();

      // Set request configuration for test devices
      if (__DEV__ && AD_CONFIG.testDeviceIds) {
        await MobileAds().setRequestConfiguration({
          testDeviceIdentifiers: AD_CONFIG.testDeviceIds,
        });
      }

      this.isInitialized = true;
      console.log('AdMob initialized successfully');

      // Preload interstitial and rewarded ads
      this.loadInterstitialAd();
      this.loadRewardedAd();

      return true;
    } catch (error) {
      console.error('AdMob initialization error:', error);
      return false;
    }
  }

  /**
   * Check if AdMob is initialized
   */
  isAdMobInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get banner ad unit ID
   */
  getBannerId(): string {
    return AD_CONFIG.bannerId;
  }

  /**
   * Get banner ad size
   */
  getBannerSize(): BannerAdSize {
    return BannerAdSize.ANCHORED_ADAPTIVE_BANNER;
  }

  /**
   * Load interstitial ad
   */
  private loadInterstitialAd(): void {
    try {
      this.interstitialAd = InterstitialAd.createForAdRequest(
        AD_CONFIG.interstitialId
      );

      // Set up event listeners
      this.interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
        console.log('Interstitial ad loaded');
        this.interstitialLoaded = true;
      });

      this.interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
        console.log('Interstitial ad closed');
        this.interstitialLoaded = false;
        // Preload next ad
        this.loadInterstitialAd();
      });

      this.interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
        console.error('Interstitial ad error:', error);
        this.interstitialLoaded = false;
      });

      // Load the ad
      this.interstitialAd.load();
    } catch (error) {
      console.error('Error loading interstitial ad:', error);
      this.interstitialLoaded = false;
    }
  }

  /**
   * Show interstitial ad
   */
  async showInterstitialAd(): Promise<AdResult> {
    try {
      if (!this.isInitialized) {
        throw new Error('AdMob not initialized');
      }

      if (!this.interstitialLoaded || !this.interstitialAd) {
        console.log('Interstitial ad not loaded yet');
        // Try to load it now
        this.loadInterstitialAd();
        return {
          type: 'interstitial',
          isLoaded: false,
          error: 'Ad not loaded yet',
        };
      }

      await this.interstitialAd.show();

      return {
        type: 'interstitial',
        isLoaded: true,
      };
    } catch (error) {
      console.error('Error showing interstitial ad:', error);
      return {
        type: 'interstitial',
        isLoaded: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if interstitial ad is loaded
   */
  isInterstitialLoaded(): boolean {
    return this.interstitialLoaded;
  }

  /**
   * Load rewarded ad
   */
  private loadRewardedAd(): void {
    try {
      this.rewardedAd = RewardedAd.createForAdRequest(AD_CONFIG.rewardedId);

      // Set up event listeners
      this.rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
        console.log('Rewarded ad loaded');
        this.rewardedLoaded = true;
      });

      this.rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
        console.log('User earned reward:', reward);
      });

      this.rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
        console.log('Rewarded ad closed');
        this.rewardedLoaded = false;
        // Preload next ad
        this.loadRewardedAd();
      });

      this.rewardedAd.addAdEventListener(AdEventType.ERROR, (error) => {
        console.error('Rewarded ad error:', error);
        this.rewardedLoaded = false;
      });

      // Load the ad
      this.rewardedAd.load();
    } catch (error) {
      console.error('Error loading rewarded ad:', error);
      this.rewardedLoaded = false;
    }
  }

  /**
   * Show rewarded ad
   */
  async showRewardedAd(
    onReward?: (reward: { type: string; amount: number }) => void
  ): Promise<AdResult> {
    try {
      if (!this.isInitialized) {
        throw new Error('AdMob not initialized');
      }

      if (!this.rewardedLoaded || !this.rewardedAd) {
        console.log('Rewarded ad not loaded yet');
        // Try to load it now
        this.loadRewardedAd();
        return {
          type: 'rewarded',
          isLoaded: false,
          error: 'Ad not loaded yet',
        };
      }

      // Add reward listener if provided
      if (onReward) {
        const unsubscribe = this.rewardedAd.addAdEventListener(
          RewardedAdEventType.EARNED_REWARD,
          (reward) => {
            onReward(reward);
            unsubscribe();
          }
        );
      }

      await this.rewardedAd.show();

      return {
        type: 'rewarded',
        isLoaded: true,
      };
    } catch (error) {
      console.error('Error showing rewarded ad:', error);
      return {
        type: 'rewarded',
        isLoaded: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if rewarded ad is loaded
   */
  isRewardedLoaded(): boolean {
    return this.rewardedLoaded;
  }

  /**
   * Preload all ads
   */
  preloadAds(): void {
    if (!this.isInitialized) {
      console.warn('Cannot preload ads: AdMob not initialized');
      return;
    }

    if (!this.interstitialLoaded) {
      this.loadInterstitialAd();
    }

    if (!this.rewardedLoaded) {
      this.loadRewardedAd();
    }
  }

  /**
   * Get ad configuration
   */
  getAdConfig(): AdConfig {
    return AD_CONFIG;
  }

  /**
   * Open ad inspector (for testing)
   * Only available in development mode
   */
  async openAdInspector(): Promise<void> {
    if (!__DEV__) {
      console.warn('Ad Inspector only available in development mode');
      return;
    }

    try {
      await MobileAds().openAdInspector();
    } catch (error) {
      console.error('Error opening ad inspector:', error);
    }
  }
}

// Export singleton instance
export const adService = new AdService();

// Export the class for testing purposes
export default AdService;

// Export ad sizes and test IDs for use in components
export { BannerAdSize, TestIds };
