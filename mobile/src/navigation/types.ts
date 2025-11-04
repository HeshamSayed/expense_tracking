/**
 * Navigation Types
 *
 * Define all navigation routes and their parameters for type-safe navigation
 */

export type RootStackParamList = {
  // Main Tabs
  Dashboard: undefined;
  Transactions: undefined;
  Accounts: undefined;
  Budgets: undefined;
  Reports: undefined;
  Settings: undefined;

  // Modal/Stack Screens
  AddTransaction: undefined;
  EditTransaction: { transactionId: string };
  TransactionDetails: { transactionId: string };

  AddAccount: undefined;
  EditAccount: { accountId: string };

  AddBudget: undefined;
  EditBudget: { budgetId: string };

  // Auth Screens
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;

  // Other Screens
  Profile: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  Subscription: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
};

export type TabParamList = {
  DashboardTab: undefined;
  TransactionsTab: undefined;
  AddTab: undefined;
  ReportsTab: undefined;
  SettingsTab: undefined;
};

// Helper type for navigation props
export type NavigationProps<T extends keyof RootStackParamList> = {
  navigation: any; // Replace with proper NavigationProp type
  route: {
    params: RootStackParamList[T];
  };
};
