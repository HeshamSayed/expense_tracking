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

interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'credit' | 'savings' | 'investment' | 'other';
  balance: number;
  currency: string;
  isArchived: boolean;
  icon: string;
  color: string;
}

const ACCOUNT_TYPES = [
  { value: 'cash', label: 'Cash', icon: '💵' },
  { value: 'bank', label: 'Bank Account', icon: '🏦' },
  { value: 'credit', label: 'Credit Card', icon: '💳' },
  { value: 'savings', label: 'Savings', icon: '🏦' },
  { value: 'investment', label: 'Investment', icon: '📈' },
  { value: 'other', label: 'Other', icon: '📦' },
];

const ACCOUNT_COLORS = [
  '#4A90E2',
  '#27AE60',
  '#E74C3C',
  '#F39C12',
  '#9B59B6',
  '#1ABC9C',
  '#E67E22',
  '#3498DB',
];

const MOCK_ACCOUNTS: Account[] = [
  {
    id: '1',
    name: 'Cash',
    type: 'cash',
    balance: 500.00,
    currency: 'USD',
    isArchived: false,
    icon: '💵',
    color: '#27AE60',
  },
  {
    id: '2',
    name: 'Bank Account',
    type: 'bank',
    balance: 12420.50,
    currency: 'USD',
    isArchived: false,
    icon: '🏦',
    color: '#4A90E2',
  },
  {
    id: '3',
    name: 'Credit Card',
    type: 'credit',
    balance: 2500.00,
    currency: 'USD',
    isArchived: false,
    icon: '💳',
    color: '#E74C3C',
  },
  {
    id: '4',
    name: 'Savings',
    type: 'savings',
    balance: 5000.00,
    currency: 'USD',
    isArchived: false,
    icon: '🏦',
    color: '#9B59B6',
  },
];

