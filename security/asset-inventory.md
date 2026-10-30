# Asset Inventory — StokVault

Dokumen ini mendata seluruh komponen sistem, data, dan aktor yang terlibat dalam aplikasi B2B StokVault.

| ID Aset | Nama Aset | Jenis Aset | Tingkat Sensitivitas | Deskripsi & Lokasi | Dilindungi Kriptografi? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **AST-01** | Kredensial Pengguna | Data | Rahasia (High) | Username/email & password Hash (Seller & Hotel Staff) di Local Storage / Session. | Tidak (Plaintext di Demo) |
| **AST-02** | Master Katalog Produk | Data | Publik / Internal | Daftar produk, harga IDR, dan ukuran dari CV. Alam Zempol. | Tidak |
| **AST-03** | Data Penerimaan Stok (*Locked*) | Data | Kritis (High) | Jumlah barang fisik diterima hotel yang berstatus LOCKED. | **Ya (SHA-256 Signature)** |
| **AST-04** | Data Stock Opname & Invoicing | Data | Kritis (High) | Sisa stok, kalkulasi konsumsi, dan nominal tagihan IDR. | Tidak |
| **AST-05** | Web Browser / Client App | Komponen System | Internal | Aplikasi React Single Page App yang berjalan di browser pengguna. | Tidak |
| **AST-06** | Local Storage / Session State | Penyimpanan Data | Kritis (Medium) | Memori browser yang menyimpan state transaksi dan role user. | Tidak |