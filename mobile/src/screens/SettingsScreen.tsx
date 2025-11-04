import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';

interface UserProfile {
  name: string;
  email: string;
  memberSince: string;
  isProUser: boolean;
}

interface NotificationPreferences {
  pushNotifications: boolean;
  emailNotifications: boolean;
  budgetAlerts: boolean;
  weeklyReports: boolean;
  transactionReminders: boolean;
}

const MOCK_USER: UserProfile = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  memberSince: '2024-01-15',
  isProUser: false,
};

const SettingsScreen: React.FC = () => {
  const [user, setUser] = useState<UserProfile>(MOCK_USER);
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    pushNotifications: true,
    emailNotifications: false,
    budgetAlerts: true,
    weeklyReports: true,
    transactionReminders: false,
  });
  const [adConsent, setAdConsent] = useState<boolean>(true);

  const handleToggleNotification = (
    key: keyof NotificationPreferences,
    value: boolean
  ) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    // TODO: Save to backend
  };

  const handleAdConsentToggle = (value: boolean) => {
    setAdConsent(value);
    Alert.alert(
      'Ad Consent Updated',
      value
        ? 'Personalized ads are now enabled. This helps us provide you with more relevant content.'
        : 'Personalized ads are now disabled. You will still see ads, but they will be less relevant.'
    );
    // TODO: Save to backend and update ad provider settings
  };

  const handleUpgradeToPro = () => {
    Alert.alert(
      'Upgrade to Pro',
      'Unlock premium features:\n\n• Ad-free experience\n• Export reports (PDF, CSV, Excel)\n• Advanced analytics\n• Unlimited budgets\n• Priority support\n• Cloud backup\n\nPrice: $4.99/month or $49.99/year',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Subscribe Monthly ($4.99)',
          onPress: () => {
            // TODO: Implement subscription flow
            Alert.alert('Subscription', 'Monthly subscription flow to be implemented');
          },
        },
        {
          text: 'Subscribe Yearly ($49.99)',
          onPress: () => {
            // TODO: Implement subscription flow
            Alert.alert('Subscription', 'Yearly subscription flow to be implemented');
          },
        },
      ]
    );
  };

  const handleManageSubscription = () => {
    Alert.alert(
      'Manage Subscription',
      'View and manage your subscription settings',
      [
        {
          text: 'View Benefits',
          onPress: () => Alert.alert('Pro Benefits', 'Benefits list to be implemented'),
        },
        {
          text: 'Cancel Subscription',
          onPress: () => {
            Alert.alert(
              'Cancel Subscription',
              'Are you sure you want to cancel your Pro subscription? You will lose access to premium features.',
              [
                { text: 'No, Keep It', style: 'cancel' },
                {
                  text: 'Yes, Cancel',
                  style: 'destructive',
                  onPress: () => {
                    // TODO: Implement cancellation
                    Alert.alert('Cancellation', 'Cancellation flow to be implemented');
                  },
                },
              ]
            );
          },
          style: 'destructive',
        },
        {
          text: 'Close',
          style: 'cancel',
        },
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing to be implemented');
    // TODO: Navigate to edit profile screen
  };

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'Password change flow to be implemented');
    // TODO: Navigate to change password screen
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Your Data',
      'Download all your financial data in JSON format',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Export',
          onPress: () => {
            // TODO: Implement data export
            Alert.alert('Export', 'Data export to be implemented');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be lost.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirm Deletion',
              'This is your final warning. All data will be permanently deleted.',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Permanently Delete',
                  style: 'destructive',
                  onPress: () => {
                    // TODO: Implement account deletion
                    Alert.alert('Account Deletion', 'Account deletion flow to be implemented');
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Unable to open link');
    });
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement logout
            Alert.alert('Logout', 'Logout flow to be implemented');
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <View style={styles.section}>
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              {user.name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.profileEmail}>{user.email}</Text>
            <Text style={styles.profileMember}>
              Member since {formatDate(user.memberSince)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={handleEditProfile}
          >
            <Text style={styles.editProfileIcon}>✏️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Subscription Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription</Text>
        {user.isProUser ? (
          <View style={styles.proCard}>
            <View style={styles.proHeader}>
              <Text style={styles.proIcon}>⭐</Text>
              <Text style={styles.proTitle}>Pro Member</Text>
            </View>
            <Text style={styles.proDescription}>
              You have access to all premium features
            </Text>
            <TouchableOpacity
              style={styles.manageSubscriptionButton}
              onPress={handleManageSubscription}
            >
              <Text style={styles.manageSubscriptionText}>Manage Subscription</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.upgradeCard} onPress={handleUpgradeToPro}>
            <View style={styles.upgradeHeader}>
              <Text style={styles.upgradeIcon}>🚀</Text>
              <View style={styles.upgradeInfo}>
                <Text style={styles.upgradeTitle}>Upgrade to Pro</Text>
                <Text style={styles.upgradeDescription}>
                  Unlock premium features and remove ads
                </Text>
              </View>
            </View>
            <View style={styles.upgradeArrow}>
              <Text style={styles.upgradeArrowText}>→</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive notifications on your device
              </Text>
            </View>
            <Switch
              value={notifications.pushNotifications}
              onValueChange={value =>
                handleToggleNotification('pushNotifications', value)
              }
              trackColor={{ false: '#BDC3C7', true: '#4A90E2' }}
            />
          </View>

          <View style={styles.settingDivider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Email Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive updates via email
              </Text>
            </View>
            <Switch
              value={notifications.emailNotifications}
              onValueChange={value =>
                handleToggleNotification('emailNotifications', value)
              }
              trackColor={{ false: '#BDC3C7', true: '#4A90E2' }}
            />
          </View>

          <View style={styles.settingDivider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Budget Alerts</Text>
              <Text style={styles.settingDescription}>
                Get notified when approaching budget limits
              </Text>
            </View>
            <Switch
              value={notifications.budgetAlerts}
              onValueChange={value =>
                handleToggleNotification('budgetAlerts', value)
              }
              trackColor={{ false: '#BDC3C7', true: '#4A90E2' }}
            />
          </View>

          <View style={styles.settingDivider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Weekly Reports</Text>
              <Text style={styles.settingDescription}>
                Receive weekly spending summaries
              </Text>
            </View>
            <Switch
              value={notifications.weeklyReports}
              onValueChange={value =>
                handleToggleNotification('weeklyReports', value)
              }
              trackColor={{ false: '#BDC3C7', true: '#4A90E2' }}
            />
          </View>

          <View style={styles.settingDivider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Transaction Reminders</Text>
              <Text style={styles.settingDescription}>
                Reminders to log daily transactions
              </Text>
            </View>
            <Switch
              value={notifications.transactionReminders}
              onValueChange={value =>
                handleToggleNotification('transactionReminders', value)
              }
              trackColor={{ false: '#BDC3C7', true: '#4A90E2' }}
            />
          </View>
        </View>
      </View>

      {/* Privacy Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Personalized Ads</Text>
              <Text style={styles.settingDescription}>
                {adConsent
                  ? 'Ads are tailored to your interests'
                  : 'You will see non-personalized ads'}
              </Text>
            </View>
            <Switch
              value={adConsent}
              onValueChange={handleAdConsentToggle}
              trackColor={{ false: '#BDC3C7', true: '#4A90E2' }}
            />
          </View>
        </View>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.settingsCard}>
          <TouchableOpacity style={styles.menuItem} onPress={handleChangePassword}>
            <Text style={styles.menuItemText}>Change Password</Text>
            <Text style={styles.menuItemArrow}>→</Text>
          </TouchableOpacity>

          <View style={styles.settingDivider} />

          <TouchableOpacity style={styles.menuItem} onPress={handleExportData}>
            <Text style={styles.menuItemText}>Export My Data</Text>
            <Text style={styles.menuItemArrow}>→</Text>
          </TouchableOpacity>

          <View style={styles.settingDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleDeleteAccount}
          >
            <Text style={[styles.menuItemText, styles.dangerText]}>
              Delete Account
            </Text>
            <Text style={styles.menuItemArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Legal Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal</Text>
        <View style={styles.settingsCard}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              handleOpenLink('https://example.com/privacy-policy')
            }
          >
            <Text style={styles.menuItemText}>Privacy Policy</Text>
            <Text style={styles.menuItemArrow}>→</Text>
          </TouchableOpacity>

          <View style={styles.settingDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              handleOpenLink('https://example.com/terms-of-service')
            }
          >
            <Text style={styles.menuItemText}>Terms of Service</Text>
            <Text style={styles.menuItemArrow}>→</Text>
          </TouchableOpacity>

          <View style={styles.settingDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleOpenLink('https://example.com/licenses')}
          >
            <Text style={styles.menuItemText}>Open Source Licenses</Text>
            <Text style={styles.menuItemArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.settingsCard}>
          <View style={styles.menuItem}>
            <Text style={styles.menuItemText}>Version</Text>
            <Text style={styles.versionText}>1.0.0</Text>
          </View>
        </View>
      </View>

      {/* Logout Button */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  profileMember: {
    fontSize: 12,
    color: '#95A5A6',
  },
  editProfileButton: {
    padding: 8,
  },
  editProfileIcon: {
    fontSize: 20,
  },
  proCard: {
    backgroundColor: '#FFF9E6',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F39C12',
  },
  proHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  proIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  proTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  proDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 16,
  },
  manageSubscriptionButton: {
    backgroundColor: '#F39C12',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  manageSubscriptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  upgradeCard: {
    backgroundColor: '#E3F2FD',
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  upgradeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  upgradeIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  upgradeInfo: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  upgradeDescription: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  upgradeArrow: {
    marginLeft: 12,
  },
  upgradeArrowText: {
    fontSize: 24,
    color: '#4A90E2',
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  settingDivider: {
    height: 1,
    backgroundColor: '#F5F7FA',
    marginLeft: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  menuItemArrow: {
    fontSize: 18,
    color: '#BDC3C7',
  },
  dangerText: {
    color: '#E74C3C',
  },
  versionText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  logoutButton: {
    backgroundColor: '#E74C3C',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bottomPadding: {
    height: 40,
  },
});

export default SettingsScreen;