const AccountsScreen: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  // Form state
  const [accountName, setAccountName] = useState<string>('');
  const [accountType, setAccountType] = useState<Account['type']>('bank');
  const [initialBalance, setInitialBalance] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>(ACCOUNT_COLORS[0]);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('API_ENDPOINT/accounts');
      // const data = await response.json();

      await new Promise(resolve => setTimeout(resolve, 1000));
      setAccounts(MOCK_ACCOUNTS);
      setLoading(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to load accounts');
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAccounts();
    setRefreshing(false);
  };

  const getTotalBalance = (): number => {
    return accounts
      .filter(acc => !acc.isArchived)
      .reduce((sum, acc) => sum + acc.balance, 0);
  };

  const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const openAddModal = () => {
    setEditingAccount(null);
    setAccountName('');
    setAccountType('bank');
    setInitialBalance('');
    setSelectedColor(ACCOUNT_COLORS[0]);
    setShowAddModal(true);
  };

  const openEditModal = (account: Account) => {
    setEditingAccount(account);
    setAccountName(account.name);
    setAccountType(account.type);
    setInitialBalance(account.balance.toString());
    setSelectedColor(account.color);
    setShowAddModal(true);
  };

  const handleSaveAccount = async () => {
    if (!accountName.trim()) {
      Alert.alert('Missing Information', 'Please enter an account name');
      return;
    }

    if (!initialBalance || parseFloat(initialBalance) < 0) {
      Alert.alert('Invalid Balance', 'Please enter a valid initial balance');
      return;
    }

    try {
      const accountData = {
        name: accountName.trim(),
        type: accountType,
        balance: parseFloat(initialBalance),
        currency: 'USD',
        color: selectedColor,
        icon: ACCOUNT_TYPES.find(t => t.value === accountType)?.icon || '📦',
      };

      if (editingAccount) {
        // TODO: Update API call
        // await fetch(`API_ENDPOINT/accounts/${editingAccount.id}`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(accountData),
        // });

        setAccounts(prev =>
          prev.map(acc =>
            acc.id === editingAccount.id
              ? { ...acc, ...accountData }
              : acc
          )
        );
        Alert.alert('Success', 'Account updated successfully');
      } else {
        // TODO: Create API call
        // const response = await fetch('API_ENDPOINT/accounts', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(accountData),
        // });

        const newAccount: Account = {
          id: Date.now().toString(),
          ...accountData,
          isArchived: false,
        };

        setAccounts(prev => [...prev, newAccount]);
        Alert.alert('Success', 'Account created successfully');
      }

      setShowAddModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save account');
    }
  };

  const handleArchiveAccount = (account: Account) => {
    Alert.alert(
      'Archive Account',
      `Are you sure you want to archive "${account.name}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Archive',
          onPress: async () => {
            try {
              // TODO: Update API call
              setAccounts(prev =>
                prev.map(acc =>
                  acc.id === account.id
                    ? { ...acc, isArchived: true }
                    : acc
                )
              );
              Alert.alert('Success', 'Account archived successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to archive account');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = (account: Account) => {
    Alert.alert(
      'Delete Account',
      `Are you sure you want to permanently delete "${account.name}"? This action cannot be undone.`,
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
              setAccounts(prev => prev.filter(acc => acc.id !== account.id));
              Alert.alert('Success', 'Account deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account');
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
        <Text style={styles.loadingText}>Loading accounts...</Text>
      </View>
    );
  }

  const activeAccounts = accounts.filter(acc => !acc.isArchived);
  const archivedAccounts = accounts.filter(acc => acc.isArchived);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Total Balance Card */}
        <View style={styles.totalBalanceCard}>
          <Text style={styles.totalBalanceLabel}>Total Balance</Text>
          <Text style={styles.totalBalanceAmount}>
            {formatCurrency(getTotalBalance())}
          </Text>
          <Text style={styles.totalBalanceSubtext}>
            Across {activeAccounts.length} account{activeAccounts.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Active Accounts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Accounts</Text>
          {activeAccounts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🏦</Text>
              <Text style={styles.emptyText}>No accounts yet</Text>
              <Text style={styles.emptySubtext}>
                Add your first account to get started
              </Text>
            </View>
          ) : (
            activeAccounts.map(account => (
              <TouchableOpacity
                key={account.id}
                style={styles.accountCard}
                onLongPress={() => {
                  Alert.alert(
                    account.name,
                    'Choose an action',
                    [
                      {
                        text: 'Edit',
                        onPress: () => openEditModal(account),
                      },
                      {
                        text: 'Archive',
                        onPress: () => handleArchiveAccount(account),
                      },
                      {
                        text: 'Delete',
                        onPress: () => handleDeleteAccount(account),
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
                <View style={styles.accountLeft}>
                  <View
                    style={[
                      styles.accountIcon,
                      { backgroundColor: account.color + '20' },
                    ]}
                  >
                    <Text style={styles.accountIconText}>{account.icon}</Text>
                  </View>
                  <View>
                    <Text style={styles.accountName}>{account.name}</Text>
                    <Text style={styles.accountType}>
                      {ACCOUNT_TYPES.find(t => t.value === account.type)?.label}
                    </Text>
                  </View>
                </View>
                <View style={styles.accountRight}>
                  <Text style={styles.accountBalance}>
                    {formatCurrency(account.balance, account.currency)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Archived Accounts */}
        {archivedAccounts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Archived</Text>
            {archivedAccounts.map(account => (
              <View key={account.id} style={[styles.accountCard, styles.archivedCard]}>
                <View style={styles.accountLeft}>
                  <View
                    style={[
                      styles.accountIcon,
                      { backgroundColor: '#BDC3C7' + '20' },
                    ]}
                  >
                    <Text style={styles.accountIconText}>{account.icon}</Text>
                  </View>
                  <View>
                    <Text style={[styles.accountName, styles.archivedText]}>
                      {account.name}
                    </Text>
                    <Text style={styles.accountType}>Archived</Text>
                  </View>
                </View>
                <View style={styles.accountRight}>
                  <Text style={[styles.accountBalance, styles.archivedText]}>
                    {formatCurrency(account.balance, account.currency)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Add Account Button */}
      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add/Edit Account Modal */}
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
                {editingAccount ? 'Edit Account' : 'Add New Account'}
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Account Name */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Account Name</Text>
                <TextInput
                  style={styles.formInput}
                  value={accountName}
                  onChangeText={setAccountName}
                  placeholder="e.g., Main Bank Account"
                  placeholderTextColor="#BDC3C7"
                />
              </View>

              {/* Account Type */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Account Type</Text>
                <View style={styles.typeGrid}>
                  {ACCOUNT_TYPES.map(type => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.typeOption,
                        accountType === type.value && styles.typeOptionActive,
                      ]}
                      onPress={() => setAccountType(type.value as Account['type'])}
                    >
                      <Text style={styles.typeOptionIcon}>{type.icon}</Text>
                      <Text style={styles.typeOptionText}>{type.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Initial Balance */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  {editingAccount ? 'Current Balance' : 'Initial Balance'}
                </Text>
                <View style={styles.balanceInput}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.balanceInputField}
                    value={initialBalance}
                    onChangeText={text => {
                      const cleaned = text.replace(/[^0-9.]/g, '');
                      const parts = cleaned.split('.');
                      if (parts.length <= 2 && (!parts[1] || parts[1].length <= 2)) {
                        setInitialBalance(cleaned);
                      }
                    }}
                    placeholder="0.00"
                    placeholderTextColor="#BDC3C7"
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              {/* Color Selection */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Color</Text>
                <View style={styles.colorGrid}>
                  {ACCOUNT_COLORS.map(color => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        selectedColor === color && styles.colorOptionActive,
                      ]}
                      onPress={() => setSelectedColor(color)}
                    />
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveAccount}
              >
                <Text style={styles.saveButtonText}>
                  {editingAccount ? 'Update Account' : 'Create Account'}
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
  totalBalanceCard: {
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
  totalBalanceLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 8,
  },
  totalBalanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  totalBalanceSubtext: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
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
  archivedCard: {
    opacity: 0.6,
  },
  accountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accountIconText: {
    fontSize: 24,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  accountType: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  accountRight: {
    alignItems: 'flex-end',
  },
  accountBalance: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  archivedText: {
    color: '#95A5A6',
  },
  emptyContainer: {
    paddingVertical: 40,
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
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    width: '48%',
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeOptionActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#4A90E2',
  },
  typeOptionIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  typeOptionText: {
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: '500',
    textAlign: 'center',
  },
  balanceInput: {
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
  balanceInputField: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    padding: 0,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorOptionActive: {
    borderColor: '#2C3E50',
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

export default AccountsScreen;
