import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Types for navigation
export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  AddTransaction: undefined;
  EditTransaction: { transactionId: string };
  TransactionDetail: { transactionId: string };
  AddAccount: undefined;
  EditAccount: { accountId: string };
  AccountDetail: { accountId: string };
  AddBudget: undefined;
  EditBudget: { budgetId: string };
  BudgetDetail: { budgetId: string };
  Profile: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  Subscription: undefined;
  CategoryManagement: undefined;
  ExportData: undefined;
  Notifications: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Transactions: undefined;
  Accounts: undefined;
  Budgets: undefined;
  Reports: undefined;
};

const AuthStack = createStackNavigator<AuthStackParamList>();
const MainStack = createStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Import placeholder screens (to be created separately)
// Auth Screens
const OnboardingScreen = () => null;
const LoginScreen = () => null;
const RegisterScreen = () => null;
const ForgotPasswordScreen = () => null;

// Main Tab Screens
const DashboardScreen = () => null;
const TransactionsScreen = () => null;
const AccountsScreen = () => null;
const BudgetsScreen = () => null;
const ReportsScreen = () => null;

// Detail/Edit Screens
const AddTransactionScreen = () => null;
const EditTransactionScreen = () => null;
const TransactionDetailScreen = () => null;
const AddAccountScreen = () => null;
const EditAccountScreen = () => null;
const AccountDetailScreen = () => null;
const AddBudgetScreen = () => null;
const EditBudgetScreen = () => null;
const BudgetDetailScreen = () => null;
const ProfileScreen = () => null;
const EditProfileScreen = () => null;
const ChangePasswordScreen = () => null;
const SubscriptionScreen = () => null;
const CategoryManagementScreen = () => null;
const ExportDataScreen = () => null;
const NotificationsScreen = () => null;

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#fff' },
      }}
    >
      <AuthStack.Screen name="Onboarding" component={OnboardingScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
}

function MainTabNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
              break;
            case 'Transactions':
              iconName = focused ? 'swap-horizontal' : 'swap-horizontal';
              break;
            case 'Accounts':
              iconName = focused ? 'wallet' : 'wallet-outline';
              break;
            case 'Budgets':
              iconName = focused ? 'chart-pie' : 'chart-pie';
              break;
            case 'Reports':
              iconName = focused ? 'chart-bar' : 'chart-bar';
              break;
            default:
              iconName = 'help-circle-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceDisabled,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
          borderTopWidth: 1,
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          headerShown: true,
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          title: 'Transactions',
          headerShown: true,
        }}
      />
      <Tab.Screen
        name="Accounts"
        component={AccountsScreen}
        options={{
          title: 'Accounts',
          headerShown: true,
        }}
      />
      <Tab.Screen
        name="Budgets"
        component={BudgetsScreen}
        options={{
          title: 'Budgets',
          headerShown: true,
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          title: 'Reports',
          headerShown: true,
        }}
      />
    </Tab.Navigator>
  );
}

function MainNavigator() {
  const theme = useTheme();

  return (
    <MainStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        cardStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <MainStack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />

      {/* Transaction Screens */}
      <MainStack.Screen
        name="AddTransaction"
        component={AddTransactionScreen}
        options={{
          title: 'Add Transaction',
          presentation: 'modal',
        }}
      />
      <MainStack.Screen
        name="EditTransaction"
        component={EditTransactionScreen}
        options={{
          title: 'Edit Transaction',
          presentation: 'modal',
        }}
      />
      <MainStack.Screen
        name="TransactionDetail"
        component={TransactionDetailScreen}
        options={{
          title: 'Transaction Details',
        }}
      />

      {/* Account Screens */}
      <MainStack.Screen
        name="AddAccount"
        component={AddAccountScreen}
        options={{
          title: 'Add Account',
          presentation: 'modal',
        }}
      />
      <MainStack.Screen
        name="EditAccount"
        component={EditAccountScreen}
        options={{
          title: 'Edit Account',
          presentation: 'modal',
        }}
      />
      <MainStack.Screen
        name="AccountDetail"
        component={AccountDetailScreen}
        options={{
          title: 'Account Details',
        }}
      />

      {/* Budget Screens */}
      <MainStack.Screen
        name="AddBudget"
        component={AddBudgetScreen}
        options={{
          title: 'Add Budget',
          presentation: 'modal',
        }}
      />
      <MainStack.Screen
        name="EditBudget"
        component={EditBudgetScreen}
        options={{
          title: 'Edit Budget',
          presentation: 'modal',
        }}
      />
      <MainStack.Screen
        name="BudgetDetail"
        component={BudgetDetailScreen}
        options={{
          title: 'Budget Details',
        }}
      />

      {/* Settings & Profile Screens */}
      <MainStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
        }}
      />
      <MainStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          title: 'Edit Profile',
        }}
      />
      <MainStack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{
          title: 'Change Password',
        }}
      />
      <MainStack.Screen
        name="Subscription"
        component={SubscriptionScreen}
        options={{
          title: 'Subscription',
        }}
      />
      <MainStack.Screen
        name="CategoryManagement"
        component={CategoryManagementScreen}
        options={{
          title: 'Manage Categories',
        }}
      />
      <MainStack.Screen
        name="ExportData"
        component={ExportDataScreen}
        options={{
          title: 'Export Data',
        }}
      />
      <MainStack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Notifications',
        }}
      />
    </MainStack.Navigator>
  );
}

interface AppNavigatorProps {
  isAuthenticated: boolean;
}

export default function AppNavigator({ isAuthenticated }: AppNavigatorProps) {
  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
