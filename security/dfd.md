# Data Flow Diagram (DFD) Level 1 — StokVault

Diagram aliran data menunjukkan batas kepercayaan (*Trust Boundaries*) dan elemen pemrosesan dalam aplikasi StokVault.

```text
+--------------------------------------------------------------------------------+
| TRUST BOUNDARY 1: USER / EXTERNAL ENVIRONMENT                                  |
|                                                                                |
|  [ ACT-01: Pemasok (CV. Alam Zempol) ]   [ ACT-02: Staf Hotel (Grand Hyatt/Ayana) ] |
|                  |                                        |                    |
+------------------+----------------------------------------+--------------------+
                   | (DF-01: Form Input Login & Katalog)    | (DF-02: Input Received & Opname)
                   v                                        v
+--------------------------------------------------------------------------------+
| TRUST BOUNDARY 2: CLIENT APPLICATION (BROWSER SPA)                             |
|                                                                                |
|  +--------------------+      (DF-03)      +--------------------------------+   |
|  | P-01: Auth & Role  |------------------>| P-02: Order & Lock Engine      |   |
|  | Management         |                   | (Menghitung Hash SHA-256)[CRYPTO]|  |
|  +--------------------+                   +--------------------------------+   |
|           |                                          |                         |
|           | (DF-04: Read/Write)                      | (DF-05: Save State)     |
|           v                                          v                         |
|  +------------------------------------------------------------------------+   |
|  | DS-01: Application Local State / LocalStorage (Master Catalog & Invoices)|  |
|  +------------------------------------------------------------------------+   |
|                                                                                |
+--------------------------------------------------------------------------------+
```

### **Tabel ID Elemen DFD:**
* **Aktor External:** `ACT-01` (CV. Alam Zempol / Seller), `ACT-02` (Staf Hotel / Buyer).
* **Proses:** `P-01` (Auth & Role Router), `P-02` (Order, Lock Engine & SHA-256 Generator).
* **Penyimpanan Data (Data Store):** `DS-01` (Application State / LocalStorage).
* **Aliran Data (Data Flow):**
  * `DF-01`: Input Kredensial & Tambah Katalog Master.
  * `DF-02`: Input Jumlah Diterima, Approval Lock & Stock Opname.
  * `DF-03`: Sesi Aktif & Validasi Hak Akses Role.
  * `DF-04`: Update Master Catalog State.
  * `DF-05`: Penyimpanan Status Transaksi & Cryptographic Hash SHA-256 (`AST-03`).
* **Trust Boundaries:**
  * `TB-01`: Antara Pengguna Eksternal dan Aplikasi Browser Client.
  * `TB-02`: Antara Logika Pemrosesan Aplikasi (React State) dan Storage Lokal Browser (`DS-01`).