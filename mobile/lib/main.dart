import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'config/theme.dart';
import 'providers/auth_provider.dart';
import 'providers/package_provider.dart';
import 'providers/booking_provider.dart';
import 'screens/auth/login_screen.dart';
import 'screens/user/user_main_screen.dart';
import 'screens/admin/admin_main_screen.dart';
import 'screens/pimpinan/pimpinan_main_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => PackageProvider()),
        ChangeNotifierProvider(create: (_) => BookingProvider()),
      ],
      child: MaterialApp(
        title: 'Kunjungan Edukasi POLINELA',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        home: const AuthGate(),
      ),
    );
  }
}

class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    if (auth.isLoading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    if (!auth.isAuthenticated) {
      return const LoginScreen();
    }

    final role = auth.userRole;
    if (role == 'admin') {
      return const AdminMainScreen();
    } else if (role == 'pimpinan') {
      return const PimpinanMainScreen();
    } else {
      return const UserMainScreen();
    }
  }
}
