import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';

export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  currency: string;
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  account: {
    id: string;
    name: string;
  };
  description?: string;
  date: string | Date;
  recurring?: boolean;
}

interface TransactionCardProps {
  transaction: Transaction;
  onPress?: () => void;
  onLongPress?: () => void;
  showAccount?: boolean;
}

export default function TransactionCard({
  transaction,
  onPress,
  onLongPress,
  showAccount = true,
}: TransactionCardProps) {
  const theme = useTheme();

  const getAmountColor = () => {
    switch (transaction.type) {
      case 'income':
        return theme.colors.primary;
      case 'expense':
        return theme.colors.error;
      case 'transfer':
        return theme.colors.tertiary;
      default:
        return theme.colors.onSurface;
    }
  };

  const getAmountPrefix = () => {
    switch (transaction.type) {
      case 'income':
        return '+';
      case 'expense':
        return '-';
      case 'transfer':
        return '';
      default:
        return '';
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return `${getAmountPrefix()}${currency} ${amount.toFixed(2)}`;
  };

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'MMM dd, yyyy');
  };

  const formatTime = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'hh:mm a');
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      disabled={!onPress && !onLongPress}
    >
      <Card style={styles.card} mode="elevated" elevation={1}>
        <Card.Content style={styles.content}>
          {/* Left: Icon and Category */}
          <View style={styles.leftSection}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: transaction.category.color + '20' },
              ]}
            >
              <Icon
                name={transaction.category.icon}
                size={24}
                color={transaction.category.color}
              />
            </View>
            <View style={styles.categoryInfo}>
              <View style={styles.categoryRow}>
                <Text variant="titleMedium" style={styles.categoryName}>
                  {transaction.category.name}
                </Text>
                {transaction.recurring && (
                  <Icon
                    name="refresh"
                    size={16}
                    color={theme.colors.primary}
                    style={styles.recurringIcon}
                  />
                )}
              </View>
              {transaction.description && (
                <Text
                  variant="bodySmall"
                  style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
                  numberOfLines={1}
                >
                  {transaction.description}
                </Text>
              )}
              {showAccount && (
                <Text
                  variant="bodySmall"
                  style={[styles.accountName, { color: theme.colors.onSurfaceVariant }]}
                  numberOfLines={1}
                >
                  {transaction.account.name}
                </Text>
              )}
            </View>
          </View>

          {/* Right: Amount and Date */}
          <View style={styles.rightSection}>
            <Text
              variant="titleMedium"
              style={[styles.amount, { color: getAmountColor() }]}
            >
              {formatAmount(transaction.amount, transaction.currency)}
            </Text>
            <Text
              variant="bodySmall"
              style={[styles.date, { color: theme.colors.onSurfaceVariant }]}
            >
              {formatDate(transaction.date)}
            </Text>
            <Text
              variant="bodySmall"
              style={[styles.time, { color: theme.colors.onSurfaceVariant }]}
            >
              {formatTime(transaction.date)}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryName: {
    fontWeight: '600',
  },
  recurringIcon: {
    marginLeft: 6,
  },
  description: {
    marginTop: 2,
  },
  accountName: {
    marginTop: 2,
    fontSize: 11,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  date: {
    marginTop: 4,
  },
  time: {
    marginTop: 2,
    fontSize: 11,
  },
});
