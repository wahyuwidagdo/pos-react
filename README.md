# KALA POS - Frontend (React)

Aplikasi frontend point-of-sale modern, dibangun dengan React, Vite, dan Mantine UI.

## 🚀 Fitur Utama
- **Kasir (POS)**: Layar transaksi modern yang dioptimalkan untuk performa dengan fitur scan barcode.
- **Manajemen Produk & Inventaris**: Sinkronisasi stok otomatis, peringatan stok menipis (Low Stock Alert).
- **Arus Kas & Pelaporan**: Mencatat arus kas (Income/Expense) dan memvisualisasikan performa penjualan via Dashboard.
- **Manajemen Pengguna**: Multi-role support (Admin, Manager, Cashier) dengan proteksi akses yang ketat.
- **Kustomisasi Toko**: Pengaturan identitas toko (nama, kontak, logo struk) dan metode pembayaran (Cash/QRIS).

## 🛠️ Tech Stack
- **Framework:** React 19 + Vite
- **UI Component Library:** Mantine UI v8
- **State Management:** Zustand (Global State) + TanStack React Query (Server State / Caching)
- **Routing:** React Router DOM v7
- **HTTP Client:** Axios (dengan Global Interceptor)

## 📦 Panduan Instalasi & Setup

1. **Clone repository ini** dan masuk ke dalam folder project:
   ```bash
   cd pos-react
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment:**
   Project ini membutuhkan file `.env` untuk menghubungkan *frontend* ke *backend API* (Golang).
   Salin file konfigurasi *template* ke `.env`:
   ```bash
   cp .env.example .env
   ```
   Pastikan variabel `VITE_API_URL` mengarah ke URL API backend Anda (contoh: `http://localhost:3000/api/v1`).

4. **Jalankan Aplikasi di Mode Development:**
   ```bash
   npm run dev
   ```
   Aplikasi akan terbuka di `http://localhost:5173`.
