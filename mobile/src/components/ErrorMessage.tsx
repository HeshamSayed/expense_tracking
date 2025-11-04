import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, useTheme, Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export type ErrorType = 'network' | 'server' | 'validation' | 'permission' | 'notfound' | 'generic';

interface ErrorMessageProps {
  visible?: boolean;
  type?: ErrorType;
  title?: string;
  message?: string;
  error?: Error | string;
  onRetry?: () => void;
  onDismiss?: () => void;
  retryLabel?: string;
  dismissLabel?: string;
  showIcon?: boolean;
  variant?: 'inline' | 'card' | 'fullscreen';
  testID?: string;
}

export default function ErrorMessage({
  visible = true,
  type = 'generic',
  title,
  message,
  error,
  onRetry,
  onDismiss,
  retryLabel = 'Try Again',
  dismissLabel = 'Dismiss',
  showIcon = true,
  variant = 'card',
  testID = 'error-message',
}: ErrorMessageProps) {
  const theme = useTheme();

  if (!visible) return null;

  // Get error configuration based on type
  const getErrorConfig = () => {
    const configs = {
      network: {
        icon: 'wifi-off',
        defaultTitle: 'Connection Error',
        defaultMessage: 'Unable to connect to the server. Please check your internet connection and try again.',
        color: theme.colors.error,
      },
      server: {
        icon: 'server-off',
        defaultTitle: 'Server Error',
        defaultMessage: 'Something went wrong on our end. Please try again later.',
        color: theme.colors.error,
      },
      validation: {
        icon: 'alert-circle',
        defaultTitle: 'Invalid Input',
        defaultMessage: 'Please check your input and try again.',
        color: '#FF9800',
      },
      permission: {
        icon: 'lock-alert',
        defaultTitle: 'Permission Denied',
        defaultMessage: 'You don\'t have permission to access this resource.',
        color: '#FF9800',
      },
      notfound: {
        icon: 'file-question',
        defaultTitle: 'Not Found',
        defaultMessage: 'The requested resource could not be found.',
        color: theme.colors.onSurfaceVariant,
      },
      generic: {
        icon: 'alert',
        defaultTitle: 'Error',
        defaultMessage: 'An unexpected error occurred. Please try again.',
        color: theme.colors.error,
      },
    };
    return configs[type];
  };

  const config = getErrorConfig();

  // Extract error message from Error object or string
  const getErrorMessage = (): string => {
    if (message) return message;
    if (error) {
      if (typeof error === 'string') return error;
      if (error instanceof Error) return error.message;
    }
    return config.defaultMessage;
  };

  const errorTitle = title || config.defaultTitle;
  const errorMessage = getErrorMessage();

  const renderContent = () => (
    <View style={styles.content}>
      {showIcon && (
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: config.color + '20' },
          ]}
        >
          <Icon name={config.icon} size={48} color={config.color} />
        </View>
      )}

      <Text
        variant="titleLarge"
        style={[styles.title, { color: theme.colors.onSurface }]}
      >
        {errorTitle}
      </Text>

      <Text
        variant="bodyMedium"
        style={[styles.message, { color: theme.colors.onSurfaceVariant }]}
      >
        {errorMessage}
      </Text>

      {/* Action Buttons */}
      {(onRetry || onDismiss) && (
        <View style={styles.actions}>
          {onRetry && (
            <Button
              mode="contained"
              onPress={onRetry}
              style={styles.button}
              icon="refresh"
            >
              {retryLabel}
            </Button>
          )}
          {onDismiss && (
            <Button
              mode={onRetry ? 'outlined' : 'contained'}
              onPress={onDismiss}
              style={styles.button}
            >
              {dismissLabel}
            </Button>
          )}
        </View>
      )}

      {/* Show error details in dev mode */}
      {__DEV__ && error instanceof Error && error.stack && (
        <View style={[styles.debugInfo, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text
            variant="labelSmall"
            style={[styles.debugTitle, { color: theme.colors.onSurfaceVariant }]}
          >
            Debug Info:
          </Text>
          <Text
            variant="bodySmall"
            style={[styles.debugText, { color: theme.colors.onSurfaceVariant }]}
            numberOfLines={5}
          >
            {error.stack}
          </Text>
        </View>
      )}
    </View>
  );

  // Render variants
  switch (variant) {
    case 'fullscreen':
      return (
        <View
          style={[styles.fullscreenContainer, { backgroundColor: theme.colors.background }]}
          testID={testID}
        >
          {renderContent()}
        </View>
      );

    case 'card':
      return (
        <Card
          style={[styles.card, { backgroundColor: theme.colors.surface }]}
          mode="elevated"
          elevation={2}
          testID={testID}
        >
          <Card.Content>{renderContent()}</Card.Content>
        </Card>
      );

    case 'inline':
    default:
      return (
        <View
          style={[styles.inlineContainer, { backgroundColor: theme.colors.errorContainer }]}
          testID={testID}
        >
          {renderContent()}
        </View>
      );
  }
}

// Convenience components for specific error types
export const NetworkError = (props: Omit<ErrorMessageProps, 'type'>) => (
  <ErrorMessage {...props} type="network" />
);

export const ServerError = (props: Omit<ErrorMessageProps, 'type'>) => (
  <ErrorMessage {...props} type="server" />
);

export const ValidationError = (props: Omit<ErrorMessageProps, 'type'>) => (
  <ErrorMessage {...props} type="validation" />
);

export const PermissionError = (props: Omit<ErrorMessageProps, 'type'>) => (
  <ErrorMessage {...props} type="permission" />
);

export const NotFoundError = (props: Omit<ErrorMessageProps, 'type'>) => (
  <ErrorMessage {...props} type="notfound" />
);

const styles = StyleSheet.create({
  fullscreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    margin: 16,
  },
  inlineContainer: {
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
  },
  button: {
    minWidth: 120,
  },
  debugInfo: {
    marginTop: 24,
    padding: 12,
    borderRadius: 8,
    width: '100%',
  },
  debugTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  debugText: {
    fontFamily: 'monospace',
    fontSize: 10,
  },
});
