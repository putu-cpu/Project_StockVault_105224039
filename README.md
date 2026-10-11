# StokVault — Verifiable Stock Ledger & Automated Invoicing Platform

**StokVault** adalah platform *consignment ledger* B2B yang dirancang khusus untuk memodernisasi dan mengotomatisasi alur kerja konsinyasi antara **CV. Alam Zempol** (pemasok produk perawatan tubuh organik dan *amenities* hotel) dengan hotel-hotel mitranya (seperti Grand Hyatt Bali dan Ayana Resort Bali).

Sistem ini menyelesaikan masalah penundaan pembayaran (*payment delay*) melalui mekanisme **Immutable Data Locking** (Penguncian Data Permanen) yang dilengkapi stempel digital Kriptografi **SHA-256**, kalkulasi sisa stok (*Stock Opname*) secara otomatis, *Real-Time Invoicing*, serta alur kerja durasi kontrak bulanan.

---

## 📋 Daftar Isi
1. [Konsep Produk & Permasalahan](#-konsep-produk--permasalahan)
2. [Fitur Utama](#-fitur-utama)
3. [Arsitektur & Teknologi Stack](#-arsitektur--teknologi-stack)
4. [Struktur Folder Proyek](#-struktur-folder-proyek)
5. [Petunjuk Instalasi & Jalankan Proyek](#-petunjuk-instalasi--jalankan-proyek)
6. [Pengujian Akun Demo](#-pengujian-akun-demo)
7. [Komponen Kriptografi & Automated Testing (v0.1)](#-komponen-kriptografi--automated-testing-v01)
8. [Dokumentasi Keamanan Siber (sec-0.1)](#-dokumentasi-keamanan-siber-sec-01)
9. [Kepatuhan Aksesibilitas & Responsivitas](#-kepatuhan-aksesibilitas--responsivitas)

---

## 🎯 Konsep Produk & Permasalahan

### **Permasalahan Utama**
Dalam skema konsinyasi produk perawatan tubuh di industri perhotelan, transaksi manual sering mengalami kendala:
* **Penundaan Pembayaran:** Pihak *Finance* hotel menunda tagihan karena perselisihan data jumlah barang awal yang dikirim.
* **Manipulasi Data:** Risiko pembukuan ganda atau perubahan harga sepihak setelah barang fisik diterima.
* **Proses Stock Opname Lambat:** Perhitungan tagihan bulanan dilakukan secara manual yang rentan terhadap kesalahan (*human error*).

### **Solusi StokVault**
* **Penguncian Data Berbasis Kriptografi:** Staf hotel mengonfirmasi jumlah barang fisik riil dan menekan tombol **"Accept Delivery & Lock Stock"**, membekukan data penerimaan dan menerbitkan *Signature Hash SHA-256*.
* **Otomatisasi Tagihan Bulanan (Recurring Invoicing):** Pemilihan durasi kontrak (misal: 2 Bulan) secara otomatis menggenerasi daftar tagihan bulanan secara teratur. Tagihan dihitung otomatis berdasarkan rumus:
  $$\text{Total Tagihan} = (\text{Barang Diterima} - \text{Sisa Stok}) \times \text{Harga Satuan}$$
* **Ruang Kerja Terisolasi (Folder Isolation):** Mengisolasi data dan transaksi per hotel mitra tanpa risiko kebocoran data antar hotel.
* **Fresh Start (Tanpa Data Dummy Awal):** Aplikasi dimulai dari kondisi **kosong (*empty state*)** sehingga seluruh data yang muncul murni berasal dari input pengguna secara langsung.

---

## 🚀 Fitur Utama

| Fitur | Deskripsi | Peran (Role) |
| :--- | :--- | :--- |
| **Master Catalog Management** | Kelola katalog produk master CV. Alam Zempol (Nama, Kategori, Ukuran, Harga IDR). | Seller |
| **Simplified Delivery Tracker** | Pembaruan status pengiriman secara manual (`PREPARING` $\rightarrow$ `IN_TRANSIT`) tanpa tombol *Create Delivery* kaku. | Seller |
| **Arrival & Immutable Locking** | Konfirmasi barang tiba (`ARRIVED`) dan penguncian data permanen disertai stempel SHA-256. | Hotel (Buyer) |
| **Contract Duration & Auto-Billing** | Penentuan durasi kontrak (misal: 1, 2, 6, 12 bulan) yang otomatis menghasilkan jadwal tagihan bulanan. | Hotel (Buyer) |
| **Contract Termination Approval** | Pengajuan pembatalan/pemutusan kontrak oleh hotel memerlukan persetujuan (*Approval*) dari Seller sebelum berstatus `TERMINATED`. | Hotel & Seller |
| **Edit Access Approval Flow** | Alur persetujuan saat Seller mengajukan pembukaan akses edit pada data yang terlanjur terkunci. | Seller & Hotel |
| **Centralized Hotel Dashboard** | Dashboard hotel yang di-redesain rapi dengan tab *Locked Items*, *Monthly Billing*, *Pending Verification*, dan *Terminated Contracts*. | Hotel (Buyer) |
| **Interactive Payment Gateway** | Pilihan pembayaran interaktif (Virtual Account BCA/Mandiri, QRIS, Transfer Bank) yang otomatis memperbarui status menjadi **PAID**. | Hotel (Buyer) |

---

## 🛠️ Arsitektur & Teknologi Stack

* **Frontend Framework:** React 18 dengan TypeScript
* **Build Tool & Server:** Vite (Port `localhost:3000`)
* **Styling & UI:** Tailwind CSS & Custom Directives (`src/styles.css`)
* **Testing Framework:** Vitest
* **Icons & Assets:** Lucide React Icons
* **Data Persistence (Mock):** TypeScript Data Module (`src/data/mockData.ts`)

---

## 📁 Struktur Folder Proyek

```text
Project_Pemweb/
└── project/
    ├── dist/                       # Output Build Produksi
    ├── docs/                       # Dokumentasi & Bukti Pengujian UI/UX
    │   ├── 360 px.png              # Bukti Tampilan Mobile
    │   ├── 768 px.png              # Bukti Tampilan Tablet
    │   ├── 1280 px.png             # Bukti Tampilan Desktop
    │   ├── AI_LOG.md               # Log Penggunaan AI (Gemini)
    │   └── lighthouse.png          # Bukti Skor Aksesibilitas Lighthouse (≥ 85)
    ├── node_modules/               # Dependensi Proyek
    ├── public/                     # Aset Publik
    ├── security/                   # Berkas Analisis Keamanan Siber (Tag sec-0.1)
    │   ├── asset-inventory.md      # Inventarisasi Aset Sistem & Data
    │   ├── dfd.md                  # Data Flow Diagram Level 1 (2 Trust Boundaries)
    │   ├── risk-register.md        # Matriks & Rencana Kontrol 5 Risiko Prioritas
    │   └── threat-model.md         # 10 Ancaman STRIDE
    ├── src/                        # Kode Sumber Utama
    │   ├── components/             # Komponen Reusable (Sidebar, Modals, StatusBadge, dll.)
    │   ├── data/                   # Mock Data (mockData.ts — Katalog CV. Alam Zempol)
    │   ├── hooks/                  # Custom React Hooks
    │   ├── pages/                  # Halaman Utama (LoginPage, SellerDashboardPage, HotelDashboardPage)
    │   ├── types/                  # Interface & Tipe TypeScript (index.ts)
    │   └── utils/                  # Utilitas Kriptografi & Unit Test
    │       ├── crypto.ts           # Implementasi Hash SHA-256
    │       └── crypto.test.ts      # 4 Skenario Automated Testing (Vitest)
    ├── App.tsx                     # Component Root & State Routing
    ├── main.tsx                    # React Entry Point
    ├── styles.css                  # Custom Tailwind & CSS Directives
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts              # Konfigurasi Server Port 3000
    └── README.md

```
# 📘 Petunjuk Instalasi & Jalankan Proyek

## 1. Prasyarat

Pastikan Anda telah menginstal **Node.js** (versi 18 atau lebih baru) dan **npm** di komputer Anda.

---

## 2. Kloning Repositori & Instalasi Dependensi

```bash
# Masuk ke direktori proyek
cd project

# Instal seluruh dependensi
npm install
```

---

## 3. Jalankan Pengujian Kriptografi Otomatis

```bash
npm run test
```

---

## 4. Jalankan Server Lokal

```bash
npm run dev
```

Buka peramban (*browser*) Anda dan akses:

👉 [http://localhost:3000](http://localhost:3000)

---

## 🔑 Pengujian Akun Demo

Aplikasi menggunakan **Single Login Card** dengan kredensial bantuan demo:

1. **Seller Workspace (CV. Alam Zempol)**
   - **Email:** `seller@alamzempol.com`
   - **Password:** *(karakter bebas)*

2. **Hotel Partner 1 (Grand Hyatt Bali)**
   - **Email:** `hotel@grandhyatt.com`
   - **Password:** *(karakter bebas)*

3. **Hotel Partner 2 (Ayana Resort Bali)**
   - **Email:** `hotel@ayana.com`
   - **Password:** *(karakter bebas)*


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

**StokVault** adalah platform *consignment ledger* B2B untuk **CV. Alam Zempol** (pemasok produk perawatan tubuh organik) dan hotel mitranya (seperti Grand Hyatt Bali dan Ayana Resort Bali). 

Aplikasi ini memfasilitasi pencatatan penerimaan barang, *stock opname*, dan pembayaran[cite: 1]. Untuk mencegah perselisihan tagihan dan manipulasi data di kemudian hari, StokVault menerapkan **Immutable Data Locking** berbasis stempel digital kriptografi (*SHA-256 Hash Signature*) saat pihak hotel menyetujui penerimaan barang fisik.

---

## 🔒 2. Tabel Kebutuhan Keamanan Data

| Data / Fungsi Produk | Tujuan Keamanan | Prioritas |
| :--- | :--- | :--- |
| **Penerimaan Stok (*Locked Record*)** | **Integrity (Integritas):** Memastikan rincian barang dan jumlah yang disetujui tidak dapat diubah secara ilegal oleh pihak manapun. | High |
| **Bukti Digital Persetujuan Hotel** | **Non-Repudiation (Nirpenyangkalan):** Membuktikan secara digital bahwa staf hotel telah memverifikasi dan menyetujui fisik barang pada waktu tertentu. | High |
| **Integritas Tagihan (*Invoicing Data*)** | **Authenticity (Keotentikan):** Memastikan kalkulasi total tagihan berasal dari data sisa stok yang sah dan terverifikasi. | Medium |

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


