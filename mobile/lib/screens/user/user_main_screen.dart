import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/package_provider.dart';
import '../../providers/booking_provider.dart';
import 'booking_wizard_screen.dart';

class UserMainScreen extends StatefulWidget {
  const UserMainScreen({super.key});

  @override
  State<UserMainScreen> createState() => _UserMainScreenState();
}

class _UserMainScreenState extends State<UserMainScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final screens = [
      const UserCatalogTab(),
      const UserBookingsTab(),
      const UserProfileTab(),
    ];

    return Scaffold(
      body: screens[_currentIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (idx) => setState(() => _currentIndex = idx),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.explore_outlined),
            selectedIcon: Icon(Icons.explore),
            label: 'Katalog',
          ),
          NavigationDestination(
            icon: Icon(Icons.calendar_month_outlined),
            selectedIcon: Icon(Icons.calendar_month),
            label: 'Pesanan Saya',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person),
            label: 'Profil',
          ),
        ],
      ),
    );
  }
}

class UserCatalogTab extends StatefulWidget {
  const UserCatalogTab({super.key});

  @override
  State<UserCatalogTab> createState() => _UserCatalogTabState();
}

class _UserCatalogTabState extends State<UserCatalogTab> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<PackageProvider>().fetchPackages();
    });
  }

  final currencyFormat = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);

  @override
  Widget build(BuildContext context) {
    final pkgProvider = context.watch<PackageProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Paket Edukasi Polinela'),
      ),
      body: pkgProvider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : pkgProvider.packages.isEmpty
              ? const Center(child: Text('Belum ada paket tersedia.'))
              : RefreshIndicator(
                  onRefresh: () => pkgProvider.fetchPackages(),
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: pkgProvider.packages.length,
                    itemBuilder: (context, index) {
                      final pkg = pkgProvider.packages[index];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 16),
                        clipBehavior: Clip.antiAlias,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              height: 140,
                              color: const Color(0xFF15803D).withOpacity(0.1),
                              child: const Center(
                                child: Icon(
                                  Icons.eco_rounded,
                                  size: 60,
                                  color: Color(0xFF15803D),
                                ),
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    pkg['name'] ?? 'Paket Edukasi',
                                    style: const TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    pkg['description'] ?? '',
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                      color: Colors.grey.shade700,
                                      fontSize: 13,
                                    ),
                                  ),
                                  const SizedBox(height: 12),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        currencyFormat.format(pkg['price_per_person'] ?? 0),
                                        style: const TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold,
                                          color: Color(0xFF15803D),
                                        ),
                                      ),
                                      ElevatedButton(
                                        onPressed: () {
                                          Navigator.push(
                                            context,
                                            MaterialPageRoute(
                                              builder: (ctx) => BookingWizardScreen(packageData: pkg),
                                            ),
                                          );
                                        },
                                        style: ElevatedButton.styleFrom(
                                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                                        ),
                                        child: const Text('Pilih & Pesan'),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}

class UserBookingsTab extends StatefulWidget {
  const UserBookingsTab({super.key});

  @override
  State<UserBookingsTab> createState() => _UserBookingsTabState();
}

class _UserBookingsTabState extends State<UserBookingsTab> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<BookingProvider>().fetchMyBookings();
    });
  }

  @override
  Widget build(BuildContext context) {
    final bookingProvider = context.watch<BookingProvider>();

    return Scaffold(
      appBar: AppBar(title: const Text('Riwayat Reservasi Saya')),
      body: bookingProvider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : bookingProvider.myBookings.isEmpty
              ? const Center(child: Text('Belum ada reservasi aktif.'))
              : RefreshIndicator(
                  onRefresh: () => bookingProvider.fetchMyBookings(),
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: bookingProvider.myBookings.length,
                    itemBuilder: (context, index) {
                      final b = bookingProvider.myBookings[index];
                      final status = b['status'] ?? 'pending';

                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: ListTile(
                          contentPadding: const EdgeInsets.all(16),
                          title: Text(
                            'Kode: #${b['booking_code'] ?? b['id']}',
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const SizedBox(height: 6),
                              Text('Tanggal: ${b['booking_date'] ?? '-'}'),
                              Text('Peserta: ${b['total_participants'] ?? 0} Orang'),
                              const SizedBox(height: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: status == 'confirmed'
                                      ? Colors.green.shade100
                                      : status == 'rejected'
                                          ? Colors.red.shade100
                                          : Colors.amber.shade100,
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  status.toString().toUpperCase(),
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: status == 'confirmed'
                                        ? Colors.green.shade800
                                        : status == 'rejected'
                                            ? Colors.red.shade800
                                            : Colors.amber.shade900,
                                  ),
                                ),
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

class UserProfileTab extends StatelessWidget {
  const UserProfileTab({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;

    return Scaffold(
      appBar: AppBar(title: const Text('Profil Pengguna')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            const CircleAvatar(
              radius: 40,
              backgroundColor: Color(0xFF15803D),
              child: Icon(Icons.person, size: 40, color: Colors.white),
            ),
            const SizedBox(height: 16),
            Text(
              user?['name'] ?? 'Pengunjung Polinela',
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            Text(
              user?['email'] ?? '-',
              style: const TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 8),
            Text(
              'Instansi: ${user?['agency'] ?? user?['institution_name'] ?? 'Pribadi'}',
              style: const TextStyle(color: Colors.grey),
            ),
            const Spacer(),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red.shade600,
                minimumSize: const Size.fromHeight(50),
              ),
              onPressed: () => auth.logout(),
              child: const Text('Keluar (Logout)'),
            ),
          ],
        ),
      ),
    );
  }
}
