import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:dio/dio.dart';
import '../services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  Map<String, dynamic>? _user;
  String? _token;
  bool _isLoading = true;

  Map<String, dynamic>? get user => _user;
  String? get token => _token;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _token != null;

  String get userRole {
    if (_user == null) return '';
    if (_user!['Role'] != null && _user!['Role']['name'] != null) {
      return _user!['Role']['name'].toString().toLowerCase();
    }
    if (_user!['role'] != null) {
      return _user!['role'].toString().toLowerCase();
    }
    return 'user';
  }

  AuthProvider() {
    loadStoredSession();
  }

  Future<void> loadStoredSession() async {
    _isLoading = true;
    notifyListeners();
    try {
      final prefs = await SharedPreferences.getInstance();
      _token = prefs.getString('jwt_token');
      final userStr = prefs.getString('user_data');
      if (userStr != null) {
        _user = jsonDecode(userStr);
      }

      // Verifikasi token ke backend
      if (_token != null) {
        final res = await ApiService().dio.get('/auth/me');
        if (res.statusCode == 200) {
          _user = res.data['user'] ?? res.data;
          await prefs.setString('user_data', jsonEncode(_user));
        }
      }
    } catch (e) {
      // Jika token expired / invalid
      logout();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> login(String email, String password) async {
    try {
      final res = await ApiService().dio.post('/auth/login', data: {
        'email': email,
        'password': password,
      });

      if (res.statusCode == 200) {
        _token = res.data['token'];
        _user = res.data['user'];

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('jwt_token', _token!);
        await prefs.setString('user_data', jsonEncode(_user));

        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      rethrow;
    }
  }

  Future<bool> register({
    required String name,
    required String email,
    required String password,
    required String phone,
    String? agency,
  }) async {
    try {
      final res = await ApiService().dio.post('/auth/register', data: {
        'name': name,
        'email': email,
        'password': password,
        'phone': phone,
        'agency': agency ?? '',
      });
      return res.statusCode == 201 || res.statusCode == 200;
    } catch (e) {
      rethrow;
    }
  }

  Future<void> logout() async {
    _token = null;
    _user = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('jwt_token');
    await prefs.remove('user_data');
    notifyListeners();
  }
}
