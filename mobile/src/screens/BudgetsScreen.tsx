import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
} from 'react-native';

type BudgetPeriod = 'weekly' | 'monthly' | 'yearly';

interface Budget {
  id: string;
  name: string;
  category: string;
  categoryIcon: string;
  limit: number;
  spent: number;
  period: BudgetPeriod;
  currency: string;
  startDate: string;
  isActive: boolean;
}

const CATEGORIES = [
  { id: '1', name: 'Food', icon: '🍔' },
  { id: '2', name: 'Transportation', icon: '🚗' },
  { id: '3', name: 'Shopping', icon: '🛍️' },
  { id: '4', name: 'Entertainment', icon: '🎬' },
  { id: '5', name: 'Bills', icon: '💡' },
  { id: '6', name: 'Healthcare', icon: '🏥' },
  { id: '7', name: 'Education', icon: '📚' },
  { id: '8', name: 'Other', icon: '📦' },
];

const MOCK_BUDGETS: Budget[] = [
  {
    id: '1',
    name: 'Food Budget',
    category: 'Food',
    categoryIcon: '🍔',
    limit: 500.00,
    spent: 250.00,
    period: 'monthly',
    currency: 'USD',
    startDate: '2025-11-01',
    isActive: true,
  },
  {
    id: '2',
    name: 'Entertainment',
    category: 'Entertainment',
    categoryIcon: '🎬',
    limit: 200.00,
    spent: 180.00,
    period: 'monthly',
    currency: 'USD',
    startDate: '2025-11-01',
    isActive: true,
  },
  {
    id: '3',
    name: 'Transportation',
    category: 'Transportation',
    categoryIcon: '🚗',
    limit: 300.00,
    spent: 120.00,
    period: 'monthly',
    currency: 'USD',
    startDate: '2025-11-01',
    isActive: true,
  },
];

