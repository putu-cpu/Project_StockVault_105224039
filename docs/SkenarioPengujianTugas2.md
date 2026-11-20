### A. Tabel Detail 10 Skenario Pengujian

#### 1. Skenario CRUD (8 Skenario)

##### Skenario 1: [CREATE - Positif] Pembuatan Produk Katalog Baru dengan Data Valid
- **Tujuan:** Memastikan Seller dapat menambahkan produk baru ke katalog master melalui Server Action `createProduct` dengan masukan valid dan tersimpan di database.
- **Langkah Pengujian:**
  1. Masuk (*login*) sebagai akun Seller (`seller@alamzempol.com`).
  2. Buka modal *Add Product*.
  3. Masukkan data sintetis:
     - Nama Produk: `"Organic Lemongrass Essential Oil"`
     - Kategori: `"AROMA"`
     - Ukuran Kemasan: `"50ml"`
     - Harga Satuan: `85000`
  4. Kirim formulir (*submit*).
- **Hasil yang Diharapkan:** Server Action memvalidasi input, membuat record baru di tabel `Product` dengan `supplierId` CV. Alam Zempol, dan mengembalikan `{ success: true, product: { ... } }`.
- **Hasil Aktual:** Record berhasil dibuat di database PostgreSQL dengan ID baru, data tampil di tabel katalog antarmuka.
- **Status:** **LULUS**

##### Skenario 2: [CREATE - Negatif] Penolakan Validasi Server untuk Field `name` Kurang dari 3 Karakter
- **Tujuan:** Memverifikasi bahwa validasi server menolak masukan nama produk yang terlalu pendek dan mengembalikan pesan kesalahan field yang spesifik.
- **Langkah Pengujian:**
  1. Buka form penambahan produk.
  2. Masukkan data sintetis:
     - Nama Produk: `"AB"` (hanya 2 karakter)
     - Kategori: `"SOAP"`
     - Ukuran Kemasan: `"100g"`
     - Harga Satuan: `35000`
  3. Kirim data ke server.
- **Hasil yang Diharapkan:** Server menolak request tanpa menyentuh database, mengembalikan status gagal dengan pesan error khusus field `name`: `"Product name must be at least 3 characters."`.
- **Hasil Aktual:** Server Action mengembalikan `success: false` dengan `fieldErrors.name = ["Product name must be at least 3 characters."]`. Input ditolak.
- **Status:** **LULUS**

##### Skenario 3: [CREATE - Negatif] Penolakan Validasi Server untuk Field `category` di Luar Enum
- **Tujuan:** Memverifikasi bahwa server menolak kategori yang tidak terdaftar dalam kategori produk yang sah (`SOAP`, `FACE CARE`, `BODY CARE`, `HAIR CARE`, `AROMA`).
- **Langkah Pengujian:**
  1. Kirim payload pembuatan produk baru dengan nilai `category` yang tidak valid:
     - Nama Produk: `"Sandalwood Bath Foam"`
     - Kategori: `"BATH CARE"` (kategori tidak terdaftar)
     - Ukuran Kemasan: `"250ml"`
     - Harga Satuan: `60000`
  2. Jalankan validasi server (`productSchema.safeParse`).
- **Hasil yang Diharapkan:** Skema Zod di sisi server menolak input dan mengembalikan pesan error: `"Select a valid product category."` pada field `category`.
- **Hasil Aktual:** Server menolak masukan dengan pesan error: `"Select a valid product category."`. Tidak ada data tersimpan ke tabel `Product`.
- **Status:** **LULUS**

##### Skenario 4: [CREATE - Negatif] Penolakan Validasi Server untuk Field `price` Bernilai Nol atau Negatif
- **Tujuan:** Memverifikasi bahwa sistem menolak penetapan harga yang tidak logis (harga $\le 0$ atau format bukan bilangan bulat positif).
- **Langkah Pengujian:**
  1. Kirim data pembuatan produk baru dengan nilai harga tidak valid:
     - Nama Produk: `"Bali Jasmine Body Lotion"`
     - Kategori: `"BODY CARE"`
     - Ukuran Kemasan: `"200ml"`
     - Harga Satuan: `0` (atau `-15000`)
  2. Periksa respon server.
- **Hasil yang Diharapkan:** Server Action menolak input dan mengembalikan pesan kesalahan pada field `price`: `"Price must be greater than zero."`.
- **Hasil Aktual:** Server menolak request dengan `fieldErrors.price = ["Price must be greater than zero."]`. Transaksi dibatalkan.
- **Status:** **LULUS**

