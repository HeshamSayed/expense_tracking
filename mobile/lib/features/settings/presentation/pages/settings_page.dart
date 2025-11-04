import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

import '../../../../core/l10n/locale_cubit.dart';
import '../../../authentication/presentation/bloc/auth_bloc.dart';

class SettingsPage extends StatelessWidget {
  const SettingsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final localeCubit = context.watch<LocaleCubit>();

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.settings),
      ),
      body: BlocListener<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state is Unauthenticated) {
            context.go('/login');
          }
        },
        child: ListView(
          children: [
            // User Profile Section
            BlocBuilder<AuthBloc, AuthState>(
              builder: (context, state) {
                if (state is Authenticated) {
                  return ListTile(
                    leading: CircleAvatar(
                      backgroundColor: Theme.of(context).primaryColor,
                      child: Text(
                        state.user.firstName[0].toUpperCase(),
                        style: const TextStyle(color: Colors.white),
                      ),
                    ),
                    title: Text(state.user.fullName),
                    subtitle: Text(state.user.email),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () {
                      // Navigate to profile page
                    },
                  );
                }
                return const SizedBox.shrink();
              },
            ),
            const Divider(),

            // Language Section
            ListTile(
              leading: const Icon(Icons.language),
              title: Text(l10n.language),
              subtitle: Text(
                localeCubit.isArabic ? l10n.arabic : l10n.english,
              ),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                _showLanguageDialog(context);
              },
            ),

            // Currency Section
            ListTile(
              leading: const Icon(Icons.attach_money),
              title: Text(l10n.currency),
              subtitle: const Text('USD'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                // Navigate to currency selection
              },
            ),

            // Notifications Section
            SwitchListTile(
              secondary: const Icon(Icons.notifications),
              title: Text(l10n.notifications),
              subtitle: Text(l10n.budgetAlerts),
              value: true,
              onChanged: (value) {
                // Toggle notifications
              },
            ),

            // Dark Mode
            SwitchListTile(
              secondary: const Icon(Icons.dark_mode),
              title: Text(l10n.darkMode),
              value: false,
              onChanged: (value) {
                // Toggle dark mode
              },
            ),

            const Divider(),

            // About Section
            ListTile(
              leading: const Icon(Icons.info),
              title: const Text('About'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                // Show about dialog
                showAboutDialog(
                  context: context,
                  applicationName: l10n.appName,
                  applicationVersion: '1.0.0',
                  applicationIcon: const Icon(
                    Icons.account_balance_wallet,
                    size: 48,
                  ),
                );
              },
            ),

            // Logout
            ListTile(
              leading: const Icon(Icons.logout, color: Colors.red),
              title: Text(
                l10n.logout,
                style: const TextStyle(color: Colors.red),
              ),
              onTap: () {
                _showLogoutDialog(context, l10n);
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showLanguageDialog(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final localeCubit = context.read<LocaleCubit>();

    showDialog(
      context: context,
      builder: (BuildContext dialogContext) {
        return AlertDialog(
          title: Text(l10n.changeLanguage),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              RadioListTile<String>(
                title: Text(l10n.english),
                value: 'en',
                groupValue: localeCubit.state.languageCode,
                onChanged: (value) {
                  if (value != null) {
                    localeCubit.changeLocale(value);
                    Navigator.of(dialogContext).pop();
                  }
                },
              ),
              RadioListTile<String>(
                title: Text(l10n.arabic),
                value: 'ar',
                groupValue: localeCubit.state.languageCode,
                onChanged: (value) {
                  if (value != null) {
                    localeCubit.changeLocale(value);
                    Navigator.of(dialogContext).pop();
                  }
                },
              ),
            ],
          ),
        );
      },
    );
  }

  void _showLogoutDialog(BuildContext context, AppLocalizations l10n) {
    showDialog(
      context: context,
      builder: (BuildContext dialogContext) {
        return AlertDialog(
          title: Text(l10n.logout),
          content: Text('${l10n.confirmDeleteMessage}'),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(dialogContext).pop();
              },
              child: Text(l10n.cancel),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(dialogContext).pop();
                context.read<AuthBloc>().add(LogoutEvent());
              },
              style: TextButton.styleFrom(
                foregroundColor: Colors.red,
              ),
              child: Text(l10n.logout),
            ),
          ],
        );
      },
    );
  }
}
