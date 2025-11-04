import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ProBadgeProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'outline' | 'flat';
  showIcon?: boolean;
  showText?: boolean;
  text?: string;
  color?: string;
  onPress?: () => void;
}

export default function ProBadge({
  size = 'medium',
  variant = 'default',
  showIcon = true,
  showText = true,
  text = 'PRO',
  color,
  onPress,
}: ProBadgeProps) {
  const theme = useTheme();

  // Get size configurations
  const getSizeConfig = () => {
    const configs = {
      small: {
        iconSize: 12,
        fontSize: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        height: 20,
      },
      medium: {
        iconSize: 16,
        fontSize: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        height: 24,
      },
      large: {
        iconSize: 20,
        fontSize: 14,
        paddingHorizontal: 12,
        paddingVertical: 6,
        height: 32,
      },
    };
    return configs[size];
  };

  const sizeConfig = getSizeConfig();

  // Determine colors based on variant
  const getColors = () => {
    const baseColor = color || '#FFD700'; // Gold color for Pro

    switch (variant) {
      case 'outline':
        return {
          backgroundColor: 'transparent',
          textColor: baseColor,
          borderColor: baseColor,
          borderWidth: 1.5,
        };
      case 'flat':
        return {
          backgroundColor: baseColor + '20',
          textColor: baseColor,
          borderColor: 'transparent',
          borderWidth: 0,
        };
      case 'default':
      default:
        return {
          backgroundColor: baseColor,
          textColor: '#000000',
          borderColor: 'transparent',
          borderWidth: 0,
        };
    }
  };

  const colors = getColors();

  // Render as Chip if onPress is provided
  if (onPress) {
    return (
      <Chip
        icon={showIcon ? () => <Icon name="crown" size={sizeConfig.iconSize} color={colors.textColor} /> : undefined}
        onPress={onPress}
        compact={size === 'small'}
        style={[
          styles.chip,
          {
            backgroundColor: colors.backgroundColor,
            borderColor: colors.borderColor,
            borderWidth: colors.borderWidth,
          },
        ]}
        textStyle={[
          styles.chipText,
          {
            color: colors.textColor,
            fontSize: sizeConfig.fontSize,
            fontWeight: '700',
          },
        ]}
      >
        {showText ? text : ''}
      </Chip>
    );
  }

  // Render as Badge
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
          borderWidth: colors.borderWidth,
          paddingHorizontal: sizeConfig.paddingHorizontal,
          paddingVertical: sizeConfig.paddingVertical,
          height: sizeConfig.height,
        },
      ]}
    >
      {showIcon && (
        <Icon
          name="crown"
          size={sizeConfig.iconSize}
          color={colors.textColor}
          style={showText ? styles.icon : undefined}
        />
      )}
      {showText && (
        <Text
          variant="labelSmall"
          style={[
            styles.badgeText,
            {
              color: colors.textColor,
              fontSize: sizeConfig.fontSize,
              fontWeight: '700',
              letterSpacing: 0.5,
            },
          ]}
        >
          {text}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },
  badgeText: {
    textTransform: 'uppercase',
  },
  chip: {
    alignSelf: 'flex-start',
  },
  chipText: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

// Export variants for convenience
export const ProBadgeSmall = (props: Omit<ProBadgeProps, 'size'>) => (
  <ProBadge {...props} size="small" />
);

export const ProBadgeMedium = (props: Omit<ProBadgeProps, 'size'>) => (
  <ProBadge {...props} size="medium" />
);

export const ProBadgeLarge = (props: Omit<ProBadgeProps, 'size'>) => (
  <ProBadge {...props} size="large" />
);

export const ProBadgeOutline = (props: Omit<ProBadgeProps, 'variant'>) => (
  <ProBadge {...props} variant="outline" />
);

export const ProBadgeFlat = (props: Omit<ProBadgeProps, 'variant'>) => (
  <ProBadge {...props} variant="flat" />
);
