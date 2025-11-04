import React from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';

interface LoadingSpinnerProps {
  visible?: boolean;
  message?: string;
  size?: 'small' | 'large' | number;
  color?: string;
  overlay?: boolean;
  fullScreen?: boolean;
  testID?: string;
}

export default function LoadingSpinner({
  visible = true,
  message,
  size = 'large',
  color,
  overlay = false,
  fullScreen = false,
  testID = 'loading-spinner',
}: LoadingSpinnerProps) {
  const theme = useTheme();

  if (!visible) return null;

  const spinnerColor = color || theme.colors.primary;

  const renderSpinner = () => (
    <View style={styles.spinnerContainer}>
      <View
        style={[
          styles.spinnerContent,
          overlay && {
            backgroundColor: theme.colors.surface,
            padding: 24,
            borderRadius: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          },
        ]}
      >
        <ActivityIndicator
          animating={true}
          size={size}
          color={spinnerColor}
          testID={testID}
        />
        {message && (
          <Text
            variant="bodyMedium"
            style={[
              styles.message,
              { color: theme.colors.onSurface },
            ]}
          >
            {message}
          </Text>
        )}
      </View>
    </View>
  );

  // Full screen modal overlay
  if (fullScreen) {
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        statusBarTranslucent
      >
        <View
          style={[
            styles.fullScreenContainer,
            { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
          ]}
        >
          {renderSpinner()}
        </View>
      </Modal>
    );
  }

  // Overlay (without modal)
  if (overlay) {
    return (
      <View style={styles.overlayContainer}>
        {renderSpinner()}
      </View>
    );
  }

  // Inline spinner
  return renderSpinner();
}

// Convenience components for common use cases
export const CenteredLoadingSpinner = (
  props: Omit<LoadingSpinnerProps, 'overlay'>
) => <LoadingSpinner {...props} overlay={false} />;

export const OverlayLoadingSpinner = (
  props: Omit<LoadingSpinnerProps, 'overlay' | 'fullScreen'>
) => <LoadingSpinner {...props} overlay={true} fullScreen={false} />;

export const FullScreenLoadingSpinner = (
  props: Omit<LoadingSpinnerProps, 'overlay' | 'fullScreen'>
) => <LoadingSpinner {...props} overlay={true} fullScreen={true} />;

const styles = StyleSheet.create({
  spinnerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  spinnerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 9999,
  },
});