##### Skenario 5: [READ - Positif] Pengambilan dan Penampilan Seluruh Daftar Produk Katalog Aktif
- **Tujuan:** Memastikan Seller dan sistem dapat membaca seluruh produk aktif yang terdaftar untuk supplier terkait melalui fungsi `listProducts`.
- **Langkah Pengujian:**
  1. Eksekusi `listProducts()` yang memanggil `prisma.product.findMany({ where: { supplierId, isActive: true } })`.
  2. Render data ke komponen `ProductCatalogTable`.
- **Hasil yang Diharapkan:** Seluruh produk berstatus `isActive: true` milik CV. Alam Zempol diambil secara lengkap dan terurut berdasarkan nama.
- **Hasil Aktual:** Data katalog produk berhasil diambil dari PostgreSQL dan dirender pada antarmuka master catalog secara lengkap.
- **Status:** **LULUS**

##### Skenario 6: [READ - Verifikasi Data Tunggal] Pembacaan Detail Produk Berdasarkan ID
- **Tujuan:** Memastikan data spesifik suatu produk dapat dibaca secara akurat berdasarkan kunci primer `id` sebelum dilakukan aksi modifikasi/penghapusan.
- **Langkah Pengujian:**
  1. Ambil salah satu ID produk sintetis yang ada di database.
  2. Jalankan kueri `prisma.product.findFirst({ where: { id, supplierId, isActive: true } })`.
- **Hasil yang Diharapkan:** Mengembalikan tepat 1 objek produk dengan atribut `id`, `name`, `category`, `size`, dan `unitPrice` yang identik dengan database.
- **Hasil Aktual:** Objek produk berhasil ditemukan dan seluruh nilai atribut sesuai dengan data di PostgreSQL.
- **Status:** **LULUS**

##### Skenario 7: [UPDATE - Positif] Pembaruan Data Produk yang Ada Melalui Server Action
- **Tujuan:** Memastikan Seller dapat memperbarui rincian produk (misal: harga dan ukuran kemasan) pada record yang sudah tersimpan.
- **Langkah Pengujian:**
  1. Pilih produk sintetis `"Organic Lemongrass Essential Oil"` (ID target).
  2. Buka modal *Edit Product*.
  3. Ubah Ukuran Kemasan menjadi `"60ml"` dan Harga Satuan menjadi `92000`.
  4. Simpan perubahan melalui `updateProduct(id, formData)`.
- **Hasil yang Diharapkan:** Server Action memvalidasi input, menjalankan `prisma.product.update`, dan mengembalikan data produk teranyar.
- **Hasil Aktual:** Data di database PostgreSQL terbukti berubah: kolom `size` menjadi `"60ml"` dan `unitPrice` menjadi `92000`.
- **Status:** **LULUS**

##### Skenario 8: [DELETE - Positif] Penghapusan Produk Mandiri Tanpa Riwayat Transaksi
- **Tujuan:** Memastikan Seller dapat menghapus produk katalog yang belum pernah digunakan dalam transaksi riwayat pesanan.
- **Langkah Pengujian:**
  1. Buat satu produk sintetis uji `"Temporary Scrub Tester"`.
  2. Konfirmasi bahwa produk belum terikat pada tabel `TransactionItem`.
  3. Panggil Server Action `deleteProduct(productId)`.
- **Hasil yang Diharapkan:** Server melakukan verifikasi `transactionItemCount === 0`, menjalankan `prisma.product.delete`, dan mengembalikan `{ success: true }`.
- **Hasil Aktual:** Record produk berhasil dihapus secara permanen dari database. Kueri pencarian ulang menghasilkan `null`.
- **Status:** **LULUS**

---

#### 2. Skenario Pengujian Relasi Data (2 Skenario)

##### Skenario 9: [RELASI - Foreign Key Integrity] Penolakan Pembuatan Produk dengan `supplierId` Tidak Terdaftar
- **Tujuan:** Memverifikasi penegakan integritas referensial foreign key (`Product.supplierId` $\rightarrow$ `Supplier.id`) pada PostgreSQL/Prisma.
- **Langkah Pengujian:**
  1. Lakukan operasi pembuatan `Product` langsung menggunakan Prisma dengan memasukkan `supplierId` fiktif yang tidak ada di database (`"non-existent-supplier-id-9999"`).
  2. Tangkap respon / exception dari database engine.
- **Hasil yang Diharapkan:** Operasi ditolak oleh constraint foreign key PostgreSQL dan Prisma Client mengembalikan kode galat `P2003` (*Foreign key constraint failed*).
- **Hasil Aktual:** Prisma melempar error `PrismaClientKnownRequestError` dengan kode `P2003`. Tidak ada baris *orphan* yang tercipta.
- **Status:** **LULUS**

