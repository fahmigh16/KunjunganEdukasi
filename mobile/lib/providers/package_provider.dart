import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../services/api_service.dart';

class PackageProvider extends ChangeNotifier {
  List<dynamic> _packages = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<dynamic> get packages => _packages;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> fetchPackages() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final res = await ApiService().dio.get('/packages');
      if (res.statusCode == 200) {
        _packages = res.data['data'] ?? res.data;
      }
    } catch (e) {
      _errorMessage = 'Gagal memuat data paket edukasi.';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
