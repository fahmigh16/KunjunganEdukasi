const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminDashboard.jsx', 'utf8');

// 1. Add selectedSchool state
code = code.replace(
  'const [selectedBooking, setSelectedBooking] = useState(null);',
  'const [selectedBooking, setSelectedBooking] = useState(null);\n  const [selectedSchool, setSelectedSchool] = useState(null);'
);

// 2. Add schoolsList
code = code.replace(
  'const filteredBookings = bookings.filter((b) => {',
  `const schoolsList = Object.values(bookings.reduce((acc, b) => {
    if (!acc[b.schoolName]) {
      acc[b.schoolName] = {
        schoolName: b.schoolName,
        visitorName: b.visitorName,
        phone: b.phone,
        city: b.city,
        province: b.province,
        totalBookings: 0,
        totalAnak: 0,
        totalGuru: 0,
        waitingPayment: 0,
        waitingVerification: 0,
        approved: 0,
        rejected: 0,
        bookings: []
      };
    }
    const s = acc[b.schoolName];
    s.totalBookings += 1;
    s.totalAnak += (b.studentCount || 0);
    s.totalGuru += (b.teacherCount || 0);
    if (b.status === 'APPROVED') s.waitingPayment += 1;
    if (b.status === 'PAYMENT_SUBMITTED') s.waitingVerification += 1;
    if (b.status === 'CONFIRMED') s.approved += 1;
    if (b.status === 'REJECTED') s.rejected += 1;
    s.bookings.push(b);
    return acc;
  }, {}));

  const filteredBookings = bookings.filter((b) => {`
);

// 3. Add sidebar button for Rekap Sekolah
const sidebarBookingsBtn = `<button
              onClick={() => setActiveTab('bookings')}
              className={\`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-colors cursor-pointer \${
                activeTab === 'bookings' ? 'bg-blue-700 text-white shadow-md font-extrabold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }\`}
            >`;
const sidebarSchoolsBtn = `<button
              onClick={() => setActiveTab('schools')}
              className={\`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-colors cursor-pointer \${
                activeTab === 'schools' ? 'bg-blue-700 text-white shadow-md font-extrabold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }\`}
            >
              <Building className="w-4 h-4" />
              <span>Rekap Sekolah</span>
            </button>
            `;

code = code.replace(sidebarBookingsBtn, sidebarSchoolsBtn + sidebarBookingsBtn);

// 4. Update Header title
code = code.replace(
  "{activeTab === 'bookings' && 'Manajemen Booking Kunjungan'}",
  "{activeTab === 'bookings' && 'Manajemen Booking Kunjungan'}\n              {activeTab === 'schools' && 'Rekap Booking Per Sekolah'}"
);

// 5. Add schools tab content
const schoolsTabContent = `
        {/* TAB: REKAP SEKOLAH */}
        {activeTab === 'schools' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900">Rekap Booking Per Sekolah</h3>
              <p className="text-xs text-slate-500 mt-1">Daftar semua sekolah dan riwayat booking mereka.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-4">Nama Sekolah</th>
                    <th className="p-4">Kota/Provinsi</th>
                    <th className="p-4">Total Booking</th>
                    <th className="p-4">Total Siswa</th>
                    <th className="p-4">Total Guru</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {schoolsList.map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-900">{s.schoolName}</td>
                      <td className="p-4">{s.city}, {s.province}</td>
                      <td className="p-4 font-bold text-blue-700">{s.totalBookings} Booking</td>
                      <td className="p-4">{s.totalAnak}</td>
                      <td className="p-4">{s.totalGuru}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedSchool(s)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition-colors cursor-pointer border border-slate-300 shadow-sm"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                  {schoolsList.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 font-normal">Belum ada data sekolah.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
`;
code = code.replace(
  "{/* MODAL 1: RINCIAN BOOKING DETAIL (ADMIN) */}",
  schoolsTabContent + "\n\n      {/* MODAL 1: RINCIAN BOOKING DETAIL (ADMIN) */}"
);

// 6. Change old modal title just in case (as per instructions)
code = code.replace(
  '<h3 className="text-2xl font-extrabold text-slate-900">Detail Permintaan Booking</h3>',
  '<h3 className="text-2xl font-extrabold text-slate-900">Detail Booking</h3>'
);

