import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../providers/booking_provider.dart';

class BookingWizardScreen extends StatefulWidget {
  final Map<String, dynamic> packageData;
  const BookingWizardScreen({super.key, required this.packageData});

  @override
  State<BookingWizardScreen> createState() => _BookingWizardScreenState();
}

class _BookingWizardScreenState extends State<BookingWizardScreen> {
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 3));
  String _selectedSlot = 'Pagi (08:00 - 11:30)';
  final _participantsController = TextEditingController(text: '30');
  final _picNameController = TextEditingController();
  final _picPhoneController = TextEditingController();
  final _agencyController = TextEditingController();
  final _notesController = TextEditingController();

  bool _isLoading = false;

  final currencyFormat = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);

  Future<void> _submitBooking() async {
    final participants = int.tryParse(_participantsController.text) ?? 0;
    if (participants < 1) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Jumlah peserta minimal 1 orang')),
      );
      return;
    }

    if (_picNameController.text.isEmpty || _picPhoneController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Nama PIC & Kontak wajib diisi')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final dateStr = DateFormat('yyyy-MM-dd').format(_selectedDate);
      final res = await context.read<BookingProvider>().createBooking(
            packageId: widget.packageData['id'],
            bookingDate: dateStr,
            timeSlot: _selectedSlot,
            numberOfParticipants: participants,
            contactName: _picNameController.text.trim(),
            contactPhone: _picPhoneController.text.trim(),
            agency: _agencyController.text.trim(),
            notes: _notesController.text.trim(),
          );

      if (res != null && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Pemesanan berhasil dibuat!')),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal membuat pesanan: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final pricePerPerson = widget.packageData['price_per_person'] ?? 0;
    final total = (int.tryParse(_participantsController.text) ?? 0) * pricePerPerson;

    return Scaffold(
      appBar: AppBar(title: const Text('Form Reservasi Kunjungan')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.packageData['name'] ?? '',
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Harga: ${currencyFormat.format(pricePerPerson)} / peserta',
                      style: const TextStyle(color: Color(0xFF15803D), fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
            const Text('Pilih Tanggal Kunjungan', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            OutlinedButton.icon(
              icon: const Icon(Icons.date_range),
              label: Text(DateFormat('EEEE, d MMMM yyyy', 'id_ID').format(_selectedDate)),
              onPressed: () async {
                final d = await showDatePicker(
                  context: context,
                  initialDate: _selectedDate,
                  firstDate: DateTime.now().add(const Duration(days: 1)),
                  lastDate: DateTime.now().add(const Duration(days: 90)),
                );
                if (d != null) setState(() => _selectedDate = d);
              },
            ),
            const SizedBox(height: 16),
            const Text('Pilih Sesi Waktu', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            DropdownButtonFormField<String>(
              value: _selectedSlot,
              items: const [
                DropdownMenuItem(value: 'Pagi (08:00 - 11:30)', child: Text('Pagi (08:00 - 11:30)')),
                DropdownMenuItem(value: 'Siang (13:00 - 16:30)', child: Text('Siang (13:00 - 16:30)')),
              ],
              onChanged: (val) {
                if (val != null) setState(() => _selectedSlot = val);
              },
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _participantsController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Estimasi Jumlah Peserta *'),
              onChanged: (_) => setState(() {}),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _picNameController,
              decoration: const InputDecoration(labelText: 'Nama Penanggung Jawab (PIC) *'),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _picPhoneController,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(labelText: 'No. WhatsApp / HP PIC *'),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _agencyController,
              decoration: const InputDecoration(labelText: 'Instansi / Asal Sekolah'),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _notesController,
              maxLines: 2,
              decoration: const InputDecoration(labelText: 'Catatan Khusus (Opsional)'),
            ),
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.green.shade50,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Total Biaya:', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  Text(
                    currencyFormat.format(total),
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF15803D)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              style: ElevatedButton.styleFrom(minimumSize: const Size.fromHeight(50)),
              onPressed: _isLoading ? null : _submitBooking,
              child: _isLoading ? const CircularProgressIndicator(color: Colors.white) : const Text('Konfirmasi & Buat Pesanan'),
            ),
          ],
        ),
      ),
    );
  }
}
