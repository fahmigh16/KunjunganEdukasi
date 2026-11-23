import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';

class PimpinanMainScreen extends StatefulWidget {
  const PimpinanMainScreen({super.key});

  @override
  State<PimpinanMainScreen> createState() => _PimpinanMainScreenState();
}

class _PimpinanMainScreenState extends State<PimpinanMainScreen> {
  bool _isLoading = true;
  Map<String, dynamic> _stats = {};

  @override
  void initState() {
    super.initState();
    _fetchStats();
  }

  Future<void> _fetchStats() async {
    setState(() => _isLoading = true);
    try {
      final res = await ApiService().dio.get('/pimpinan/dashboard');
      if (res.statusCode == 200) {
        setState(() {
          _stats = res.data['stats'] ?? res.data;
        });
      }
    } catch (e) {
      debugPrint('Error fetch pimpinan stats: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  final currencyFormat = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 30),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontSize: 13, color: Colors.grey)),
                  const SizedBox(height: 4),
                  Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Executive Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Logout',
            onPressed: () => auth.logout(),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetchStats,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  const Text(
                    'Ringkasan Kunjungan Edukasi Polinela',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  _buildStatCard(
                    'Total Kunjungan',
                    '${_stats['totalBookings'] ?? 0} Kali',
                    Icons.calendar_month_rounded,
                    const Color(0xFF15803D),
                  ),
                  const SizedBox(height: 12),
                  _buildStatCard(
                    'Total Pengunjung',
                    '${_stats['totalVisitors'] ?? 0} Orang',
                    Icons.groups_rounded,
                    Colors.blue,
                  ),
                  const SizedBox(height: 12),
                  _buildStatCard(
                    'Pendapatan Diterima',
                    currencyFormat.format(_stats['totalRevenue'] ?? 0),
                    Icons.monetization_on_rounded,
                    Colors.amber.shade800,
                  ),
                ],
              ),
            ),
    );
  }
}
