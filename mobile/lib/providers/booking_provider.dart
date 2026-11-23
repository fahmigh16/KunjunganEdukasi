import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../services/api_service.dart';

class BookingProvider extends ChangeNotifier {
  List<dynamic> _myBookings = [];
  List<dynamic> _adminBookings = [];
  bool _isLoading = false;

  List<dynamic> get myBookings => _myBookings;
  List<dynamic> get adminBookings => _adminBookings;
  bool get isLoading => _isLoading;

  Future<void> fetchMyBookings() async {
    _isLoading = true;
    notifyListeners();
    try {
      final res = await ApiService().dio.get('/bookings/my');
      if (res.statusCode == 200) {
        _myBookings = res.data['data'] ?? res.data;
      }
    } catch (e) {
      debugPrint('Error fetch my bookings: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchAdminBookings() async {
    _isLoading = true;
    notifyListeners();
    try {
      final res = await ApiService().dio.get('/bookings/admin/all');
      if (res.statusCode == 200) {
        _adminBookings = res.data['data'] ?? res.data;
      }
    } catch (e) {
      debugPrint('Error fetch admin bookings: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<Map<String, dynamic>?> createBooking({
    required int packageId,
    required String bookingDate,
    required String timeSlot,
    required int numberOfParticipants,
    required String contactName,
    required String contactPhone,
    String? contactEmail,
    String? agency,
    String? notes,
  }) async {
    _isLoading = true;
    notifyListeners();
    try {
      final res = await ApiService().dio.post('/bookings', data: {
        'package_id': packageId,
        'booking_date': bookingDate,
        'time_slot': timeSlot,
        'total_participants': numberOfParticipants,
        'pic_name': contactName,
        'pic_phone': contactPhone,
        'pic_email': contactEmail,
        'institution_name': agency,
        'notes': notes,
      });

      if (res.statusCode == 201 || res.statusCode == 200) {
        await fetchMyBookings();
        return res.data['booking'] ?? res.data;
      }
      return null;
    } catch (e) {
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> updateStatus(int bookingId, String status, {String? notes}) async {
    try {
      final res = await ApiService().dio.patch('/bookings/$bookingId/status', data: {
        'status': status,
        'notes': notes,
      });
      await fetchAdminBookings();
      return res.statusCode == 200;
    } catch (e) {
      rethrow;
    }
  }
}
