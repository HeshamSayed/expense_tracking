import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type TransactionListScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Transactions'
>;

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  categoryIcon: string;
  account: string;
  date: string;
  description?: string;
}

interface FilterOptions {
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  category: string | null;
  account: string | null;
  searchQuery: string;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    amount: 50.00,
    type: 'expense',
    category: 'Food',
    categoryIcon: '🍔',
    account: 'Cash',
    date: '2025-11-04',
    description: 'Grocery shopping'
  },
  {
    id: '2',
    amount: 3000.00,
    type: 'income',
    category: 'Salary',
    categoryIcon: '💰',
    account: 'Bank Account',
    date: '2025-11-01',
    description: 'Monthly salary'
  },
  {
    id: '3',
    amount: 120.00,
    type: 'expense',
    category: 'Transportation',
    categoryIcon: '🚗',
    account: 'Credit Card',
    date: '2025-11-03',
    description: 'Gas'
  },
  {
    id: '4',
    amount: 75.50,
    type: 'expense',
    category: 'Entertainment',
    categoryIcon: '🎬',
    account: 'Credit Card',
    date: '2025-11-02',
    description: 'Movie tickets'
  },
  {
    id: '5',
    amount: 200.00,
    type: 'expense',
    category: 'Bills',
    categoryIcon: '💡',
    account: 'Bank Account',
    date: '2025-10-31',
    description: 'Electricity bill'
  },
];

