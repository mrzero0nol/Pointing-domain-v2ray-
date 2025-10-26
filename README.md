# Server VLESS di Cloudflare Worker (dengan Metode Wildcard/Bug Host)

Proyek ini memungkinkan Anda menjalankan server VLESS (V2Ray) sepenuhnya di dalam Cloudflare Worker. Versi ini telah ditingkatkan untuk menggunakan metode **Wildcard/Bug Host**, yang membantu menyamarkan (obfuscate) traffic Anda agar terlihat seperti menuju ke domain populer, sehingga lebih sulit untuk dideteksi atau diblokir.

## Alur Kerja

1.  **Pengguna Mengatur Domain**: Anda akan mengatur record DNS wildcard (`*.domainanda.com`) di Cloudflare.
2.  **Worker Dideploy**: Anda mendeploy skrip worker ini ke akun Cloudflare Anda.
3.  **Domain Ditautkan**: Anda menautkan domain wildcard Anda ke worker.
4.  **Konfigurasi Dihasilkan**: Saat Anda mengunjungi worker, worker akan menghasilkan link VLESS khusus. Link ini menggunakan domain populer (`bugHost`) sebagai alamatnya, tetapi secara diam-diam mengarahkan traffic ke domain wildcard Anda melalui header `Host` dan `SNI`.

---

## Langkah 1: Konfigurasi DNS Wildcard

Langkah pertama dan paling penting adalah mengatur DNS Anda dengan benar.

**➡️ Ikuti panduan lengkap di sini: [Panduan Pengaturan DNS Wildcard](./WILDCARD_SETUP.md)**

---

## Langkah 2: Konfigurasi Skrip Worker

Sebelum mendeploy, ada **dua hal penting** yang harus Anda konfigurasikan di dalam skrip `vless-worker.js`.

1.  **Ubah `userID`**:
    *   Buka file `vless-worker.js` dan temukan baris ini:
        ```javascript
        const userID = 'd342d11e-d424-4583-b36e-524ab1f0afa4'; // Your UUID
        ```
    *   Ganti UUID tersebut dengan UUID V2Ray pribadi Anda.

2.  **Ubah `bugHost` (Opsional)**:
    *   Skrip ini sudah diatur dengan `bugHost` default. Namun, jika Anda ingin menggantinya, ubah baris ini:
        ```javascript
        const bugHost = 'api24-normal-alisg.tiktokv.com'; // Your Bug Host
        ```
    *   Ganti dengan domain populer lain yang Anda inginkan.

---

## Langkah 3: Deploy Worker

1.  **Login ke Cloudflare** dan navigasi ke **Workers & Pages**.
2.  Klik **"Create Application"** > **"Create Worker"**.
3.  Berikan **nama unik** untuk worker Anda (misalnya, `vless-wildcard-server`).
4.  Klik **"Create service"**.
5.  Klik **"Quick edit"**.
6.  **Hapus semua kode default**, lalu **salin dan tempel seluruh isi** dari file `vless-worker.js` proyek ini.
7.  Pastikan `userID` dan `bugHost` Anda sudah benar.
8.  Klik **"Save and Deploy"**.

---

## Langkah 4: Tautkan Domain Kustom (PENTING)

Worker Anda sekarang berjalan, tetapi Anda harus memberitahunya untuk menggunakan domain wildcard Anda.

1.  Di halaman worker yang baru saja Anda deploy, klik tab **"Triggers"**.
2.  Di bawah bagian "Custom Domains", klik **"Add Custom Domain"**.
3.  Masukkan domain wildcard yang telah Anda siapkan, misalnya: `*.kangfurqon.my.id`.
4.  Klik **"Add Custom Domain"**. Cloudflare akan secara otomatis memverifikasi dan menautkan domain tersebut karena DNS-nya sudah Anda kelola.

---

## Langkah 5: Dapatkan dan Gunakan Konfigurasi VLESS

1.  **Buka SALAH SATU subdomain wildcard Anda di browser**. Misalnya, kunjungi `https://random-subdomain.kangfurqon.my.id`.
2.  Anda akan melihat halaman web yang sama seperti sebelumnya, tetapi sekarang halaman tersebut akan menghasilkan **link VLESS dengan format bug host**.
3.  **Pindai Kode QR** atau **Salin URL VLESS** ke dalam klien V2Ray Anda.

Server VLESS Anda dengan metode penyamaran sekarang siap digunakan!
