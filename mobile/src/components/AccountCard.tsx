import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit_card' | 'cash' | 'investment' | 'other';
  balance: number;
  currency: string;
  icon?: string;
  color?: string;
  institution?: string;
  lastFourDigits?: string;
  isDefault?: boolean;
}

interface AccountCardProps {
  account: Account;
  onPress?: () => void;
  onLongPress?: () => void;
  showBalance?: boolean;
}

export default function AccountCard({
  account,
  onPress,
  onLongPress,
  showBalance = true,
}: AccountCardProps) {
  const theme = useTheme();

  const getAccountIcon = (type: Account['type']): string => {
    const icons = {
      checking: 'bank',
      savings: 'piggy-bank',
      credit_card: 'credit-card',
      cash: 'cash',
      investment: 'chart-line',
      other: 'wallet',
    };
    return account.icon || icons[type] || 'wallet';
  };

  const getAccountColor = (type: Account['type']): string => {
    if (account.color) return account.color;

    const colors = {
      checking: theme.colors.primary,
      savings: '#4CAF50',
      credit_card: '#FF9800',
      cash: '#9C27B0',
      investment: '#2196F3',
      other: theme.colors.secondary,
    };
    return colors[type] || theme.colors.primary;
  };

  const formatAccountType = (type: Account['type']): string => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatBalance = (balance: number, currency: string) => {
    const isNegative = balance < 0;
    const absoluteBalance = Math.abs(balance);
    const formattedAmount = `${currency} ${absoluteBalance.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
    return isNegative ? `-${formattedAmount}` : formattedAmount;
  };

  const getBalanceColor = () => {
    if (account.type === 'credit_card') {
      // For credit cards, negative balance is good (you're owed money)
      return account.balance < 0 ? theme.colors.primary : theme.colors.error;
    }
    // For other accounts, negative balance is bad
    return account.balance < 0 ? theme.colors.error : theme.colors.primary;
  };

  const accountColor = getAccountColor(account.type);

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      disabled={!onPress && !onLongPress}
    >
      <Card style={styles.card} mode="elevated" elevation={2}>
        <Card.Content style={styles.content}>
          {/* Header with Icon and Default Badge */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: accountColor + '20' },
                ]}
              >
                <Icon
                  name={getAccountIcon(account.type)}
                  size={28}
                  color={accountColor}
                />
              </View>
              <View style={styles.accountInfo}>
                <View style={styles.nameRow}>
                  <Text variant="titleMedium" style={styles.accountName}>
                    {account.name}
                  </Text>
                  {account.isDefault && (
                    <View
                      style={[
                        styles.defaultBadge,
                        { backgroundColor: theme.colors.primaryContainer },
                      ]}
                    >
                      <Text
                        variant="labelSmall"
                        style={[
                          styles.defaultText,
                          { color: theme.colors.onPrimaryContainer },
                        ]}
                      >
                        Default
                      </Text>
                    </View>
                  )}
                </View>
                <Text
                  variant="bodySmall"
                  style={[styles.accountType, { color: theme.colors.onSurfaceVariant }]}
                >
                  {formatAccountType(account.type)}
                </Text>
              </View>
            </View>
          </View>

          {/* Institution and Account Number */}
          {(account.institution || account.lastFourDigits) && (
            <View style={styles.detailsRow}>
              {account.institution && (
                <Text
                  variant="bodySmall"
                  style={[styles.institution, { color: theme.colors.onSurfaceVariant }]}
                >
                  {account.institution}
                </Text>
              )}
              {account.lastFourDigits && (
                <Text
                  variant="bodySmall"
                  style={[styles.accountNumber, { color: theme.colors.onSurfaceVariant }]}
                >
                  •••• {account.lastFourDigits}
                </Text>
              )}
            </View>
          )}

          {/* Balance */}
          {showBalance && (
            <View style={styles.balanceContainer}>
              <Text
                variant="bodySmall"
                style={[styles.balanceLabel, { color: theme.colors.onSurfaceVariant }]}
              >
                Current Balance
              </Text>
              <Text
                variant="headlineSmall"
                style={[styles.balance, { color: getBalanceColor() }]}
              >
                {formatBalance(account.balance, account.currency)}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  content: {
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  accountName: {
    fontWeight: '600',
    marginRight: 8,
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  defaultText: {
    fontWeight: '600',
  },
  accountType: {
    marginTop: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
  },
  institution: {
    flex: 1,
  },
  accountNumber: {
    marginLeft: 8,
  },
  balanceContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
  },
  balanceLabel: {
    marginBottom: 4,
  },
  balance: {
    fontWeight: 'bold',
  },
});
