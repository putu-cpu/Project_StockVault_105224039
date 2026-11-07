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
  * Pembuatan modul `src/utils/crypto.ts` menggunakan SHA-256 dari `@noble/hashes`.
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

1. **Tanpa kredensial riil:** Tidak ada kunci privat produksi, token, kata sandi riil, atau rahasia produksi yang ditambahkan oleh pekerjaan ini.
2. **Penggunaan data sintetis:** Payload pengujian dan contoh kunci development bersifat sintetis dan tidak boleh dipakai di produksi. File `.env.local` diabaikan Git; setiap environment non-lokal wajib memakai kunci yang dikelola di luar repository.
3. **Data pribadi:** Tidak ada data pribadi riil yang digunakan dalam perubahan ini.
4. **Verifikasi manusia:** Perubahan harus ditinjau sebelum deployment dan diverifikasi dengan perintah tes yang tercatat di bawah.

---

## Milestone v0.2 — Tanda Tangan Transaksi Terautentikasi

- **AI tool:** Copilot SDK di VS Code.
- **Tujuan:** Mengimplementasikan HMAC-SHA256 di server, validasi payload ketat, nonce CSPRNG, pengikatan konteks AAD, serta pengujian fail-closed.
- **Ringkasan prompt:** Membuat dokumen keputusan `KEPUTUSAN.md`, mengganti hash SHA-256 tanpa kunci dengan HMAC, menambah empat skenario Vitest, menjaga `.env.local` tetap di luar Git, dan mendokumentasikan penggunaan data sintetis.
- **File yang diubah:** `src/utils/crypto.ts`, `src/utils/crypto.test.ts`, `KEPUTUSAN.md`, `docs/AI_LOG.md`, `.gitignore`, `.env.example`, `tsconfig.json`, `src/actions/transactions.ts`, `src/App.tsx`, `src/views/HotelDashboardPage.tsx`, dan `src/app/transactions/[id]/page.tsx`.
- **Verifikasi:** `npm run test` lulus (38 tes); suite kriptografi lulus 4/4 tes; pemeriksaan TypeScript terarah pada modul dan suite kriptografi lulus. `npm run check` dan pemeriksaan akhir `npm run build` terhenti pada error konfigurasi Prisma yang sudah ada: `prisma.config.ts` mengimpor `definePrismaConfig`, sedangkan versi terpasang mengekspor `defineConfig`.
- **Pernyataan keselamatan:** Tidak ada private key, token, password, secret riil, atau data pribadi riil yang ditambahkan/disimpan oleh pekerjaan ini. Kunci fallback dan fixture uji adalah nilai sintetis yang sengaja publik untuk development/pengujian saja.
