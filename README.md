# StokVault — Verifiable Stock Ledger & Automated Invoicing Platform

**StokVault** adalah platform *consignment ledger* B2B yang dirancang khusus untuk memodernisasi dan mengotomatisasi alur kerja konsinyasi antara **CV. Alam Zempol** (pemasok produk perawatan tubuh organik dan *amenities* hotel) dengan hotel-hotel mitranya (seperti Grand Hyatt Bali dan Ayana Resort Bali).

Sistem ini menyelesaikan masalah penundaan pembayaran (*payment delay*) melalui mekanisme **Immutable Data Locking** (Penguncian Data Permanen) yang dilengkapi stempel digital Kriptografi **SHA-256**, kalkulasi sisa stok (*Stock Opname*) secara otomatis, serta *Real-Time Invoicing*.

---

## 📋 Daftar Isi
1. [Konsep Produk & Permasalahan](#-konsep-produk--permasalahan)
2. [Fitur Utama](#-fitur-utama)
3. [Arsitektur & Teknologi Stack](#-arsitektur--teknologi-stack)
4. [Struktur Folder Proyek](#-struktur-folder-proyek)
5. [Petunjuk Instalasi & Jalankan Proyek](#-petunjuk-instalasi--jalankan-proyek)
6. [Pengujian Akun Demo](#-pengujian-akun-demo)
7. [Komponen Kriptografi & Testing](#-komponen-kriptografi--testing)
8. [Kepatuhan Aksesibilitas & Responsivitas](#-kepatuhan-aksesibilitas--responsivitas)

---

## 🎯 Konsep Produk & Permasalahan

### **Permasalahan Utama**
Dalam skema konsinyasi produk perawatan tubuh di industri perhotelan, transaksi manual sering mengalami kendala:
* **Penundaan Pembayaran:** Pihak *Finance* hotel menunda tagihan karena perselisihan data jumlah barang awal yang dikirim.
* **Manipulasi Data:** Risiko pembukuan ganda atau perubahan harga sepihak setelah barang fisik diterima.
* **Proses Stock Opname Lambat:** Perhitungan tagihan bulanan dilakukan secara manual yang rentan terhadap kesalahan (*human error*).

### **Solusi StokVault**
* **Penguncian Data Berbasis Kriptografi:** Staf hotel mengonfirmasi jumlah barang fisik riil dan menekan tombol **"Approve & Permanently Lock Data"**, membekukan data penerimaan dan menerbitkan *Signature Hash SHA-256*.
* **Otomatisasi Tagihan (Real-Time Invoicing):** Tagihan dihitung otomatis berdasarkan rumus:
  $$\text{Total Tagihan} = (\text{Barang Diterima} - \text{Sisa Stok}) \times \text{Harga Satuan}$$
* **Ruang Kerja Terisolasi (Folder Isolation):** Mengisolasi data dan transaksi per hotel mitra tanpa risiko kebocoran data antar hotel.
* **Fresh Start (Tanpa Data Dummy Awal):** Aplikasi dimulai dari kondisi **kosong (*empty state*)** sehingga seluruh data yang muncul murni berasal dari input pengguna secara langsung.

---

## 🚀 Fitur Utama

| Fitur | Deskripsi | Peran (Role) |
| :--- | :--- | :--- |
| **Master Catalog Management** | Menambah, memperbarui, dan mengelola katalog produk master CV. Alam Zempol. | Seller |
| **Hotel Workspace Isolation** | Folder terpisah khusus tiap hotel mitra (*Grand Hyatt Bali*, *Ayana Resort Bali*). | Seller & Hotel |
| **Immutable Locking & Hash SHA-256** | Mengunci data penerimaan barang secara permanen dan menerbitkan bukti digital. | Hotel (Buyer) |
| **Edit Access Approval Flow** | Alur persetujuan saat Seller mengajukan pembukaan akses edit pada data yang terlanjur terkunci. | Seller & Hotel |
| **Consolidated "Locked Stock" View** | Ringkasan terpusat seluruh daftar stok produk yang telah dikunci dalam satu halaman. | Seller & Hotel |
| **Real-Time Stock Opname & Invoicing** | Pengisian sisa stok (*Remaining Stock*) yang seketika mengaktifkan tombol pembayaran *Pay Now*. | Hotel (Buyer) |
| **Interactive Payment Gateway** | Pilihan metode pembayaran interaktif (Virtual Account BCA/Mandiri, QRIS, Transfer Bank) yang otomatis memperbarui status menjadi **PAID**. | Hotel (Buyer) |
| **Terminated Contract & Delete Action** | Menandai kontrak yang berakhir (*Terminated*) dan opsi tombol **Delete** untuk menghapus permanen catatan dari workspace. | Seller & Hotel |

---

## 🛠️ Arsitektur & Teknologi Stack

* **Frontend Framework:** React 18 dengan TypeScript
* **Build Tool & Server:** Vite (dikonfigurasi pada port `localhost:3000`)
* **Styling & UI:** Tailwind CSS & Custom Styles (`src/styles.css`)
* **Testing Framework:** Vitest
* **Icons & Assets:** Lucide React Icons
* **Data Persistence (Mock):** TypeScript Data Module (`src/data/mockData.ts`)

---

## 📁 Struktur Folder Proyek

```text
project/
├── docs/                      # Dokumentasi & Bukti Pengujian
│   ├── 360 px.png             # Bukti Tampilan Mobile
│   ├── 768 px.png             # Bukti Tampilan Tablet
│   ├── 1280 px.png            # Bukti Tampilan Desktop
│   ├── lighthouse.png         # Bukti Skor Aksesibilitas Lighthouse (≥ 85)
│   └── AI_LOG.md              # Log penggunaan kecerdasan buatan
├── public/                    # Aset Publik
├── src/                       # Kode Sumber Utama
│   ├── components/            # Komponen Antarmuka Reusable
│   │   ├── Sidebar.tsx        # Navigasi utama dengan Logo StokVault
│   │   ├── StatusBadge.tsx    # Indikator status (LOCKED, PENDING, PAID, TERMINATED)
│   │   ├── StatCard.tsx       # Ringkasan metrik dashboard
│   │   ├── DataTable.tsx      # Tabel data terstruktur
│   │   ├── ModalConfirmation.tsx # Dialog konfirmasi penguncian/penghapusan data
│   │   ├── PaymentModal.tsx   # Modal Payment Gateway
│   │   ├── ProductCatalogModal.tsx # Modal pilihan katalog master CV. Alam Zempol
│   │   └── EditRequestModal.tsx # Modal persetujuan izin akses edit
│   ├── data/                  # Mock Data
│   │   └── mockData.ts        # Katalog Master CV. Alam Zempol (0 transaksi awal)
│   ├── hooks/                 # Custom React Hooks
│   ├── pages/                 # Halaman Aplikasi
│   │   ├── LoginPage.tsx      # Single Login Card
│   │   ├── SellerDashboardPage.tsx # Dashboard CV. Alam Zempol
│   │   └── HotelDashboardPage.tsx  # Workspace Khusus Hotel
│   ├── types/                 # Definisi Tipe TypeScript
│   │   └── index.ts
│   ├── utils/                 # Utilities & Fungsi Kriptografi
│   │   ├── crypto.ts          # Fungsi pembuat SHA-256 Hash & Verifikasi
│   │   └── crypto.test.ts     # 4 Skenario Unit Testing Kriptografi
│   ├── App.tsx                # Entry Root Component & State Routing
│   ├── main.tsx               # Entry Point Aplikasi
│   └── styles.css             # Custom CSS Directives
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts             # Konfigurasi Server Port 3000
└── README.md

```


## Run locally

Use Node.js 20 or newer.

```bash
npm install
npm run dev
```

Vite starts on port 3000 and automatically tries the next available port if it is occupied. Run `npm run check` for TypeScript validation and `npm run build` for a production build.

## Prototype boundaries

The catalog, partner directory, and demo identities are local TypeScript data; there are no pre-populated transactions. Changes exist in browser memory and reset on refresh. Login is a routing demo, not authentication, and client-side filtering is not a security boundary. SHA-256 is a browser-generated snapshot fingerprint, not a trusted digital signature. Bank methods and payment confirmation are simulations; no funds move and transfer slips are not uploaded. Production requires server-enforced hotel isolation, authentication, durable append-only records, trusted signing, persistent storage, and a payment provider.


# Dokumentasi Kebutuhan & Komponen Kriptografi — StokVault

Dokumen ini menjelaskan rancangan, kebutuhan, implementasi, dan pengujian komponen kriptografi pada aplikasi web **StokVault** untuk memenuhi ketentuan Milestone Kriptografi (Tag `v0.1`).

---

## 📌 1. Deskripsi Ringkas Produk

**StokVault** adalah platform *consignment ledger* B2B untuk **CV. Alam Zempol** (pemasok produk perawatan tubuh organik) dan hotel mitranya (seperti Grand Hyatt Bali dan Ayana Resort Bali)[cite: 1]. 

Aplikasi ini memfasilitasi pencatatan penerimaan barang, *stock opname*, dan pembayaran[cite: 1]. Untuk mencegah perselisihan tagihan dan manipulasi data di kemudian hari, StokVault menerapkan **Immutable Data Locking** berbasis stempel digital kriptografi (*SHA-256 Hash Signature*) saat pihak hotel menyetujui penerimaan barang fisik[cite: 1].

---

## 🔒 2. Tabel Kebutuhan Keamanan Data

| Data / Fungsi Produk | Tujuan Keamanan | Prioritas |
| :--- | :--- | :--- |
| **Penerimaan Stok (*Locked Record*)** | **Integrity (Integritas):** Memastikan rincian barang dan jumlah yang disetujui tidak dapat diubah secara ilegal oleh pihak manapun[cite: 1]. | High |
| **Bukti Digital Persetujuan Hotel** | **Non-Repudiation (Nirpenyangkalan):** Membuktikan secara digital bahwa staf hotel telah memverifikasi dan menyetujui fisik barang pada waktu tertentu[cite: 1]. | High |
| **Integritas Tagihan (*Invoicing Data*)** | **Authenticity (Keotentikan):** Memastikan kalkulasi total tagihan berasal dari data sisa stok yang sah dan terverifikasi[cite: 1]. | Medium |

---

## 📐 3. Rancangan Komponen Kriptografi

Komponen kriptografi bertindak sebagai **Digital Stamper** saat transaksi berstatus `LOCKED`.

### **Spesifikasi Teknis:**
* **Masukan (*Input*):**
  * `transactionId` (string, contoh: `"LF-2610-005"`)
  * `hotelId` (string, contoh: `"grand-hyatt"`)
  * `timestamp` (string ISO, contoh: `"2026-10-11T10:00:00Z"`)
  * `totalItems` (number, total kuantitas barang yang diterima)
* **Proses (*Process*):**
  1. Validasi keberadaan atribut wajib pada *payload*.
  2. Penggabungan atribut menjadi string kanonis terstruktur dengan pemisah pipe (`|`).
  3. Pembuatan *digest hash* menggunakan algoritma **SHA-256** dari pustaka teruji (`crypto-js`).
* **Keluaran (*Output*):** String Hexadecimal Hash sepanjang 64 karakter (contoh: `b4cf8778f02a181ff385a5dfcbf920b1...`).
* **Representasi Data:** Text String (Hexadecimal / Base64).
* **Sumber Keacakan (*Randomness Source*):** `crypto.getRandomValues()` (CSPRNG bawaan peramban web) digunakan saat membutuhkan generasi *Salt/Nonce* acak.

---


