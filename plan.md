# Perencanaan Unit Testing untuk POS React

**Tujuan:**
Menyediakan panduan pengujian terotomatisasi (Unit Test & Integration Test) untuk memastikan stabilitas dan keandalan fungsionalitas aplikasi React POS. Semua test akan ditulis dan ditempatkan di dalam direktori `test/` (atau `tests/`).

**Aturan Umum:**
1. **Lokasi File:** Letakkan semua file pengujian (seperti `*.test.js` atau `*.spec.js`) di dalam folder `test/` dengan mempertahankan hierarki direktori yang serupa dengan `src/`.
2. **Konsistensi Data (Isolasi):** Setiap skenario pengujian *wajib* menghapus data/mereset *state* (misalnya: *clear mocks*, *reset Zustand store*, bersihkan *mock LocalStorage*) di blok `beforeEach` atau `afterEach` agar tidak ada kebocoran *state* antar pengujian.
3. **Fokus Skenario:** Fokus pada input, interaksi pengguna, dan ekspektasi *output/state*, biarkan detail *mocking* dan implementasinya ditangani saat eksekusi pembuatan kode.

---

## Skenario Pengujian (Test Scenarios)

### 1. API Services Layer (`test/api/services/`)
Menguji semua fungsi di dalam *Service Pattern* secara terisolasi dengan melakukan *mocking* pada Axios.
*   **authService:**
    *   Test sukses login (mengembalikan token).
    *   Test gagal login (kredensial salah).
    *   Test *fetch profile*.
*   **productService & categoryService:**
    *   Test mengambil daftar produk/kategori.
    *   Test membuat, mengedit, dan menghapus entitas.
*   **transactionService:**
    *   Test memproses checkout transaksi.
    *   Test membatalkan dan meretur transaksi.
*   **Lainnya (inventory, cashFlow, report, settings):**
    *   Test *fetching* data statistik, ringkasan arus kas, pengaturan toko, dan manajemen metode pembayaran.

### 2. State Management (Zustand) (`test/store/`)
Menguji logika *state* global tanpa *rendering* UI.
*   **useAuthStore:**
    *   Test set user dan token saat proses otentikasi.
    *   Test hapus data user dan token (logout).
*   **useCartStore:**
    *   Test menambahkan produk ke keranjang (tambah item baru vs item yang sudah ada).
    *   Test mengubah kuantitas (tambah/kurang) dan memastikan stok maksimum tidak terlampaui.
    *   Test menghapus item spesifik dari keranjang.
    *   Test menghapus seluruh isi keranjang (*clear cart*).
    *   Test kalkulasi subtotal dan grand total secara akurat.

### 3. Custom Hooks (`test/hooks/`)
*   **useStockAlerts:**
    *   Test mendeteksi jumlah stok kritis ketika data produk diberikan.
*   **useBarcodeScanner:**
    *   Test apakah input *keyboard buffer* dikenali dengan benar sebagai *barcode* dan memicu fungsi *callback*.

### 4. Components & Pages (`test/components/` & `test/pages/`)
Menggunakan *React Testing Library* untuk menyimulasikan interaksi pengguna.
*   **Authentication (Login/Register):**
    *   Test *rendering* form login.
    *   Test validasi pesan error jika form dikirim kosong.
    *   Test navigasi ke *dashboard* setelah login berhasil.
*   **Halaman POS (Point of Sales):**
    *   Test produk muncul di *grid*.
    *   Test mengklik produk menambahkan produk ke komponen *Cart Sidebar*.
    *   Test memunculkan modal *checkout* saat tombol bayar ditekan.
*   **Manajemen Produk & Kategori:**
    *   Test fungsionalitas pencarian (mengetik di kolom pencarian memfilter hasil).
    *   Test menekan tombol "Tambah" memunculkan *modal* form.
*   **Transaksi & Laporan:**
    *   Test tabel transaksi merender data dengan benar.
    *   Test perubahan filter tanggal merender ulang data sesuai parameter baru.
*   **Settings (Pengaturan Toko & Metode Pembayaran):**
    *   Test *toggle switch* mengubah status aktif/tidak metode pembayaran.
    *   Test form edit profile mengirimkan format data yang benar.

---

**Catatan untuk Implementator:**
Jangan lupa untuk melakukan *setup test environment* (seperti `vitest` atau `jest`, beserta `jsdom` dan `@testing-library/react`) jika belum terkonfigurasi di `package.json` sebelum mulai menulis skenario di atas.
