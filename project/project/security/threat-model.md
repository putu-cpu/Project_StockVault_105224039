# Threat Modeling (STRIDE) — StokVault

Berikut 10 ancaman spesifik yang dipetakan langsung ke elemen DFD dan aset yang terdampak.

| ID Threat | Kategori STRIDE | Elemen DFD Terkait | Aset Terdampak | Deskripsi Ancaman Spesifik |
| :--- | :--- | :--- | :--- | :--- |
| **THR-01** | **Spoofing** | `ACT-02` $\rightarrow$ `P-01` | `AST-01` | Pengguna biasa memalsukan email login menjadi `hotel@grandhyatt.com` pada form login `LoginPage.tsx` tanpa enkripsi session. |
| **THR-02** | **Tampering** | `DF-05` $\rightarrow$ `DS-01` | `AST-03` | Penjual/Hotel mengubah angka `quantityReceived` secara langsung melalui DevTools Inspect Element pada `DS-01` sebelum terkunci. |
| **THR-03** | **Tampering** | `P-02` $\rightarrow$ `DS-01` | `AST-03` | Pihak yang tidak berhak mengganti string `sha256Hash` di `DS-01` dengan Hash palsu agar status terlihat valid secara visual. |
| **THR-04** | **Repudiation** | `ACT-02` $\rightarrow$ `P-02` | `AST-03` | Staf hotel mengklaim tidak pernah mengeklik tombol "Approve & Permanently Lock Data" karena sistem tidak mencatat identitas unik penandatangan. |
| **THR-05** | **Information Disclosure**| `DS-01` | `AST-04` | Hotel A (Grand Hyatt) dapat mengintip data tagihan dan sisa stok Hotel B (Ayana) jika `DS-01` tidak diisolasi dengan benar di memori browser. |
| **THR-06** | **Information Disclosure**| `ACT-01` $\rightarrow$ `DF-01` | `AST-01` | Kredensial akun demo tersimpan secara plaintext di memori browser atau inspeksi JavaScript client-side. |
| **THR-07** | **Denial of Service** | `P-02` | `AST-05` | Pengguna memasukkan angka sisa stok bernilai negatif atau *string* sangat panjang pada form Stock Opname sehingga menyebabkan komponen React *crash*. |
| **THR-08** | **Denial of Service** | `DS-01` | `AST-05` | LocalStorage dipenuhi oleh pembuatan order palsu secara berulang (spamming) hingga kuota browser penuh (Exhaustion). |
| **THR-09** | **Elevation of Privilege**| `ACT-02` $\rightarrow$ `P-01` | `AST-02` | Staf Hotel mengubah role menjadi Seller melalui manipulasi state `App.tsx` dan menambah/menghapus Katalog Master CV. Alam Zempol. |
| **THR-10** | **Elevation of Privilege**| `ACT-01` $\rightarrow$ `P-02` | `AST-03` | Seller mengeklik bypass tombol "Request Edit Access" dan langsung menyunting data `LOCKED` tanpa menunggu persetujuan (*approval*) dari Hotel. |