import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

interface ChartData {
  label: string;
  value: number;
  color: string;
  percentage: number;
}

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

interface ReportData {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  categoryBreakdown: ChartData[];
  monthlyTrend: MonthlyData[];
  topCategories: ChartData[];
}

const MOCK_REPORT_DATA: ReportData = {
  totalIncome: 5000.00,
  totalExpenses: 3250.00,
  balance: 1750.00,
  categoryBreakdown: [
    { label: 'Food', value: 850, color: '#E74C3C', percentage: 26.2 },
    { label: 'Transportation', value: 650, color: '#3498DB', percentage: 20.0 },
    { label: 'Entertainment', value: 450, color: '#9B59B6', percentage: 13.8 },
    { label: 'Bills', value: 800, color: '#F39C12', percentage: 24.6 },
    { label: 'Shopping', value: 500, color: '#1ABC9C', percentage: 15.4 },
  ],
  monthlyTrend: [
    { month: 'Jul', income: 4500, expense: 2800 },
    { month: 'Aug', income: 5200, expense: 3100 },
    { month: 'Sep', income: 4800, expense: 2950 },
    { month: 'Oct', income: 5100, expense: 3300 },
    { month: 'Nov', income: 5000, expense: 3250 },
  ],
  topCategories: [
    { label: 'Food', value: 850, color: '#E74C3C', percentage: 100 },
    { label: 'Bills', value: 800, color: '#F39C12', percentage: 94.1 },
    { label: 'Transportation', value: 650, color: '#3498DB', percentage: 76.5 },
  ],
};

