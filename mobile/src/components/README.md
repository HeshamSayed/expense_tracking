# MoneyGuard Mobile Components

This directory contains all reusable UI components for the MoneyGuard mobile application. All components are built with TypeScript, React Native Paper theming, and include props validation.

## Components Overview

### Navigation

#### AppNavigator.tsx
Main navigation setup with:
- **Auth Stack**: Onboarding, Login, Register, Forgot Password screens
- **Main Stack**: All authenticated screens with nested navigation
- **Bottom Tab Navigator**: 5 tabs (Dashboard, Transactions, Accounts, Budgets, Reports)
- **Stack Navigator**: For nested screens and modals

**Usage:**
```typescript
import AppNavigator from './navigation/AppNavigator';

<AppNavigator isAuthenticated={isAuthenticated} />
```

### Display Components

#### TransactionCard.tsx
Displays individual transaction items in a list.

**Props:**
- `transaction`: Transaction object with amount, category, date, etc.
- `onPress`: Optional callback when card is pressed
- `onLongPress`: Optional callback for long press
- `showAccount`: Boolean to show/hide account name (default: true)

**Usage:**
```typescript
import { TransactionCard } from './components';

<TransactionCard
  transaction={transaction}
  onPress={() => navigateToDetail(transaction.id)}
  showAccount={true}
/>
```

#### AccountCard.tsx
Displays account information with balance and details.

**Props:**
- `account`: Account object with name, type, balance, currency
- `onPress`: Optional callback when card is pressed
- `onLongPress`: Optional callback for long press
- `showBalance`: Boolean to show/hide balance (default: true)

**Usage:**
```typescript
import { AccountCard } from './components';

<AccountCard
  account={account}
  onPress={() => navigateToAccount(account.id)}
  showBalance={true}
/>
```

#### BudgetProgressCard.tsx
Visual representation of budget progress with spending metrics.

**Props:**
- `budget`: Budget object with amount, spent, period, dates
- `onPress`: Optional callback when card is pressed
- `onLongPress`: Optional callback for long press
- `compact`: Boolean for compact view (default: false)

**Features:**
- Progress bar with color coding (green → yellow → orange → red)
- Alert threshold visualization
- Days remaining calculation
- Spent/Remaining/Total amounts

**Usage:**
```typescript
import { BudgetProgressCard } from './components';

<BudgetProgressCard
  budget={budget}
  onPress={() => navigateToBudget(budget.id)}
  compact={false}
/>
```

### Input Components

#### CategoryPicker.tsx
Modal component for selecting transaction categories.

**Props:**
- `visible`: Boolean to show/hide modal
- `onDismiss`: Callback when modal is dismissed
- `onSelect`: Callback when category is selected
- `selectedCategory`: Currently selected category
- `categories`: Array of available categories
- `transactionType`: Filter by 'income' or 'expense'
- `allowCustom`: Boolean to show "Create Custom" button
- `onCreateCustom`: Callback for creating custom category

**Features:**
- Search functionality
- Grid layout with icons
- Separate sections for income/expense categories
- Custom category creation

**Usage:**
```typescript
import { CategoryPicker } from './components';

<CategoryPicker
  visible={showPicker}
  onDismiss={() => setShowPicker(false)}
  onSelect={(category) => handleCategorySelect(category)}
  selectedCategory={selectedCategory}
  categories={categories}
  transactionType="expense"
  allowCustom={true}
  onCreateCustom={() => navigateToCreateCategory()}
/>
```

#### AmountInput.tsx
Specialized input component for currency amounts.

**Props:**
- `value`: String value of the amount
- `onChangeValue`: Callback with formatted string and numeric value
- `currency`: Currency code (default: 'USD')
- `label`: Input label
- `error`: Error message to display
- `maxAmount`: Maximum allowed amount
- `minAmount`: Minimum allowed amount (default: 0)
- `allowNegative`: Allow negative values (default: false)

**Features:**
- Automatic formatting (2 decimal places)
- Currency symbol display
- Min/max validation
- Error handling
- Helper text with formatted amount

**Usage:**
```typescript
import { AmountInput } from './components';

<AmountInput
  value={amount}
  onChangeValue={(formatted, numeric) => setAmount(formatted)}
  currency="USD"
  label="Amount"
  maxAmount={10000}
  minAmount={0.01}
/>
```

### Monetization Components

#### AdBanner.tsx
AdMob banner ad wrapper that only shows for free users.

**Props:**
- `isPro`: Boolean indicating if user is Pro subscriber
- `onUpgradePress`: Callback for upgrade button
- `adUnitId`: Custom AdMob unit ID (optional)
- `size`: Ad size: 'banner' | 'large_banner' | 'medium_rectangle' | 'full_banner'
- `showUpgradePrompt`: Show upgrade prompt on ad failure (default: true)

