# Risk Register & Control Plan — StokVault

Daftar risiko berdasarkan analisis ancaman STRIDE, dinilai berdasarkan kondisi arsitektur client-side aplikasi.

### **Metrik Penilaian:**
* **Likelihood (Kemungkinan):** Low (1), Medium (2), High (3)
* **Impact (Dampak):** Low (1), Medium (2), High (3)
* **Risk Score:** Likelihood $\times$ Impact

---

### **Tabel Matriks Risiko & 5 Risiko Prioritas:**

| ID Risk | Threat Terkait | Kemungkinan (Likelihood) | Dampak (Impact) | Risk Score | Alasan Berdasarkan Kondisi Produk StokVault |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RSK-01** | `THR-05` (Info Disclosure) | **High (3)** | **High (3)** | **9 (Kritis)** | **Prioritas 1:** Saat ini state aplikasi disimpan dalam satu LocalStorage global tanpa kredensial terenkripsi, berisiko tinggi membocorkan data rahasia antar hotel mitra. |
| **RSK-02** | `THR-02` & `THR-03` (Tampering) | **High (3)** | **High (3)** | **9 (Kritis)** | **Prioritas 2:** Inti bisnis StokVault adalah *Immutable Ledger*. Jika data stok/hash bisa diedit via DevTools/LocalStorage, fitur *Locked* menjadi tidak berguna. |
| **RSK-03** | `THR-10` (Privilege Escalation)| **Medium (2)**| **High (3)** | **6 (Tinggi)** | **Prioritas 3:** Seller bisa mengeksploitasi fungsi edit tanpa menunggu *Edit Approval* dari Hotel, memicu sengketa tagihan. |
| **RSK-04** | `THR-07` (Denial of Service) | **High (3)** | **Medium (2)**| **6 (Tinggi)** | **Prioritas 4:** Belum ada validasi tipe data ketat pada form input sisa stok (*Stock Opname*), sehingga input negatif/huruf bisa merusak kalkulasi IDR. |
| **RSK-05** | `THR-04` (Repudiation) | **Medium (2)**| **Medium (2)**| **4 (Sedang)** | **Prioritas 5:** Penguncian data saat ini belum merekam identitas staf hotel (`hotelId` & `timestamp`) secara persisten dalam payload Hash. |

---

### **Rencana Kontrol Risiko Prioritas:**

#### **1. Kontrol untuk RSK-01 (Isolasi Workspace & Session Security)**
* **Rencana Kontrol:** Menerapkan pembatasan pembacaan state berdasarkan `hotelId` aktif. Pengguna hanya dapat mengakses kunci storage `stokvault_data_{hotelId}`.
* **Dipetakan ke:** **Tugas 2 (Backend Auth & Session Management)**.

#### **2. Kontrol untuk RSK-02 (Integrity Verification Engine)**
* **Rencana Kontrol:** Mengintegrasikan pustaka `crypto.ts` untuk memverifikasi `verifyDataHash()` setiap kali halaman di-render. Jika Hash tidak cocok dengan payload data, sistem otomatis menampilkan peringatan "Data Tampered / Unverified".
* **Dipetakan ke:** **Tugas 2 (Data Validation & Integrity Checks)**.

#### **3. Kontrol untuk RSK-03 (Edit Request State Machine)**
* **Rencana Kontrol:** Mengunci input formulir secara eksplisit dengan properti `disabled` jika `status === 'LOCKED'` dan `editApproved === false`.
* **Dipetakan ke:** **Tugas 2 (Access Control Logic)**.

#### **4. Kontrol untuk RSK-04 (Client-Side Form Validation)**
* **Rencana Kontrol:** Menambahkan validasi batas pada input sisa stok: `0 <= remainingStock <= quantityReceived`. Jika input melanggar, tombol *Submit* dinonaktifkan dengan pesan kesalahan yang jelas.
* **Dipetakan ke:** **Tugas 2 (Input Validation & Error Handling)**.

#### **5. Kontrol untuk RSK-05 (Cryptographic Audit Trail)**
* **Rencana Kontrol:** Memasukkan `timestamp`, `hotelId`, dan `userId` ke dalam payload string pembuatan Hash SHA-256 saat tombol "Approve & Lock Data" ditekan.
* **Dipetakan ke:** **Tugas 3 (Cryptographic Signatures & Audit Logs)**.