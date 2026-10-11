# AI Log — StokVault Development

Dokumen ini mencatat penggunaan kecerdasan buatan (AI) selama perencanaan, perancangan antarmuka, pembuatan prompt, dan implementasi kode pada proyek **StokVault**[cite: 1].

---

## 📅 Ringkasan Penggunaan AI

* **Model AI yang Digunakan:** Gemini (Google AI) / Claude / ChatGPT
* **Tujuan Utama:** 
  1. Merumuskan alur bisnis *immutable consignment ledger* antara **CV. Alam Zempol** dan hotel mitra[cite: 1].
  2. Menyusun *Master System Prompt* dalam bahasa Inggris untuk pembuatan antarmuka React + TypeScript + Tailwind CSS[cite: 1].
  3. Memperbaiki masalah antarmuka modal/pop-up dan penyederhanaan alur *delivery* serta penguncian data (*Locked*)[cite: 1].
  4. Merancang komponen kriptografi **SHA-256** dan *unit test* otomatis (Vitest) untuk memenuhi kebutuhan Milestone Kriptografi[cite: 1].

---

## 📝 Catatan Aktivitas & Conversational Prompting

### **1. Tahap Konseptualisasi & Alur Bisnis**
* **Prompt/Instruksi:** Diskusi interaktif mengenai konsep penguncian data (*Locked*), alur *Stock Opname*, kalkulasi tagihan otomatis, serta perizinan *Edit Request Approval* antara Seller dan Hotel[cite: 1].
* **Hasil AI:**
  * Penjelasan alur kerja penguncian data (*Locked*) dari sisi pembeli/hotel untuk mencegah penundaan pembayaran (*payment delay*)[cite: 1].
  * Perumusan rumus kalkulasi tagihan otomatis:  
    $$\text{Total Tagihan} = (\text{Barang Diterima} - \text{Sisa Stok}) \times \text{Harga Satuan}$$
[cite: 1]
  * Kesepakatan alur *Fresh Start* (0 data dummy transaksi di awal) di mana dashboard dimuat dari kondisi *empty state* yang bersih[cite: 1].

---

### **2. Tahap Perancangan UI/UX & Refinement Modal**
* **Prompt/Instruksi:** Penyesuaian antarmuka untuk mengatasi modal katalog yang terpotong, penghilangan *scrollbar* ganda, penambahan efek *backdrop blur*, serta pemastian logo **StokVault** sebagai navigasi utama ke halaman Home[cite: 1].
* **Hasil AI:**
  * Penyesuaian komponen `ProductCatalogModal.tsx` menggunakan `max-h-[85vh] overflow-y-auto` dan `backdrop-blur-sm`[cite: 1].
  * Pemisahan fungsi tombol profil pengguna dari navigasi utama[cite: 1].

---

### **3. Tahap Pembuatan Master System Prompt**
* **Prompt/Instruksi:** Menyusun *Master System Prompt* komprehensif dalam bahasa Inggris yang mencakup seluruh kebutuhan teknis, struktur file, konfigurasi server Vite port 3000, serta kredensial akun demo[cite: 1].
* **Hasil AI:**
  * Prompt terstruktur lengkap yang siap digunakan pada AI Coding Assistant (V0, Bolt.new, ChatGPT, atau Claude)[cite: 1].

---

### **4. Tahap Implementasi Kriptografi & Testing (Milestone v0.1)**
* **Prompt/Instruksi:** Penyesuaian tugas kriptografi dasar menggunakan hashing **SHA-256** untuk menjamin integritas data transaksi penerimaan barang yang dikunci (*Immutable Ledger*)[cite: 1].
* **Hasil AI:**
  * Pembuatan modul `src/utils/crypto.ts` menggunakan pustaka teruji `crypto-js`[cite: 1].
  * Penyusunan 4 skenario *unit test* otomatis (`src/utils/crypto.test.ts`) dengan 3 uji positif dan 1 uji negatif/manipulasi data[cite: 1].

---

## 🔒 Pernyataan Keamanan & Etika Data

1. **Bebas Kredensial Sensitif:** Seluruh kode, konfigurasi, dan pengujian dalam repositori ini **TIDAK MENGGUNAKAN** kunci privat (*private keys*), token API, kata sandi riil, atau data pribadi pengguna[cite: 1].
2. **Penggunaan Data Sintetis:** Seluruh data produk, email, dan transaksi yang digunakan bersifat sintetis (katalog sampel CV. Alam Zempol)[cite: 1].
3. **Verifikasi Manusia:** Seluruh kode yang dihasilkan oleh AI telah ditinjau, diuji, dan disesuaikan secara mandiri agar sesuai dengan spesifikasi tugas perkuliahan[cite: 1].