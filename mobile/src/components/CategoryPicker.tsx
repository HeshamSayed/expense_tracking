import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { Text, useTheme, Searchbar, Divider, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense' | 'both';
  isCustom?: boolean;
}

interface CategoryPickerProps {
  visible: boolean;
  onDismiss: () => void;
  onSelect: (category: Category) => void;
  selectedCategory?: Category;
  categories: Category[];
  transactionType?: 'income' | 'expense';
  title?: string;
  allowCustom?: boolean;
  onCreateCustom?: () => void;
}

export default function CategoryPicker({
  visible,
  onDismiss,
  onSelect,
  selectedCategory,
  categories,
  transactionType,
  title = 'Select Category',
  allowCustom = true,
  onCreateCustom,
}: CategoryPickerProps) {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = categories.filter(category => {
    // Filter by transaction type if specified
    if (transactionType && category.type !== 'both' && category.type !== transactionType) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      return category.name.toLowerCase().includes(searchQuery.toLowerCase());
    }

    return true;
  });

  // Group categories by type
  const incomeCategories = filteredCategories.filter(
    cat => cat.type === 'income' || cat.type === 'both'
  );
  const expenseCategories = filteredCategories.filter(
    cat => cat.type === 'expense' || cat.type === 'both'
  );

  const handleSelect = (category: Category) => {
    onSelect(category);
    setSearchQuery('');
    onDismiss();
  };

  const renderCategoryItem = (category: Category) => {
    const isSelected = selectedCategory?.id === category.id;

    return (
      <TouchableOpacity
        key={category.id}
        style={[
          styles.categoryItem,
          isSelected && {
            backgroundColor: theme.colors.primaryContainer,
            borderColor: theme.colors.primary,
          },
        ]}
        onPress={() => handleSelect(category)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.categoryIconContainer,
            { backgroundColor: category.color + '20' },
          ]}
        >
          <Icon name={category.icon} size={24} color={category.color} />
        </View>
        <Text
          variant="bodyMedium"
          style={[
            styles.categoryName,
            isSelected && { color: theme.colors.primary, fontWeight: '600' },
          ]}
          numberOfLines={1}
        >
          {category.name}
        </Text>
        {isSelected && (
          <Icon
            name="check-circle"
            size={20}
            color={theme.colors.primary}
            style={styles.checkIcon}
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderCategoryGrid = (categories: Category[], sectionTitle: string) => {
    if (categories.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text
          variant="titleSmall"
          style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}
        >
          {sectionTitle}
        </Text>
        <View style={styles.categoryGrid}>
          {categories.map(category => renderCategoryItem(category))}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={onDismiss}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
              <Icon name="close" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
            <Text variant="titleLarge" style={styles.title}>
              {title}
            </Text>
            <View style={styles.headerSpacer} />
          </View>
          <Searchbar
            placeholder="Search categories..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={theme.colors.onSurfaceVariant}
            inputStyle={styles.searchInput}
          />
        </View>

        <Divider />

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={true}
        >
          {filteredCategories.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon
                name="folder-open-outline"
                size={64}
                color={theme.colors.onSurfaceDisabled}
              />
              <Text
                variant="titleMedium"
                style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}
              >
                No categories found
              </Text>
              {searchQuery && (
                <Text
                  variant="bodyMedium"
                  style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}
                >
                  Try adjusting your search
                </Text>
              )}
            </View>
          ) : (
            <>
              {/* Show both sections if no transaction type is specified */}
              {!transactionType && (
                <>
                  {renderCategoryGrid(expenseCategories, 'Expense Categories')}
                  {renderCategoryGrid(incomeCategories, 'Income Categories')}
                </>
              )}

              {/* Show only relevant section if transaction type is specified */}
              {transactionType === 'expense' &&
                renderCategoryGrid(filteredCategories, 'Expense Categories')}
              {transactionType === 'income' &&
                renderCategoryGrid(filteredCategories, 'Income Categories')}
            </>
          )}

          {/* Create Custom Category Button */}
          {allowCustom && onCreateCustom && (
            <View style={styles.customSection}>
              <Divider style={styles.customDivider} />
              <Button
                mode="outlined"
                onPress={() => {
                  onDismiss();
                  onCreateCustom();
                }}
                icon="plus"
                style={styles.customButton}
              >
                Create Custom Category
              </Button>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48 - 24) / 3; // Account for padding and gaps

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 32,
  },
  searchBar: {
    marginHorizontal: 16,
    elevation: 0,
  },
  searchInput: {
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    marginBottom: 12,
    fontWeight: '600',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryItem: {
    width: ITEM_WIDTH,
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.12)',
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    textAlign: 'center',
    fontSize: 12,
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyText: {
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    textAlign: 'center',
  },
  customSection: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  customDivider: {
    marginBottom: 16,
  },
  customButton: {
    marginBottom: 16,
  },
});
