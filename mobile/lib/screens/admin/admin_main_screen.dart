import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/booking_provider.dart';

class AdminMainScreen extends StatefulWidget {
  const AdminMainScreen({super.key});

  @override
  State<AdminMainScreen> createState() => _AdminMainScreenState();
}

class _AdminMainScreenState extends State<AdminMainScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<BookingProvider>().fetchAdminBookings();
    });
  }

  void _showStatusDialog(int bookingId, String currentStatus) {
    showDialog(
      context: context,
      builder: (ctx) => SimpleDialog(
        title: const Text('Ubah Status Reservasi'),
        children: [
          SimpleDialogOption(
            onPressed: () async {
              Navigator.pop(ctx);
              await context.read<BookingProvider>().updateStatus(bookingId, 'approved');
            },
            child: const Text('Setujui (Approved)', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
          ),
          SimpleDialogOption(
            onPressed: () async {
              Navigator.pop(ctx);
              await context.read<BookingProvider>().updateStatus(bookingId, 'rejected');
            },
            child: const Text('Tolak (Rejected)', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
          ),
          SimpleDialogOption(
            onPressed: () async {
              Navigator.pop(ctx);
              await context.read<BookingProvider>().updateStatus(bookingId, 'completed');
            },
            child: const Text('Selesai (Completed)', style: TextStyle(color: Colors.blue, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bookingProvider = context.watch<BookingProvider>();
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard Admin'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Logout',
            onPressed: () => auth.logout(),
          ),
        ],
      ),
      body: bookingProvider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : bookingProvider.adminBookings.isEmpty
              ? const Center(child: Text('Belum ada data reservasi masuk.'))
              : RefreshIndicator(
                  onRefresh: () => bookingProvider.fetchAdminBookings(),
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: bookingProvider.adminBookings.length,
                    itemBuilder: (context, index) {
                      final item = bookingProvider.adminBookings[index];
                      final status = item['status'] ?? 'pending';

                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    '#${item['booking_code'] ?? item['id']}',
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                  ),
                                  Chip(
                                    label: Text(
                                      status.toString().toUpperCase(),
                                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                                    ),
                                    backgroundColor: status == 'approved'
                                        ? Colors.green.shade100
                                        : status == 'rejected'
                                            ? Colors.red.shade100
                                            : Colors.amber.shade100,
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text('PIC: ${item['pic_name'] ?? item['User']?['name'] ?? '-'} (${item['pic_phone'] ?? '-'})'),
                              Text('Instansi: ${item['institution_name'] ?? '-'}'),
                              Text('Tanggal: ${item['booking_date'] ?? '-'} | Sesi: ${item['time_slot'] ?? '-'}'),
                              Text('Peserta: ${item['total_participants'] ?? 0} Orang'),
                              const Divider(height: 24),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.end,
                                children: [
                                  OutlinedButton.icon(
                                    icon: const Icon(Icons.edit_note, size: 18),
                                    label: const Text('Update Status'),
                                    onPressed: () => _showStatusDialog(item['id'], status),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