**Features:**
- Automatically hidden for Pro users
- Fallback upgrade prompt
- Test ads in development mode
- Error handling

**Usage:**
```typescript
import { AdBanner } from './components';

<AdBanner
  isPro={user.isPro}
  onUpgradePress={() => navigateToSubscription()}
  showUpgradePrompt={true}
/>
```

#### ProBadge.tsx
Badge component to indicate Pro subscription status.

**Props:**
- `size`: 'small' | 'medium' | 'large' (default: 'medium')
- `variant`: 'default' | 'outline' | 'flat' (default: 'default')
- `showIcon`: Show crown icon (default: true)
- `showText`: Show "PRO" text (default: true)
- `text`: Custom badge text (default: 'PRO')
- `color`: Custom badge color
- `onPress`: Optional callback (renders as Chip if provided)

**Convenience Exports:**
- `ProBadgeSmall`, `ProBadgeMedium`, `ProBadgeLarge`
- `ProBadgeOutline`, `ProBadgeFlat`

**Usage:**
```typescript
import { ProBadge, ProBadgeOutline } from './components';

<ProBadge size="medium" variant="default" />
<ProBadgeOutline onPress={() => navigateToSubscription()} />
```

### Utility Components

#### LoadingSpinner.tsx
Loading indicator with multiple display modes.

**Props:**
- `visible`: Boolean to show/hide spinner (default: true)
- `message`: Optional loading message
- `size`: 'small' | 'large' | number (default: 'large')
- `color`: Custom spinner color
- `overlay`: Show with overlay background
- `fullScreen`: Show in full-screen modal

**Convenience Exports:**
- `CenteredLoadingSpinner`
- `OverlayLoadingSpinner`
- `FullScreenLoadingSpinner`

**Usage:**
```typescript
import { LoadingSpinner, FullScreenLoadingSpinner } from './components';

<LoadingSpinner visible={isLoading} message="Loading transactions..." />
<FullScreenLoadingSpinner visible={isLoading} message="Please wait..." />
```

#### ErrorMessage.tsx
Error display component with multiple error types and variants.

**Props:**
- `visible`: Boolean to show/hide error (default: true)
- `type`: ErrorType - 'network' | 'server' | 'validation' | 'permission' | 'notfound' | 'generic'
- `title`: Custom error title
- `message`: Custom error message
- `error`: Error object or string
- `onRetry`: Callback for retry button
- `onDismiss`: Callback for dismiss button
- `variant`: 'inline' | 'card' | 'fullscreen' (default: 'card')
- `showIcon`: Show error icon (default: true)

**Features:**
- Type-specific icons and messages
- Retry and dismiss actions
- Debug info in development mode
- Multiple display variants

**Convenience Exports:**
- `NetworkError`, `ServerError`, `ValidationError`
- `PermissionError`, `NotFoundError`

**Usage:**
```typescript
import { ErrorMessage, NetworkError } from './components';

<ErrorMessage
  visible={hasError}
  type="network"
  onRetry={() => refetch()}
  onDismiss={() => setHasError(false)}
  variant="card"
/>

<NetworkError
  visible={hasError}
  onRetry={() => refetch()}
/>
```

## Importing Components

All components can be imported from the index file:

```typescript
import {
  TransactionCard,
  AccountCard,
  BudgetProgressCard,
  CategoryPicker,
  AmountInput,
  AdBanner,
  ProBadge,
  LoadingSpinner,
  ErrorMessage,
} from './components';
```

## Type Exports

Common types are also exported:

```typescript
import type {
  Transaction,
  Account,
  Budget,
  Category,
  ErrorType,
} from './components';
```

## Theming

All components use React Native Paper's theme system. Colors and styles automatically adapt to the app's theme:

```typescript
import { useTheme } from 'react-native-paper';

const theme = useTheme();
// Access colors: theme.colors.primary, theme.colors.surface, etc.
```

## Best Practices

1. **Always provide TypeScript types** - Use the exported types for props
2. **Handle loading and error states** - Use LoadingSpinner and ErrorMessage components
3. **Test with both light and dark themes** - Ensure components look good in both modes
4. **Provide accessible labels** - Use proper labels for screen readers
5. **Follow React Native Paper guidelines** - Maintain consistency with Material Design
6. **Test on both iOS and Android** - Ensure cross-platform compatibility

## Development Notes

### AdMob Integration
The AdBanner component is set up for AdMob but needs configuration:
1. Replace test ad unit IDs with your actual IDs in production
2. Configure AdMob in your Google AdMob console
3. Test with real ads before releasing

### Navigation Integration
The AppNavigator expects screen components to be imported. Create screen components and import them into AppNavigator.tsx:

```typescript
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
// etc.
```

### Custom Icons
All components use `react-native-vector-icons/MaterialCommunityIcons`. Browse available icons at:
https://materialdesignicons.com/
