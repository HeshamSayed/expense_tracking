import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type DashboardScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

interface Account {
  id: string;
  name: string;
  balance: number;
  currency: string;
}

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  account: string;
  date: string;
  description?: string;
}

interface Budget {
  id: string;
  name: string;
  category: string;
  limit: number;
  spent: number;
  period: 'weekly' | 'monthly' | 'yearly';
}

interface DashboardData {
  totalBalance: number;
  currency: string;
  accounts: Account[];
  recentTransactions: Transaction[];
  budgets: Budget[];
  monthlyIncome: number;
  monthlyExpenses: number;
}

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isProUser, setIsProUser] = useState<boolean>(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setError(null);
      // TODO: Replace with actual API call
      // const response = await fetch('API_ENDPOINT/dashboard');
      // const data = await response.json();

      // Mock data for now
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockData: DashboardData = {
        totalBalance: 15420.50,
        currency: 'USD',
        accounts: [
          { id: '1', name: 'Cash', balance: 500.00, currency: 'USD' },
          { id: '2', name: 'Bank Account', balance: 12420.50, currency: 'USD' },
          { id: '3', name: 'Credit Card', balance: 2500.00, currency: 'USD' },
        ],
        recentTransactions: [
          {
            id: '1',
            amount: 50.00,
            type: 'expense',
            category: 'Food',
            account: 'Cash',
            date: '2025-11-04',
            description: 'Grocery shopping'
          },
          {
            id: '2',
            amount: 3000.00,
            type: 'income',
            category: 'Salary',
            account: 'Bank Account',
            date: '2025-11-01',
            description: 'Monthly salary'
          },
          {
            id: '3',
            amount: 120.00,
            type: 'expense',
            category: 'Transportation',
            account: 'Credit Card',
            date: '2025-11-03',
            description: 'Gas'
          },
        ],
        budgets: [
          {
            id: '1',
            name: 'Food Budget',
            category: 'Food',
            limit: 500.00,
            spent: 250.00,
            period: 'monthly'
          },
          {
            id: '2',
            name: 'Entertainment',
            category: 'Entertainment',
            limit: 200.00,
            spent: 180.00,
            period: 'monthly'
          },
        ],
        monthlyIncome: 3500.00,
        monthlyExpenses: 1250.00,
      };

      setDashboardData(mockData);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getBudgetProgress = (budget: Budget): number => {
    return (budget.spent / budget.limit) * 100;
  };

  const getBudgetColor = (progress: number): string => {
    if (progress >= 100) return '#E74C3C';
    if (progress >= 80) return '#F39C12';
    return '#27AE60';
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadDashboardData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Balance Summary Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceAmount}>
          {formatCurrency(dashboardData.totalBalance, dashboardData.currency)}
        </Text>
        <View style={styles.monthlyStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Income</Text>
            <Text style={[styles.statAmount, styles.incomeText]}>
              {formatCurrency(dashboardData.monthlyIncome)}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Expenses</Text>
            <Text style={[styles.statAmount, styles.expenseText]}>
              {formatCurrency(dashboardData.monthlyExpenses)}
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryAction]}
            onPress={() => navigation.navigate('AddTransaction')}
          >
            <Text style={styles.actionIcon}>+</Text>
            <Text style={styles.actionText}>Add Transaction</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Reports')}
          >
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionText}>View Reports</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Accounts Summary */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Accounts</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Accounts')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        {dashboardData.accounts.map((account) => (
          <View key={account.id} style={styles.accountCard}>
            <Text style={styles.accountName}>{account.name}</Text>
            <Text style={styles.accountBalance}>
              {formatCurrency(account.balance, account.currency)}
            </Text>
          </View>
        ))}
      </View>

      {/* Budget Progress */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Budget Progress</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Budgets')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        {dashboardData.budgets.map((budget) => {
          const progress = getBudgetProgress(budget);
          const color = getBudgetColor(progress);
          return (
            <View key={budget.id} style={styles.budgetCard}>
              <View style={styles.budgetHeader}>
                <Text style={styles.budgetName}>{budget.name}</Text>
                <Text style={styles.budgetAmount}>
                  {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${Math.min(progress, 100)}%`, backgroundColor: color },
                  ]}
                />
              </View>
              <Text style={styles.budgetPercentage}>{progress.toFixed(0)}% used</Text>
            </View>
          );
        })}
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        {dashboardData.recentTransactions.map((transaction) => (
          <TouchableOpacity
            key={transaction.id}
            style={styles.transactionCard}
            onPress={() => {
              // TODO: Navigate to transaction details
              Alert.alert('Transaction Details', `ID: ${transaction.id}`);
            }}
          >
            <View style={styles.transactionLeft}>
              <View
                style={[
                  styles.transactionIcon,
                  transaction.type === 'income' ? styles.incomeIcon : styles.expenseIcon,
                ]}
              >
                <Text style={styles.transactionIconText}>
                  {transaction.type === 'income' ? '↑' : '↓'}
                </Text>
              </View>
              <View>
                <Text style={styles.transactionCategory}>{transaction.category}</Text>
                <Text style={styles.transactionDescription}>
                  {transaction.description || transaction.account}
                </Text>
              </View>
            </View>
            <View style={styles.transactionRight}>
              <Text
                style={[
                  styles.transactionAmount,
                  transaction.type === 'income' ? styles.incomeText : styles.expenseText,
                ]}
              >
                {transaction.type === 'income' ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </Text>
              <Text style={styles.transactionDate}>
                {new Date(transaction.date).toLocaleDateString()}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* AdMob Banner for Free Users */}
      {!isProUser && (
        <View style={styles.adContainer}>
          <Text style={styles.adPlaceholder}>AdMob Banner Placeholder</Text>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.upgradeButtonText}>Remove Ads - Upgrade to Pro</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#7F8C8D',
  },
  errorText: {
    fontSize: 16,
    color: '#E74C3C',
    marginBottom: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  retryButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  balanceCard: {
    backgroundColor: '#4A90E2',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  monthlyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 4,
  },
  statAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#FFFFFF',
    opacity: 0.3,
    marginHorizontal: 16,
  },
  incomeText: {
    color: '#27AE60',
  },
  expenseText: {
    color: '#E74C3C',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  seeAllText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryAction: {
    backgroundColor: '#27AE60',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  accountCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  budgetCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  budgetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  budgetAmount: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#ECF0F1',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  budgetPercentage: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'right',
  },
  transactionCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  incomeIcon: {
    backgroundColor: '#D5F4E6',
  },
  expenseIcon: {
    backgroundColor: '#FADBD8',
  },
  transactionIconText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  transactionDescription: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  adContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECF0F1',
  },
  adPlaceholder: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 12,
  },
  upgradeButton: {
    backgroundColor: '#F39C12',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 24,
  },
});

export default DashboardScreen;