const ReportsScreen: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');
  const [isProUser, setIsProUser] = useState<boolean>(false);

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const loadReportData = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`API_ENDPOINT/reports?range=${dateRange}`);
      // const data = await response.json();

      await new Promise(resolve => setTimeout(resolve, 1000));
      setReportData(MOCK_REPORT_DATA);
      setLoading(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to load report data');
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReportData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleExport = () => {
    if (!isProUser) {
      Alert.alert(
        'Pro Feature',
        'Export functionality is available for Pro users only. Upgrade to unlock this feature.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Upgrade to Pro',
            onPress: () => {
              // TODO: Navigate to subscription screen
              Alert.alert('Upgrade', 'Subscription flow to be implemented');
            },
          },
        ]
      );
      return;
    }

    Alert.alert(
      'Export Report',
      'Choose export format',
      [
        {
          text: 'PDF',
          onPress: () => Alert.alert('Export', 'PDF export to be implemented'),
        },
        {
          text: 'CSV',
          onPress: () => Alert.alert('Export', 'CSV export to be implemented'),
        },
        {
          text: 'Excel',
          onPress: () => Alert.alert('Export', 'Excel export to be implemented'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading reports...</Text>
      </View>
    );
  }

  if (!reportData) {
    return null;
  }

  const maxMonthlyValue = Math.max(
    ...reportData.monthlyTrend.map(m => Math.max(m.income, m.expense))
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Date Range Selector */}
        <View style={styles.dateRangeContainer}>
          {(['week', 'month', 'year'] as const).map(range => (
            <TouchableOpacity
              key={range}
              style={[
                styles.dateRangeButton,
                dateRange === range && styles.dateRangeButtonActive,
              ]}
              onPress={() => setDateRange(range)}
            >
              <Text
                style={[
                  styles.dateRangeText,
                  dateRange === range && styles.dateRangeTextActive,
                ]}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, styles.incomeCard]}>
            <Text style={styles.summaryLabel}>Total Income</Text>
            <Text style={styles.summaryAmount}>
              {formatCurrency(reportData.totalIncome)}
            </Text>
          </View>
          <View style={[styles.summaryCard, styles.expenseCard]}>
            <Text style={styles.summaryLabel}>Total Expenses</Text>
            <Text style={styles.summaryAmount}>
              {formatCurrency(reportData.totalExpenses)}
            </Text>
          </View>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Net Balance</Text>
          <Text
            style={[
              styles.balanceAmount,
              reportData.balance >= 0 ? styles.positiveBalance : styles.negativeBalance,
            ]}
          >
            {formatCurrency(reportData.balance)}
          </Text>
          <Text style={styles.balanceSubtext}>
            {reportData.balance >= 0 ? 'Surplus' : 'Deficit'} for this period
          </Text>
        </View>

        {/* Monthly Trend Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Income vs Expenses Trend</Text>
          <View style={styles.chartCard}>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#27AE60' }]} />
                <Text style={styles.legendText}>Income</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#E74C3C' }]} />
                <Text style={styles.legendText}>Expenses</Text>
              </View>
            </View>

            <View style={styles.barChart}>
              {reportData.monthlyTrend.map((month, index) => (
                <View key={index} style={styles.barGroup}>
                  <View style={styles.barsContainer}>
                    <View
                      style={[
                        styles.bar,
                        styles.incomeBar,
                        {
                          height: `${(month.income / maxMonthlyValue) * 100}%`,
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.bar,
                        styles.expenseBar,
                        {
                          height: `${(month.expense / maxMonthlyValue) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{month.month}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Category Breakdown Pie Chart (Simplified) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category Breakdown</Text>
          <View style={styles.chartCard}>
            {/* Horizontal Bar Chart */}
            {reportData.categoryBreakdown.map((category, index) => (
              <View key={index} style={styles.categoryRow}>
                <View style={styles.categoryInfo}>
                  <View
                    style={[styles.categoryDot, { backgroundColor: category.color }]}
                  />
                  <Text style={styles.categoryLabel}>{category.label}</Text>
                </View>
                <View style={styles.categoryValueContainer}>
                  <View style={styles.categoryBar}>
                    <View
                      style={[
                        styles.categoryBarFill,
                        {
                          width: `${category.percentage}%`,
                          backgroundColor: category.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.categoryValue}>
                    {formatCurrency(category.value)}
                  </Text>
                  <Text style={styles.categoryPercentage}>
                    {category.percentage.toFixed(1)}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Top Spending Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Spending Categories</Text>
          <View style={styles.topCategoriesContainer}>
            {reportData.topCategories.map((category, index) => (
              <View key={index} style={styles.topCategoryCard}>
                <View style={styles.topCategoryRank}>
                  <Text style={styles.topCategoryRankText}>#{index + 1}</Text>
                </View>
                <View style={styles.topCategoryInfo}>
                  <Text style={styles.topCategoryLabel}>{category.label}</Text>
                  <Text style={styles.topCategoryValue}>
                    {formatCurrency(category.value)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Export Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
            <Text style={styles.exportButtonIcon}>📄</Text>
            <Text style={styles.exportButtonText}>Export Report</Text>
            {!isProUser && <Text style={styles.proBadge}>PRO</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
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
  dateRangeContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dateRangeButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    alignItems: 'center',
  },
  dateRangeButtonActive: {
    backgroundColor: '#4A90E2',
  },
  dateRangeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  dateRangeTextActive: {
    color: '#FFFFFF',
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  incomeCard: {
    backgroundColor: '#D5F4E6',
  },
  expenseCard: {
    backgroundColor: '#FADBD8',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#2C3E50',
    marginBottom: 4,
    opacity: 0.8,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  balanceCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  positiveBalance: {
    color: '#27AE60',
  },
  negativeBalance: {
    color: '#E74C3C',
  },
  balanceSubtext: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 200,
    paddingTop: 20,
  },
  barGroup: {
    alignItems: 'center',
    flex: 1,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 180,
    gap: 4,
  },
  bar: {
    width: 16,
    borderRadius: 4,
    minHeight: 4,
  },
  incomeBar: {
    backgroundColor: '#27AE60',
  },
  expenseBar: {
    backgroundColor: '#E74C3C',
  },
  barLabel: {
    fontSize: 10,
    color: '#7F8C8D',
    marginTop: 4,
  },
  categoryRow: {
    marginBottom: 16,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  categoryValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#ECF0F1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  categoryValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2C3E50',
    width: 70,
    textAlign: 'right',
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#7F8C8D',
    width: 45,
    textAlign: 'right',
  },
  topCategoriesContainer: {
    gap: 8,
  },
  topCategoryCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  topCategoryRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  topCategoryRankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  topCategoryInfo: {
    flex: 1,
  },
  topCategoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  topCategoryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E74C3C',
  },
  exportButton: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#4A90E2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  exportButtonIcon: {
    fontSize: 20,
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  proBadge: {
    backgroundColor: '#F39C12',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bottomPadding: {
    height: 24,
  },
});

export default ReportsScreen;