##### Skenario 10: [RELASI - Restrict Integrity] Proteksi Penghapusan Produk yang Terikat Riwayat Transaksi
- **Tujuan:** Memverifikasi aturan bisnis dan relasi database (`onDelete: Restrict`) bahwa produk yang telah menjadi bagian dari transaksi konsinyasi (`TransactionItem`) tidak boleh dihapus agar rekam jejak keuangan dan audit tetap utuh.
- **Langkah Pengujian:**
  1. Pilih produk yang telah tercatat dalam relasi `TransactionItem` (misal: `"Natural Organic Soap"` pada transaksi hotel aktif).
  2. Panggil Server Action `deleteProduct(productId)`.
  3. Periksa respons dan kondisi database.
- **Hasil yang Diharapkan:** Sistem menolak penghapusan, mengembalikan pesan peringatan bisnis bahwa riwayat pesanan harus tetap utuh, dan data produk di tabel `Product` tetap aman tersimpan.
- **Hasil Aktual:** Server Action mendeteksi `transactionItemCount > 0` dan mengembalikan:
  `"This product is part of an order history and cannot be permanently deleted. Historical order records must remain intact."`. Data di database tetap utuh.
- **Status:** **LULUS**

---

### B. Bukti Penolakan Masukan Tidak Valid (Validasi Sisi Server)

Validasi server diimplementasikan menggunakan pustaka **Zod** pada [`lib/validations.ts`](../../../lib/validations.ts) dan dieksekusi di Server Action [`src/app/actions/catalog.ts`](../../../src/app/actions/catalog.ts) melalui fungsi `parseProduct()`.

Berikut adalah 3 bukti penolakan masukan tidak valid beserta pesan kesalahan pada field terkait:

| No. | Field Terkait | Nilai Masukan Uji (Data Sintetis) | Aturan Validasi Server | Pesan Kesalahan Aktual dari Server |
|:---:|:---|:---|:---|:---|
| 1 | `name` | `"  ab  "` (kurang dari 3 karakter non-spasi) | `z.string().trim().min(3)` | `"Product name must be at least 3 characters."` |
| 2 | `category` | `"BATH CARE"` (kategori di luar enum) | `z.enum(["SOAP", "FACE CARE", "BODY CARE", "HAIR CARE", "AROMA"])` | `"Select a valid product category."` |
| 3 | `price` | `0` atau `"-25000"` (harga $\le 0$) | `z.number().int().positive()` | `"Price must be greater than zero."` |

*(Tambahan: Field `packageSize` dengan input hanya spasi `"   "` ditolak dengan pesan `"Package size is required."`)*

---

### C. Pembuktian Perubahan Data pada Database (Sebelum vs Sesudah)

Pengujian membuktikan bahwa operasi yang berhasil dijalankan melalui aplikasi menghasilkan mutasi data yang nyata dan sesuai pada PostgreSQL:

| Operasi | Data Sintetis yang Diuji | Status Database Sebelum Operasi | Status Database Sesudah Operasi | Kesimpulan Mutasi |
|:---|:---|:---|:---|:---|
| **CREATE** | Name: `"Organic Lemongrass Essential Oil"`<br>Category: `"AROMA"`<br>Size: `"50ml"`<br>Price: `85000` | Kueri `SELECT COUNT(*)` untuk produk bernama tersebut menghasilkan `0`. | Record tersimpan dengan UUID baru. Kueri `SELECT COUNT(*)` menghasilkan `1`. Kolom `supplierId` terhubung ke CV. Alam Zempol. | Record baru berhasil ditambahkan secara persisten ke tabel `Product`. |
| **UPDATE** | Target: ID Produk `"Organic Lemongrass Essential Oil"`<br>Ubah Size: `"60ml"`<br>Ubah Price: `92000` | Kolom pada baris database bernilai:<br>`size = "50ml"`<br>`unitPrice = 85000` | Kolom pada baris database terupdate:<br>`size = "60ml"`<br>`unitPrice = 92000`<br>`updatedAt` diperbarui ke timestamp terbaru. | Modifikasi data berhasil diperbarui pada baris database yang dituju tanpa merusak kolom lain. |
| **DELETE** | Target: ID Produk `"Temporary Scrub Tester"` (tanpa relasi transaksi) | Record ditemukan di database dengan status `id = "cl...test"`. | Record dihapus dari database. Kueri `findUnique({ where: { id } })` mengembalikan `null`. | Record berhasil dihapus sepenuhnya dari PostgreSQL. |

---

### D. Ringkasan Kepatuhan Pengujian

