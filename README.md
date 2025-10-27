# Server VLESS Mandiri di Cloudflare Worker (dengan Proxy Rotator & Wildcard)

Selamat datang di versi final dan andal dari skrip VLESS Worker. Skrip ini **sepenuhnya mandiri** dan **tidak memerlukan VPS**.

## Fitur Utama

-   **Server VLESS Penuh**: Menjalankan server VLESS langsung di infrastruktur Cloudflare.
-   **Proxy Rotator**: Menggunakan daftar proksi eksternal (yang Anda sediakan) sebagai jalur keluar ke internet. Ini meningkatkan anonimitas dan ketahanan.
-   **Metode Wildcard/Bug Host**: Menyamarkan (obfuscate) traffic Anda agar terlihat seperti menuju ke domain populer, sehingga lebih sulit dideteksi.
-   **Konfigurasi Mudah**: Semua pengaturan penting ada di bagian atas skrip.
-   **Halaman Info Bawaan**: Secara otomatis menghasilkan halaman dengan Kode QR dan link VLESS tanpa perlu URL eksternal.

---

## Langkah 1: Siapkan Daftar Proksi Anda

Skrip ini membutuhkan setidaknya satu URL publik yang mengarah ke daftar proksi. Formatnya bisa berupa file `.json` atau `.txt`. Anda bisa menghosting file-file ini secara gratis di layanan seperti GitHub Gist atau raw.githubusercontent.com.

-   **Contoh File JSON (`KV_PRX_URL`)**: [Lihat Contoh](https://raw.githubusercontent.com/FoolVPN-ID/Nautica/refs/heads/main/kvProxyList.json)
-   **Contoh File Teks (`PRX_BANK_URL`)**: [Lihat Contoh](https://raw.githubusercontent.com/FoolVPN-ID/Nautica/refs/heads/main/proxyList.txt)

---

## Langkah 2: Konfigurasi DNS Wildcard

Untuk menggunakan metode penyamaran (obfuscation), Anda harus mengatur record DNS wildcard untuk domain Anda.

**➡️ Ikuti panduan lengkap di sini: [Panduan Pengaturan DNS Wildcard](./WILDCADC_SETUP.md)**

---

## Langkah 3: Konfigurasi Skrip Worker

Buka file `vless-worker.js` dan edit bagian `--- KONFIGURASI PENGGUNA ---` di bagian atas.

1.  **`userID` (Wajib)**:
    *   Masukkan UUID V2Ray pribadi Anda.

2.  **`bugHost` (Opsional)**:
    *   Ganti dengan domain populer pilihan Anda jika Anda tidak ingin menggunakan default.

3.  **`KV_PRX_URL` (Wajib)**:
    *   Masukkan URL ke file daftar proksi `.json` Anda.

4.  **`PRX_BANK_URL` (Wajib)**:
    *   Masukkan URL ke file daftar proksi `.txt` Anda.

---

## Langkah 4: Deploy & Tautkan Domain

1.  **Deploy Worker**:
    *   Login ke Cloudflare > **Workers & Pages**.
    *   Buat Worker baru, **hapus kode default**, lalu **salin & tempel seluruh isi** skrip `vless-worker.js` ini.
    *   Klik **"Save and Deploy"**.

2.  **Tautkan Domain Kustom (PENTING)**:
    *   Di halaman worker Anda, buka tab **"Triggers"**.
    *   Klik **"Add Custom Domain"**.
    *   Masukkan domain wildcard Anda (misalnya, `*.domainanda.com`).
    *   Klik **"Add Custom Domain"**.

---

## Langkah 5: Dapatkan dan Gunakan Konfigurasi VLESS

1.  **Buka salah satu subdomain wildcard Anda** di browser (misalnya, `https://sub-acak.domainanda.com`).
2.  Halaman informasi akan muncul. **Pindai Kode QR** atau **Salin URL VLESS** ke klien V2Ray Anda.
3.  Hubungkan dan nikmati!

Server VLESS mandiri Anda sekarang berfungsi.
