import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type AddTransactionScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AddTransaction'
>;

interface Account {
  id: string;
  name: string;
  balance: number;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  type: 'income' | 'expense' | 'both';
}

const MOCK_ACCOUNTS: Account[] = [
  { id: '1', name: 'Cash', balance: 500.00 },
  { id: '2', name: 'Bank Account', balance: 12420.50 },
  { id: '3', name: 'Credit Card', balance: 2500.00 },
];

const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'Food', icon: '🍔', type: 'expense' },
  { id: '2', name: 'Transportation', icon: '🚗', type: 'expense' },
  { id: '3', name: 'Shopping', icon: '🛍️', type: 'expense' },
  { id: '4', name: 'Entertainment', icon: '🎬', type: 'expense' },
  { id: '5', name: 'Bills', icon: '💡', type: 'expense' },
  { id: '6', name: 'Healthcare', icon: '🏥', type: 'expense' },
  { id: '7', name: 'Salary', icon: '💰', type: 'income' },
  { id: '8', name: 'Business', icon: '💼', type: 'income' },
  { id: '9', name: 'Investment', icon: '📈', type: 'income' },
  { id: '10', name: 'Other', icon: '📦', type: 'both' },
];

const AddTransactionScreen: React.FC = () => {
  const navigation = useNavigation<AddTransactionScreenNavigationProp>();

  // Form state
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState<string>('');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState<string>('');
  const [receiptUri, setReceiptUri] = useState<string | null>(null);

  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [showAccountPicker, setShowAccountPicker] = useState<boolean>(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  const filteredCategories = MOCK_CATEGORIES.filter(
    cat => cat.type === transactionType || cat.type === 'both'
  );

  const handleAmountChange = (text: string) => {
    // Only allow numbers and one decimal point
    const cleanedText = text.replace(/[^0-9.]/g, '');
    const parts = cleanedText.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setAmount(cleanedText);
  };

  const handleReceiptUpload = () => {
    // TODO: Implement image picker
    Alert.alert(
      'Upload Receipt',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: () => {
            // TODO: Open camera
            Alert.alert('Camera', 'Camera functionality to be implemented');
          },
        },
        {
          text: 'Choose from Gallery',
          onPress: () => {
            // TODO: Open gallery
            Alert.alert('Gallery', 'Gallery functionality to be implemented');
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const validateForm = (): boolean => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return false;
    }
    if (!selectedAccount) {
      Alert.alert('Missing Account', 'Please select an account');
      return false;
    }
    if (!selectedCategory) {
      Alert.alert('Missing Category', 'Please select a category');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const transactionData = {
        type: transactionType,
        amount: parseFloat(amount),
        accountId: selectedAccount?.id,
        categoryId: selectedCategory?.id,
        date: date.toISOString(),
        notes: notes.trim(),
        receiptUri,
      };

      // TODO: Replace with actual API call
      // await fetch('API_ENDPOINT/transactions', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(transactionData),
      // });

      await new Promise(resolve => setTimeout(resolve, 1000));

      Alert.alert(
        'Success',
        'Transaction added successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        {/* Transaction Type Toggle */}
        <View style={styles.section}>
          <Text style={styles.label}>Transaction Type</Text>
          <View style={styles.typeToggle}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                transactionType === 'expense' && styles.typeButtonActive,
                { borderTopLeftRadius: 8, borderBottomLeftRadius: 8 },
              ]}
              onPress={() => {
                setTransactionType('expense');
                setSelectedCategory(null);
              }}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  transactionType === 'expense' && styles.typeButtonTextActive,
                ]}
              >
                Expense
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                transactionType === 'income' && styles.typeButtonActive,
                { borderTopRightRadius: 8, borderBottomRightRadius: 8 },
              ]}
              onPress={() => {
                setTransactionType('income');
                setSelectedCategory(null);
              }}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  transactionType === 'income' && styles.typeButtonTextActive,
                ]}
              >
                Income
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Amount Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Amount</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={handleAmountChange}
              placeholder="0.00"
              placeholderTextColor="#BDC3C7"
              keyboardType="decimal-pad"
              maxLength={12}
            />
          </View>
        </View>

        {/* Account Selector */}
        <View style={styles.section}>
          <Text style={styles.label}>Account</Text>
          <TouchableOpacity
            style={styles.picker}
            onPress={() => setShowAccountPicker(true)}
          >
            <Text style={selectedAccount ? styles.pickerTextSelected : styles.pickerText}>
              {selectedAccount ? selectedAccount.name : 'Select Account'}
            </Text>
            <Text style={styles.pickerArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Category Selector */}
        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <TouchableOpacity
            style={styles.picker}
            onPress={() => setShowCategoryPicker(true)}
          >
            <Text style={selectedCategory ? styles.pickerTextSelected : styles.pickerText}>
              {selectedCategory
                ? `${selectedCategory.icon} ${selectedCategory.name}`
                : 'Select Category'}
            </Text>
            <Text style={styles.pickerArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Date Picker */}
        <View style={styles.section}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={styles.picker}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.pickerTextSelected}>{formatDate(date)}</Text>
            <Text style={styles.pickerArrow}>📅</Text>
          </TouchableOpacity>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes about this transaction..."
            placeholderTextColor="#BDC3C7"
            multiline
            numberOfLines={3}
            maxLength={200}
          />
          <Text style={styles.characterCount}>{notes.length}/200</Text>
        </View>

        {/* Receipt Upload */}
        <View style={styles.section}>
          <Text style={styles.label}>Receipt (Optional)</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={handleReceiptUpload}>
            {receiptUri ? (
              <Image source={{ uri: receiptUri }} style={styles.receiptPreview} />
            ) : (
              <>
                <Text style={styles.uploadIcon}>📷</Text>
                <Text style={styles.uploadText}>Upload Receipt Photo</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Transaction</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Account Picker Modal */}
      <Modal
        visible={showAccountPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAccountPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Account</Text>
              <TouchableOpacity onPress={() => setShowAccountPicker(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            {MOCK_ACCOUNTS.map(account => (
              <TouchableOpacity
                key={account.id}
                style={styles.modalItem}
                onPress={() => {
                  setSelectedAccount(account);
                  setShowAccountPicker(false);
                }}
              >
                <Text style={styles.modalItemText}>{account.name}</Text>
                <Text style={styles.modalItemBalance}>
                  ${account.balance.toFixed(2)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Category Picker Modal */}
      <Modal
        visible={showCategoryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.categoryGrid}>
              {filteredCategories.map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryItem}
                  onPress={() => {
                    setSelectedCategory(category);
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text style={styles.categoryName}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal (Simple) */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.dateOptions}>
              <TouchableOpacity
                style={styles.dateOption}
                onPress={() => {
                  setDate(new Date());
                  setShowDatePicker(false);
                }}
              >
                <Text style={styles.dateOptionText}>Today</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dateOption}
                onPress={() => {
                  const yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 1);
                  setDate(yesterday);
                  setShowDatePicker(false);
                }}
              >
                <Text style={styles.dateOptionText}>Yesterday</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dateOption}
                onPress={() => {
                  // TODO: Show calendar picker
                  Alert.alert('Custom Date', 'Calendar picker to be implemented');
                  setShowDatePicker(false);
                }}
              >
                <Text style={styles.dateOptionText}>Custom Date...</Text>
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
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  typeToggle: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#4A90E2',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    padding: 0,
  },
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pickerText: {
    fontSize: 16,
    color: '#BDC3C7',
  },
  pickerTextSelected: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },
  pickerArrow: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  notesInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2C3E50',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'right',
    marginTop: 4,
  },
  uploadButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#BDC3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  receiptPreview: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  saveButton: {
    backgroundColor: '#27AE60',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#BDC3C7',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    maxHeight: '80%',
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
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F7FA',
  },
  modalItemText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  modalItemBalance: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
  },
  categoryItem: {
    width: '25%',
    aspectRatio: 1,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 11,
    color: '#2C3E50',
    textAlign: 'center',
  },
  dateOptions: {
    padding: 16,
  },
  dateOption: {
    padding: 16,
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    marginBottom: 8,
  },
  dateOptionText: {
    fontSize: 16,
    color: '#2C3E50',
    textAlign: 'center',
  },
});

export default AddTransactionScreen;