const TransactionListScreen: React.FC = () => {
  const navigation = useNavigation<TransactionListScreenNavigationProp>();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);

  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: 'all',
    category: null,
    account: null,
    searchQuery: '',
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, filters]);

  const loadTransactions = async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (!append) {
        setLoading(true);
      }

      // TODO: Replace with actual API call
      // const response = await fetch(`API_ENDPOINT/transactions?page=${pageNum}`);
      // const data = await response.json();

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate pagination - return empty after page 2
      if (pageNum > 2) {
        setHasMore(false);
        setLoadingMore(false);
        return;
      }

      const newTransactions = append ? [...transactions, ...MOCK_TRANSACTIONS] : MOCK_TRANSACTIONS;
      setTransactions(newTransactions);
      setPage(pageNum);
      setLoading(false);
      setLoadingMore(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to load transactions');
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setHasMore(true);
    await loadTransactions(1, false);
    setRefreshing(false);
  }, []);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      loadTransactions(page + 1, true);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const transactionDay = new Date(
          transactionDate.getFullYear(),
          transactionDate.getMonth(),
          transactionDate.getDate()
        );

        switch (filters.dateRange) {
          case 'today':
            return transactionDay.getTime() === today.getTime();
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return transactionDate >= weekAgo;
          case 'month':
            return (
              transactionDate.getMonth() === now.getMonth() &&
              transactionDate.getFullYear() === now.getFullYear()
            );
          case 'year':
            return transactionDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(t => t.category === filters.category);
    }

    // Apply account filter
    if (filters.account) {
      filtered = filtered.filter(t => t.account === filters.account);
    }

    // Apply search filter
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        t =>
          t.category.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.account.toLowerCase().includes(query)
      );
    }

    setFilteredTransactions(filtered);
  };

  const handleDelete = (transaction: Transaction) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Replace with actual API call
              // await fetch(`API_ENDPOINT/transactions/${transaction.id}`, {
              //   method: 'DELETE',
              // });

              setTransactions(prev => prev.filter(t => t.id !== transaction.id));
              Alert.alert('Success', 'Transaction deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete transaction');
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TouchableOpacity
      style={styles.transactionCard}
      onLongPress={() => {
        Alert.alert(
          'Transaction Actions',
          '',
          [
            {
              text: 'Edit',
              onPress: () => {
                // TODO: Navigate to edit screen
                Alert.alert('Edit', 'Edit functionality to be implemented');
              },
            },
            {
              text: 'Delete',
              onPress: () => handleDelete(item),
              style: 'destructive',
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]
        );
      }}
    >
      <View style={styles.transactionLeft}>
        <View
          style={[
            styles.transactionIcon,
            item.type === 'income' ? styles.incomeIcon : styles.expenseIcon,
          ]}
        >
          <Text style={styles.categoryIcon}>{item.categoryIcon}</Text>
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionCategory}>{item.category}</Text>
          <Text style={styles.transactionDescription}>
            {item.description || item.account}
          </Text>
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text
          style={[
            styles.transactionAmount,
            item.type === 'income' ? styles.incomeText : styles.expenseText,
          ]}
        >
          {item.type === 'income' ? '+' : '-'}
          {formatCurrency(item.amount)}
        </Text>
        <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderListEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📊</Text>
        <Text style={styles.emptyText}>No transactions found</Text>
        <Text style={styles.emptySubtext}>
          {filters.searchQuery || filters.category || filters.account
            ? 'Try adjusting your filters'
            : 'Add your first transaction to get started'}
        </Text>
      </View>
    );
  };

  const renderListFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#4A90E2" />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading transactions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          placeholderTextColor="#BDC3C7"
          value={filters.searchQuery}
          onChangeText={text => setFilters(prev => ({ ...prev, searchQuery: text }))}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Text style={styles.filterIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Active Filters Display */}
      {(filters.dateRange !== 'all' || filters.category || filters.account) && (
        <View style={styles.activeFiltersContainer}>
          {filters.dateRange !== 'all' && (
            <View style={styles.filterChip}>
              <Text style={styles.filterChipText}>
                {filters.dateRange.charAt(0).toUpperCase() + filters.dateRange.slice(1)}
              </Text>
              <TouchableOpacity
                onPress={() => setFilters(prev => ({ ...prev, dateRange: 'all' }))}
              >
                <Text style={styles.filterChipClose}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          {filters.category && (
            <View style={styles.filterChip}>
              <Text style={styles.filterChipText}>{filters.category}</Text>
              <TouchableOpacity
                onPress={() => setFilters(prev => ({ ...prev, category: null }))}
              >
                <Text style={styles.filterChipClose}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          {filters.account && (
            <View style={styles.filterChip}>
              <Text style={styles.filterChipText}>{filters.account}</Text>
              <TouchableOpacity
                onPress={() => setFilters(prev => ({ ...prev, account: null }))}
              >
                <Text style={styles.filterChipClose}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Transaction List */}
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderListEmpty}
        ListFooterComponent={renderListFooter}
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Transactions</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Date Range</Text>
              <View style={styles.filterOptions}>
                {['all', 'today', 'week', 'month', 'year'].map(range => (
                  <TouchableOpacity
                    key={range}
                    style={[
                      styles.filterOption,
                      filters.dateRange === range && styles.filterOptionActive,
                    ]}
                    onPress={() => {
                      setFilters(prev => ({
                        ...prev,
                        dateRange: range as FilterOptions['dateRange'],
                      }));
                    }}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        filters.dateRange === range && styles.filterOptionTextActive,
                      ]}
                    >
                      {range.charAt(0).toUpperCase() + range.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Quick Filters</Text>
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={() => {
                  setFilters({
                    dateRange: 'all',
                    category: null,
                    account: null,
                    searchQuery: '',
                  });
                  setShowFilters(false);
                }}
              >
                <Text style={styles.clearFiltersText}>Clear All Filters</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2C3E50',
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIcon: {
    fontSize: 20,
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    borderRadius: 16,
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 8,
    gap: 6,
  },
  filterChipText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  filterChipClose: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
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
    width: 48,
    height: 48,
    borderRadius: 24,
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
  categoryIcon: {
    fontSize: 24,
  },
  transactionInfo: {
    flex: 1,
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
  incomeText: {
    color: '#27AE60',
  },
  expenseText: {
    color: '#E74C3C',
  },
  transactionDate: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  modalClose: {
    fontSize: 24,
    color: '#7F8C8D',
  },
  filterSection: {
    padding: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterOptionActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: '#FFFFFF',
  },
  clearFiltersButton: {
    padding: 12,
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    alignItems: 'center',
  },
  clearFiltersText: {
    fontSize: 14,
    color: '#E74C3C',
    fontWeight: '600',
  },
  applyButton: {
    marginHorizontal: 20,
    padding: 16,
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default TransactionListScreen;