const BudgetsScreen: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [viewMode, setViewMode] = useState<BudgetPeriod>('monthly');

  // Form state
  const [budgetName, setBudgetName] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[0] | null>(null);
  const [budgetLimit, setBudgetLimit] = useState<string>('');
  const [budgetPeriod, setBudgetPeriod] = useState<BudgetPeriod>('monthly');

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('API_ENDPOINT/budgets');
      // const data = await response.json();

      await new Promise(resolve => setTimeout(resolve, 1000));
      setBudgets(MOCK_BUDGETS);
      setLoading(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to load budgets');
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBudgets();
    setRefreshing(false);
  };

  const getBudgetProgress = (budget: Budget): number => {
    return (budget.spent / budget.limit) * 100;
  };

  const getBudgetColor = (progress: number): string => {
    if (progress >= 100) return '#E74C3C';
    if (progress >= 80) return '#F39C12';
    if (progress >= 60) return '#F1C40F';
    return '#27AE60';
  };

  const getRemainingAmount = (budget: Budget): number => {
    return Math.max(0, budget.limit - budget.spent);
  };

  const getDaysRemaining = (budget: Budget): number => {
    const startDate = new Date(budget.startDate);
    const today = new Date();
    let endDate = new Date(startDate);

    switch (budget.period) {
      case 'weekly':
        endDate.setDate(startDate.getDate() + 7);
        break;
      case 'monthly':
        endDate.setMonth(startDate.getMonth() + 1);
        break;
      case 'yearly':
        endDate.setFullYear(startDate.getFullYear() + 1);
        break;
    }

    const diffTime = endDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const openAddModal = () => {
    setEditingBudget(null);
    setBudgetName('');
    setSelectedCategory(null);
    setBudgetLimit('');
    setBudgetPeriod('monthly');
    setShowAddModal(true);
  };

  const openEditModal = (budget: Budget) => {
    setEditingBudget(budget);
    setBudgetName(budget.name);
    setSelectedCategory(CATEGORIES.find(c => c.name === budget.category) || null);
    setBudgetLimit(budget.limit.toString());
    setBudgetPeriod(budget.period);
    setShowAddModal(true);
  };

  const handleSaveBudget = async () => {
    if (!budgetName.trim()) {
      Alert.alert('Missing Information', 'Please enter a budget name');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Missing Information', 'Please select a category');
      return;
    }

    if (!budgetLimit || parseFloat(budgetLimit) <= 0) {
      Alert.alert('Invalid Limit', 'Please enter a valid budget limit');
      return;
    }

    try {
      const budgetData = {
        name: budgetName.trim(),
        category: selectedCategory.name,
        categoryIcon: selectedCategory.icon,
        limit: parseFloat(budgetLimit),
        period: budgetPeriod,
        currency: 'USD',
        startDate: new Date().toISOString().split('T')[0],
      };

      if (editingBudget) {
        // TODO: Update API call
        setBudgets(prev =>
          prev.map(budget =>
            budget.id === editingBudget.id
              ? { ...budget, ...budgetData }
              : budget
          )
        );
        Alert.alert('Success', 'Budget updated successfully');
      } else {
        // TODO: Create API call
        const newBudget: Budget = {
          id: Date.now().toString(),
          ...budgetData,
          spent: 0,
          isActive: true,
        };

        setBudgets(prev => [...prev, newBudget]);
        Alert.alert('Success', 'Budget created successfully');
      }

      setShowAddModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save budget');
    }
  };

  const handleDeleteBudget = (budget: Budget) => {
    Alert.alert(
      'Delete Budget',
      `Are you sure you want to delete "${budget.name}"?`,
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
              // TODO: Delete API call
              setBudgets(prev => prev.filter(b => b.id !== budget.id));
              Alert.alert('Success', 'Budget deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete budget');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading budgets...</Text>
      </View>
    );
  }

  const filteredBudgets = budgets.filter(b => b.period === viewMode && b.isActive);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* View Mode Selector */}
        <View style={styles.viewModeContainer}>
          {(['monthly', 'weekly', 'yearly'] as BudgetPeriod[]).map(mode => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.viewModeButton,
                viewMode === mode && styles.viewModeButtonActive,
              ]}
              onPress={() => setViewMode(mode)}
            >
              <Text
                style={[
                  styles.viewModeText,
                  viewMode === mode && styles.viewModeTextActive,
                ]}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Card */}
        {filteredBudgets.length > 0 && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Budget</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(
                    filteredBudgets.reduce((sum, b) => sum + b.limit, 0)
                  )}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Spent</Text>
                <Text style={[styles.summaryValue, styles.spentText]}>
                  {formatCurrency(
                    filteredBudgets.reduce((sum, b) => sum + b.spent, 0)
                  )}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Budget Cards */}
        <View style={styles.budgetsContainer}>
          {filteredBudgets.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>💰</Text>
              <Text style={styles.emptyText}>No {viewMode} budgets</Text>
              <Text style={styles.emptySubtext}>
                Create a budget to track your spending
              </Text>
            </View>
          ) : (
            filteredBudgets.map(budget => {
              const progress = getBudgetProgress(budget);
              const color = getBudgetColor(progress);
              const remaining = getRemainingAmount(budget);
              const daysLeft = getDaysRemaining(budget);

              return (
                <TouchableOpacity
                  key={budget.id}
                  style={styles.budgetCard}
                  onLongPress={() => {
                    Alert.alert(
                      budget.name,
                      'Choose an action',
                      [
                        {
                          text: 'Edit',
                          onPress: () => openEditModal(budget),
                        },
                        {
                          text: 'Delete',
                          onPress: () => handleDeleteBudget(budget),
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
                  <View style={styles.budgetHeader}>
                    <View style={styles.budgetTitleRow}>
                      <Text style={styles.budgetIcon}>{budget.categoryIcon}</Text>
                      <View style={styles.budgetTitleContainer}>
                        <Text style={styles.budgetName}>{budget.name}</Text>
                        <Text style={styles.budgetCategory}>{budget.category}</Text>
                      </View>
                    </View>
                    <View style={styles.budgetAmounts}>
                      <Text style={[styles.budgetSpent, { color }]}>
                        {formatCurrency(budget.spent)}
                      </Text>
                      <Text style={styles.budgetLimit}>
                        / {formatCurrency(budget.limit)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${Math.min(progress, 100)}%`,
                          backgroundColor: color,
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.budgetFooter}>
                    <View style={styles.budgetStat}>
                      <Text style={styles.budgetStatLabel}>Remaining</Text>
                      <Text style={[styles.budgetStatValue, { color }]}>
                        {formatCurrency(remaining)}
                      </Text>
                    </View>
                    <View style={styles.budgetStat}>
                      <Text style={styles.budgetStatLabel}>Days Left</Text>
                      <Text style={styles.budgetStatValue}>{daysLeft}</Text>
                    </View>
                    <View style={styles.budgetStat}>
                      <Text style={styles.budgetStatLabel}>Progress</Text>
                      <Text style={[styles.budgetStatValue, { color }]}>
                        {progress.toFixed(0)}%
                      </Text>
                    </View>
                  </View>

                  {progress >= 100 && (
                    <View style={styles.warningBanner}>
                      <Text style={styles.warningText}>⚠️ Budget exceeded!</Text>
                    </View>
                  )}
                  {progress >= 80 && progress < 100 && (
                    <View style={[styles.warningBanner, styles.cautionBanner]}>
                      <Text style={styles.warningText}>⚡ Approaching limit</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Add Budget FAB */}
      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add/Edit Budget Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingBudget ? 'Edit Budget' : 'Add New Budget'}
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Budget Name */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Budget Name</Text>
                <TextInput
                  style={styles.formInput}
                  value={budgetName}
                  onChangeText={setBudgetName}
                  placeholder="e.g., Monthly Groceries"
                  placeholderTextColor="#BDC3C7"
                />
              </View>

              {/* Category Selection */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Category</Text>
                <View style={styles.categoryGrid}>
                  {CATEGORIES.map(category => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryOption,
                        selectedCategory?.id === category.id &&
                          styles.categoryOptionActive,
                      ]}
                      onPress={() => setSelectedCategory(category)}
                    >
                      <Text style={styles.categoryIcon}>{category.icon}</Text>
                      <Text style={styles.categoryName}>{category.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Budget Limit */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Budget Limit</Text>
                <View style={styles.limitInput}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.limitInputField}
                    value={budgetLimit}
                    onChangeText={text => {
                      const cleaned = text.replace(/[^0-9.]/g, '');
                      const parts = cleaned.split('.');
                      if (parts.length <= 2 && (!parts[1] || parts[1].length <= 2)) {
                        setBudgetLimit(cleaned);
                      }
                    }}
                    placeholder="0.00"
                    placeholderTextColor="#BDC3C7"
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              {/* Period Selection */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Period</Text>
                <View style={styles.periodOptions}>
                  {(['weekly', 'monthly', 'yearly'] as BudgetPeriod[]).map(period => (
                    <TouchableOpacity
                      key={period}
                      style={[
                        styles.periodOption,
                        budgetPeriod === period && styles.periodOptionActive,
                      ]}
                      onPress={() => setBudgetPeriod(period)}
                    >
                      <Text
                        style={[
                          styles.periodOptionText,
                          budgetPeriod === period && styles.periodOptionTextActive,
                        ]}
                      >
                        {period.charAt(0).toUpperCase() + period.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveBudget}
              >
                <Text style={styles.saveButtonText}>
                  {editingBudget ? 'Update Budget' : 'Create Budget'}
                </Text>
              </TouchableOpacity>
            </View>
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
  scrollView: {
    flex: 1,
  },
  viewModeContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    alignItems: 'center',
  },
  viewModeButtonActive: {
    backgroundColor: '#4A90E2',
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  viewModeTextActive: {
    color: '#FFFFFF',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  spentText: {
    color: '#E74C3C',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  budgetsContainer: {
    padding: 16,
  },
  budgetCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  budgetHeader: {
    marginBottom: 12,
  },
  budgetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  budgetTitleContainer: {
    flex: 1,
  },
  budgetName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  budgetCategory: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  budgetAmounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  budgetSpent: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  budgetLimit: {
    fontSize: 16,
    color: '#7F8C8D',
    marginLeft: 4,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#ECF0F1',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  budgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetStat: {
    flex: 1,
    alignItems: 'center',
  },
  budgetStatLabel: {
    fontSize: 11,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  budgetStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  warningBanner: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FADBD8',
    borderRadius: 8,
  },
  cautionBanner: {
    backgroundColor: '#FEF5E7',
  },
  warningText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C0392B',
    textAlign: 'center',
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
  bottomPadding: {
    height: 80,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#27AE60',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  fabText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
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
    maxHeight: '90%',
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
  modalBody: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2C3E50',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    width: '23%',
    aspectRatio: 1,
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryOptionActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#4A90E2',
  },
  categoryIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 10,
    color: '#2C3E50',
    textAlign: 'center',
  },
  limitInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginRight: 8,
  },
  limitInputField: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    padding: 0,
  },
  periodOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  periodOption: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  periodOptionActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#4A90E2',
  },
  periodOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  periodOptionTextActive: {
    color: '#4A90E2',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  saveButton: {
    backgroundColor: '#27AE60',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default BudgetsScreen;