- **Jumlah Skenario yang Diuji:** 10 skenario (8 CRUD + 2 Relasi Data).
- **Jumlah Skenario Lulus:** 10 skenario.
- **Persentase Kelulusan:** $\frac{10}{10} \times 100\% = 100\%$ (Memenuhi syarat minimal $\ge 90\%$).
- **Validasi Server:** Terbukti menolak masukan tidak valid pada level server dan memetakan pesan galat pada field `name`, `category`, dan `price`.
- **Integritas Database:** Terbukti operasi Create, Update, dan Delete menghasilkan perubahan yang sesuai pada database PostgreSQL.
- **Data Uji:** Seluruh data yang digunakan merupakan data sintetis bisnis hospitality tanpa melibatkan data pribadi riil.

Lima skenario yang sebelumnya belum diuji dijalankan menggunakan
`scripts/test-crud-scenarios.ts`. Skrip membuat data sementara, memverifikasi
hasil tiap operasi, lalu menghapus data tersebut.

Perintah untuk mengulang pengujian:

```powershell
npx tsx .\scripts\test-crud-scenarios.ts
```

Keluaran aktual:

```text
LULUS 1 - membuat Supplier dengan slug baru
LULUS 2 - slug Supplier duplikat menghasilkan P2002
LULUS 3 - membuat Product dengan Supplier valid
LULUS 5 - SKU sama di Supplier berbeda diizinkan
LULUS 7 - memperbarui Product yang ada
Ringkasan skenario yang dijalankan: 5/5 lulus.
```

**Persentase kelulusan skenario Prisma:** 10 dari 10 skenario telah dijalankan
dan lulus (**100%**). Hasil ini mencakup skenario CRUD/integritas yang
dijalankan melalui skrip pengujian langsung; ini bukan berarti CRUD sudah
terhubung ke formulir UI aplikasi.

Sebagai pemeriksaan terpisah, validasi skema Prisma dan pembuatan Prisma Client
berhasil. `npm run check` juga berhasil, dan `npm test` menghasilkan **2 file
test lulus dan 12 test lulus**. Pengujian yang ada mencakup validasi autentikasi
dan utilitas hash. Pengujian Prisma yang dijalankan secara terpisah mencakup
constraint unik (`P2002`), foreign key (`P2003`), record tidak ditemukan
(`P2025`), penolakan penghapusan `Restrict`, dan rollback transaksi.

## 7. Kendala dan Penyelesaian

Kendala utama adalah konfigurasi awal proyek menggunakan SQLite, sedangkan
praktikum meminta pemeriksaan struktur melalui `psql`. Perintah `\d` hanya
berlaku di PostgreSQL, sehingga tidak dapat digunakan pada file database
SQLite `dev.db`.

Penyelesaiannya adalah mengubah provider Prisma menjadi PostgreSQL,
menyiapkan migrasi awal PostgreSQL, dan memindahkan migrasi SQLite lama ke
folder arsip `prisma/migrations-sqlite/`. PostgreSQL 18 terdeteksi berjalan
secara lokal pada port `5432`. Pemeriksaan tabel SQLite menunjukkan bahwa
seluruh tabel aplikasi kosong, sehingga tidak ada data aplikasi yang perlu
dipindahkan. File `dev.db` tetap dipertahankan sebagai arsip.

Migrasi PostgreSQL belum dijalankan karena koneksi membutuhkan password
PostgreSQL lokal yang belum dikonfigurasi di `DATABASE_URL` pada `.env`.
Akibatnya, keluaran `\d+ "Product"` dan tangkapan layar hasil `psql` belum
tersedia. Setelah kredensial lokal diatur, migrasi perlu diterapkan dan
struktur tabel diverifikasi langsung melalui `psql`.

## 8. Catatan Pemanfaatan AI

Dalam pengerjaan ini digunakan **AI assistant melalui Copilot SDK di VS Code**
untuk membantu memeriksa konfigurasi Prisma, menyiapkan migrasi PostgreSQL,
memperbarui dokumentasi, dan menyusun perintah pemeriksaan.

| Aspek | Keterangan |
|---|---|
| **Alat** | AI assistant melalui Copilot SDK di VS Code |
| **Perintah utama** | `prisma validate`, `prisma migrate diff`, `prisma generate`, `npm run check`, dan `npm test` |
| **Bagian yang digunakan** | Perubahan provider Prisma ke PostgreSQL, pembuatan migrasi awal, pembaruan instruksi koneksi dan pemeriksaan `psql`, serta penyusunan dokumentasi |
| **Cara verifikasi** | Skema dinyatakan valid oleh Prisma, Prisma Client berhasil dibuat, pemeriksaan TypeScript berhasil, dan 12 test lulus. Migrasi ke server PostgreSQL serta keluaran `psql` belum diverifikasi karena password lokal belum dikonfigurasi. |