// 7. Add selectedSchool modal
const schoolModal = `
      {/* MODAL: REKAP SEKOLAH */}
      {selectedSchool && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-5xl w-full text-slate-900 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedSchool(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h3 className="text-2xl font-extrabold text-slate-900">Rekap Booking Per Sekolah</h3>
              <p className="text-sm text-slate-500 mt-1">Riwayat Booking dan Kunjungan Sekolah: <span className="font-bold text-slate-800">{selectedSchool.schoolName}</span></p>
            </div>

            {/* Statistik */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-1">Total Booking</span>
                <span className="text-xl font-black text-slate-900">{selectedSchool.totalBookings}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-blue-200 shadow-sm">
                <span className="text-[10px] uppercase tracking-wider text-blue-800 font-bold block mb-1">Total Anak</span>
                <span className="text-xl font-black text-blue-700">{selectedSchool.totalAnak}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-indigo-200 shadow-sm">
                <span className="text-[10px] uppercase tracking-wider text-indigo-800 font-bold block mb-1">Total Guru</span>
                <span className="text-xl font-black text-indigo-700">{selectedSchool.totalGuru}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-teal-200 shadow-sm">
                <span className="text-[10px] uppercase tracking-wider text-teal-800 font-bold block mb-1">Aktivitas Tersedia</span>
                <span className="text-xl font-black text-teal-700">{aktivitasTersedia}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-rose-200 shadow-sm">
                <span className="text-[10px] uppercase tracking-wider text-rose-800 font-bold block mb-1">Aktv Tidak Tersedia</span>
                <span className="text-xl font-black text-rose-700">{aktivitasTidakTersedia}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-amber-200 shadow-sm">
                <span className="text-[10px] uppercase tracking-wider text-amber-800 font-bold block mb-1">Mnggu Pembayaran</span>
                <span className="text-xl font-black text-amber-700">{selectedSchool.waitingPayment}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-purple-200 shadow-sm">
                <span className="text-[10px] uppercase tracking-wider text-purple-800 font-bold block mb-1">Mnggu Verifikasi</span>
                <span className="text-xl font-black text-purple-700">{selectedSchool.waitingVerification}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-emerald-200 shadow-sm">
                <span className="text-[10px] uppercase tracking-wider text-emerald-800 font-bold block mb-1">Disetujui/Lunas</span>
                <span className="text-xl font-black text-emerald-700">{selectedSchool.approved}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-red-200 shadow-sm">
                <span className="text-[10px] uppercase tracking-wider text-red-800 font-bold block mb-1">Ditolak</span>
                <span className="text-xl font-black text-red-700">{selectedSchool.rejected}</span>
              </div>
            </div>

            {/* Riwayat Booking */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3">Kode Booking</th>
                      <th className="p-3">Tgl Daftar</th>
                      <th className="p-3">Tgl Kunjungan</th>
                      <th className="p-3">Pemesan</th>
                      <th className="p-3">Anak</th>
                      <th className="p-3">Guru</th>
                      <th className="p-3">Paket & Aktivitas</th>
                      <th className="p-3">Total Biaya</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {selectedSchool.bookings.map(b => (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-blue-700">{b.bookingCode}</td>
                        <td className="p-3">{new Date(b.createdAt).toLocaleDateString('id-ID')}</td>
                        <td className="p-3 font-bold">{b.visitDate}</td>
                        <td className="p-3">{b.visitorName}</td>
                        <td className="p-3">{b.studentCount}</td>
                        <td className="p-3">{b.teacherCount}</td>
                        <td className="p-3">
                          <p className="font-bold">{b.packageName}</p>
                          <p className="text-[10px] text-slate-500 max-w-[150px] truncate">
                            {b.selectedActivities ? JSON.parse(b.selectedActivities).join(', ') : '-'}
                          </p>
                        </td>
                        <td className="p-3 font-bold text-blue-700">Rp {Number(b.totalEstimatedCost).toLocaleString('id-ID')}</td>
                        <td className="p-3">
                          <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-800 text-[10px] font-bold border border-blue-200 block text-center">{b.status}</span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded font-bold transition-colors cursor-pointer"
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}
`;

code = code.replace(
  "{/* APPROVAL MODAL */}",
  schoolModal + "\n\n      {/* APPROVAL MODAL */}"
);

fs.writeFileSync('src/pages/admin/AdminDashboard.jsx', code);
console.log('AdminDashboard.jsx patched successfully.');
