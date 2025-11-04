import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, ProgressBar, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';

export interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  currency: string;
  category?: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  startDate: string | Date;
  endDate: string | Date;
  isActive: boolean;
  alertThreshold?: number; // Percentage at which to show alert (e.g., 80)
}

interface BudgetProgressCardProps {
  budget: Budget;
  onPress?: () => void;
  onLongPress?: () => void;
  compact?: boolean;
}

export default function BudgetProgressCard({
  budget,
  onPress,
  onLongPress,
  compact = false,
}: BudgetProgressCardProps) {
  const theme = useTheme();

  const calculateProgress = () => {
    if (budget.amount === 0) return 0;
    return Math.min(budget.spent / budget.amount, 1); // Cap at 100%
  };

  const calculatePercentage = () => {
    return Math.round(calculateProgress() * 100);
  };

  const getRemainingAmount = () => {
    return budget.amount - budget.spent;
  };

  const getProgressColor = () => {
    const percentage = calculatePercentage();
    const threshold = budget.alertThreshold || 80;

    if (percentage >= 100) {
      return theme.colors.error;
    } else if (percentage >= threshold) {
      return '#FF9800'; // Warning orange
    } else if (percentage >= threshold * 0.75) {
      return '#FFC107'; // Caution yellow
    } else {
      return theme.colors.primary;
    }
  };

  const getStatusIcon = () => {
    const percentage = calculatePercentage();

    if (percentage >= 100) {
      return 'alert-circle';
    } else if (percentage >= (budget.alertThreshold || 80)) {
      return 'alert';
    } else {
      return 'check-circle';
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return `${currency} ${Math.abs(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatPeriod = (period: Budget['period']) => {
    return period.charAt(0).toUpperCase() + period.slice(1);
  };

  const formatDateRange = (startDate: string | Date, endDate: string | Date) => {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    return `${format(start, 'MMM dd')} - ${format(end, 'MMM dd, yyyy')}`;
  };

  const getDaysRemaining = () => {
    const end = typeof budget.endDate === 'string' ? new Date(budget.endDate) : budget.endDate;
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const progressColor = getProgressColor();
  const percentage = calculatePercentage();
  const remaining = getRemainingAmount();
  const daysRemaining = getDaysRemaining();

  if (compact) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.7}
        disabled={!onPress && !onLongPress}
      >
        <Card style={styles.compactCard} mode="outlined">
          <Card.Content style={styles.compactContent}>
            <View style={styles.compactHeader}>
              {budget.category && (
                <View
                  style={[
                    styles.compactIcon,
                    { backgroundColor: budget.category.color + '20' },
                  ]}
                >
                  <Icon
                    name={budget.category.icon}
                    size={20}
                    color={budget.category.color}
                  />
                </View>
              )}
              <Text variant="titleSmall" style={styles.compactTitle} numberOfLines={1}>
                {budget.name}
              </Text>
              <Icon name={getStatusIcon()} size={20} color={progressColor} />
            </View>
            <ProgressBar
              progress={calculateProgress()}
              color={progressColor}
              style={styles.compactProgress}
            />
            <View style={styles.compactFooter}>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {formatAmount(budget.spent, budget.currency)} / {formatAmount(budget.amount, budget.currency)}
              </Text>
              <Text
                variant="bodySmall"
                style={{ color: progressColor, fontWeight: '600' }}
              >
                {percentage}%
              </Text>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      disabled={!onPress && !onLongPress}
    >
      <Card style={styles.card} mode="elevated" elevation={2}>
        <Card.Content style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {budget.category && (
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: budget.category.color + '20' },
                  ]}
                >
                  <Icon
                    name={budget.category.icon}
                    size={24}
                    color={budget.category.color}
                  />
                </View>
              )}
              <View style={styles.budgetInfo}>
                <Text variant="titleMedium" style={styles.budgetName}>
                  {budget.name}
                </Text>
                <Text
                  variant="bodySmall"
                  style={[styles.period, { color: theme.colors.onSurfaceVariant }]}
                >
                  {formatPeriod(budget.period)} Budget
                </Text>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: progressColor + '20' }]}>
              <Icon name={getStatusIcon()} size={20} color={progressColor} />
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Progress
              </Text>
              <Text
                variant="titleMedium"
                style={[styles.percentage, { color: progressColor }]}
              >
                {percentage}%
              </Text>
            </View>
            <ProgressBar
              progress={calculateProgress()}
              color={progressColor}
              style={styles.progressBar}
            />
          </View>

          {/* Amounts */}
          <View style={styles.amountsSection}>
            <View style={styles.amountItem}>
              <Text
                variant="bodySmall"
                style={[styles.amountLabel, { color: theme.colors.onSurfaceVariant }]}
              >
                Spent
              </Text>
              <Text variant="titleMedium" style={styles.amountValue}>
                {formatAmount(budget.spent, budget.currency)}
              </Text>
            </View>
            <View style={styles.amountDivider} />
            <View style={styles.amountItem}>
              <Text
                variant="bodySmall"
                style={[styles.amountLabel, { color: theme.colors.onSurfaceVariant }]}
              >
                {remaining >= 0 ? 'Remaining' : 'Over Budget'}
              </Text>
              <Text
                variant="titleMedium"
                style={[
                  styles.amountValue,
                  { color: remaining >= 0 ? theme.colors.primary : theme.colors.error },
                ]}
              >
                {formatAmount(remaining, budget.currency)}
              </Text>
            </View>
            <View style={styles.amountDivider} />
            <View style={styles.amountItem}>
              <Text
                variant="bodySmall"
                style={[styles.amountLabel, { color: theme.colors.onSurfaceVariant }]}
              >
                Budget
              </Text>
              <Text variant="titleMedium" style={styles.amountValue}>
                {formatAmount(budget.amount, budget.currency)}
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text
              variant="bodySmall"
              style={[styles.dateRange, { color: theme.colors.onSurfaceVariant }]}
            >
              {formatDateRange(budget.startDate, budget.endDate)}
            </Text>
            {daysRemaining >= 0 && (
              <Text
                variant="bodySmall"
                style={[styles.daysRemaining, { color: theme.colors.onSurfaceVariant }]}
              >
                {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
              </Text>
            )}
          </View>
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
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  budgetInfo: {
    flex: 1,
  },
  budgetName: {
    fontWeight: '600',
  },
  period: {
    marginTop: 2,
  },
  statusBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  percentage: {
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  amountsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  amountItem: {
    flex: 1,
    alignItems: 'center',
  },
  amountLabel: {
    marginBottom: 4,
  },
  amountValue: {
    fontWeight: '600',
    fontSize: 14,
  },
  amountDivider: {
    width: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    marginHorizontal: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateRange: {},
  daysRemaining: {
    fontWeight: '600',
  },
  // Compact styles
  compactCard: {
    marginHorizontal: 16,
    marginVertical: 4,
  },
  compactContent: {
    paddingVertical: 12,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  compactIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  compactTitle: {
    flex: 1,
    fontWeight: '600',
  },
  compactProgress: {
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
  },
  compactFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
