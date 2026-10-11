# AI Log — StokVault Development

Dokumen ini mencatat penggunaan kecerdasan buatan (AI) selama perencanaan, perancangan antarmuka, pembuatan prompt, dan implementasi kode pada proyek **StokVault**.

---

## 📅 Ringkasan Penggunaan AI

* **Model AI yang Digunakan:** Gemini (Google AI) / Claude / ChatGPT
* **Tujuan Utama:** 
  1. Merumuskan alur bisnis *immutable consignment ledger* antara **CV. Alam Zempol** dan hotel mitra.
  2. Menyusun *Master System Prompt* dalam bahasa Inggris untuk pembuatan antarmuka React + TypeScript + Tailwind CSS.
  3. Memperbaiki masalah antarmuka modal/pop-up dan penyederhanaan alur *delivery* serta penguncian data (*Locked*).
  4. Merancang komponen kriptografi **SHA-256** dan *unit test* otomatis (Vitest) untuk memenuhi kebutuhan Milestone Kriptografi.

---

## 📝 Catatan Aktivitas & Conversational Prompting

### **1. Tahap Konseptualisasi & Alur Bisnis**
* **Prompt/Instruksi:** Diskusi interaktif mengenai konsep penguncian data (*Locked*), alur *Stock Opname*, kalkulasi tagihan otomatis, serta perizinan *Edit Request Approval* antara Seller dan Hotel.
* **Hasil AI:**
  * Penjelasan alur kerja penguncian data (*Locked*) dari sisi pembeli/hotel untuk mencegah penundaan pembayaran (*payment delay*).
  * Perumusan rumus kalkulasi tagihan otomatis:  
    $$\text{Total Tagihan} = (\text{Barang Diterima} - \text{Sisa Stok}) \times \text{Harga Satuan}$$

  * Kesepakatan alur *Fresh Start* (0 data dummy transaksi di awal) di mana dashboard dimuat dari kondisi *empty state* yang bersih.

---

### **2. Tahap Perancangan UI/UX & Refinement Modal**
* **Prompt/Instruksi:** Penyesuaian antarmuka untuk mengatasi modal katalog yang terpotong, penghilangan *scrollbar* ganda, penambahan efek *backdrop blur*, serta pemastian logo **StokVault** sebagai navigasi utama ke halaman Home.
* **Hasil AI:**
  * Penyesuaian komponen `ProductCatalogModal.tsx` menggunakan `max-h-[85vh] overflow-y-auto` dan `backdrop-blur-sm`.
  * Pemisahan fungsi tombol profil pengguna dari navigasi utama.

---

### **3. Tahap Pembuatan Master System Prompt**
* **Prompt/Instruksi:** Menyusun *Master System Prompt* komprehensif dalam bahasa Inggris yang mencakup seluruh kebutuhan teknis, struktur file, konfigurasi server Vite port 3000, serta kredensial akun demo.
* **Hasil AI:**
  * Prompt terstruktur lengkap yang siap digunakan pada AI Coding Assistant (V0, Bolt.new, ChatGPT, atau Claude).

---

### **4. Tahap Implementasi Kriptografi & Testing (Milestone v0.1)**
* **Prompt/Instruksi:** Penyesuaian tugas kriptografi dasar menggunakan hashing **SHA-256** untuk menjamin integritas data transaksi penerimaan barang yang dikunci (*Immutable Ledger*).
* **Hasil AI:**
  * Pembuatan modul `src/utils/crypto.ts` menggunakan pustaka teruji `crypto-js`.
  * Penyusunan 4 skenario *unit test* otomatis (`src/utils/crypto.test.ts`) dengan 3 uji positif dan 1 uji negatif/manipulasi data.

---

---

### **5. Tahap Analisis Keamanan Siber & Risk Register (Penanda sec-0.1)**
* **Prompt/Instruksi:** Analisis ancaman STRIDE, penentuan *Trust Boundaries*, Data Flow Diagram (DFD), dan pembuatan *Risk Register* berdasarkan fitur aplikasi StokVault.
* **Hasil AI:**
  * Penyusunan `asset-inventory.md` mencakup 6 aset utama.
  * Pembuatan `dfd.md` dengan 2 *Trust Boundaries* dan ID elemen terstruktur.
  * Identifikasi 10 ancaman spesifik pada `threat-model.md` dengan kategori STRIDE.
  * Penilaian matriks risiko dan penyusunan rencana kontrol 5 risiko prioritas di `risk-register.md` yang dipetakan ke Tugas 2 dan Tugas 3.

## 🔒 Pernyataan Keamanan & Etika Data

1. **Bebas Kredensial Sensitif:** Seluruh kode, konfigurasi, dan pengujian dalam repositori ini **TIDAK MENGGUNAKAN** kunci privat (*private keys*), token API, kata sandi riil, atau data pribadi pengguna.
2. **Penggunaan Data Sintetis:** Seluruh data produk, email, dan transaksi yang digunakan bersifat sintetis (katalog sampel CV. Alam Zempol).
3. **Verifikasi Manusia:** Seluruh kode yang dihasilkan oleh AI telah ditinjau, diuji, dan disesuaikan secara mandiri agar sesuai dengan spesifikasi tugas perkuliahan.

