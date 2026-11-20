# Keputusan Arsitektur Kriptografi StokVault

Dokumen ini menetapkan mekanisme perlindungan integritas data transaksi konsinyasi StokVault untuk CV. Alam Zempol dan hotel mitra.

## Matriks Kebutuhan → Mekanisme → Alasan

| Kebutuhan | Mekanisme | Alasan |
|---|---|---|
| Mengetahui perubahan pada data serah terima | HMAC-SHA256 atas seluruh payload | Tag hanya dapat dibuat oleh pihak yang memiliki kunci; perubahan pada payload akan menggagalkan verifikasi. |
| Mengikat catatan dengan mitra dan transaksi | AAD `hotelId:timestamp:transactionId`, disertakan dalam input HMAC | Tag tidak dapat dipindahkan ke hotel, waktu, atau transaksi lain tanpa terdeteksi. |
| Menghindari penggunaan ulang nonce secara tidak sengaja | Nonce 128-bit dari CSPRNG untuk setiap penandatanganan | Ruang nonce yang besar membuat tabrakan sangat tidak mungkin. Nonce sendiri tidak mencegah replay; sistem pemanggil harus menolak transaction ID/nonce yang sudah diproses dengan penyimpanan persisten. |
| Menghindari kebocoran kunci ke browser | Operasi kriptografi pada Node.js di server | Kunci dan operasi penandatanganan tidak dikirim sebagai kode klien. |

## Parameter Kriptografi

- **Algoritma:** HMAC-SHA256 melalui modul `node:crypto`.
- **Kunci:** tepat 256 bit (32 byte), direpresentasikan sebagai 64 karakter hexadecimal.
- **Nonce:** 128 bit (16 byte), dihasilkan dengan `crypto.getRandomValues()` dari CSPRNG Node.js dan dikembalikan sebagai 32 karakter hexadecimal. Nonce harus baru untuk setiap penandatanganan.
- **AAD:** string `hotelId:timestamp:transactionId`, divalidasi dan dicocokkan ulang saat verifikasi.
- **Auth tag/MAC:** HMAC-SHA256 penuh, 256 bit atau 64 karakter hexadecimal.
- **Data bertanda tangan:** payload JSON tervalidasi, termasuk teks `itemsJson` yang valid. Perubahan representasi atau isi `itemsJson` juga membatalkan tanda tangan.

HMAC memberikan autentikasi dan integritas, bukan enkripsi; payload tetap terbaca. Gunakan enkripsi terpisah jika kerahasiaan isi harus dilindungi dari pembaca penyimpanan.

## Kebijakan Kunci

Kunci produksi wajib disediakan di luar repository melalui `process.env.STOKVAULT_SECRET_KEY`. File lokal `.env.local` dapat digunakan untuk pengembangan dan harus diabaikan oleh Git. Jangan pernah mengirim kunci ke komponen klien atau memasukkannya ke log.

Untuk kemudahan pengembangan saja, aplikasi memakai kunci sintetis publik yang deterministik bila `STOKVAULT_SECRET_KEY` belum diatur dan `NODE_ENV=development`. Kunci ini bukan rahasia dan tidak aman untuk produksi. Di lingkungan selain development, kunci yang hilang atau tidak valid menyebabkan penandatanganan gagal. Contoh pada `.env.example` juga sintetis; buat kunci acak baru sebelum penggunaan non-lokal.

## Validasi dan Penanganan Kegagalan

- Zod memvalidasi bentuk payload, ISO 8601 datetime, integer non-negatif, JSON pada `itemsJson`, nonce, tag, dan format kunci.
- Fungsi penandatanganan melempar error ketika payload, nonce, atau kunci tidak valid; pemanggil harus membatalkan operasi.
- Fungsi verifikasi mengembalikan `false` untuk payload/package tidak valid, AAD yang tidak cocok, tag yang rusak, ataupun kunci yang tidak valid/salah.
- Perbandingan tag menggunakan `timingSafeEqual`; tag yang tidak cocok tidak boleh dianggap sebagai hasil sukses.
- Nonce unik tidak menggantikan pemeriksaan replay. Endpoint yang menerima tanda tangan harus mencatat nonce/transaction ID secara atomik dan menolak nilai yang sudah dipakai.
