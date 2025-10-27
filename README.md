# Server VLESS Mandiri di Cloudflare Worker (Versi Mudah Dikelola)

Selamat datang di versi final dari skrip VLESS Worker. Versi ini dirancang agar **sangat mudah dikelola** tanpa perlu mengedit kode setiap kali Anda ingin mengubah konfigurasi.

## Fitur Utama

-   **Server VLESS Penuh**: Menjalankan server VLESS langsung di infrastruktur Cloudflare (tidak perlu VPS).
-   **Dikelola via Variabel**: `UserID` dan `BugHost` diatur melalui Pengaturan Worker di Cloudflare, bukan di dalam kode.
-   **Proxy Rotator**: Menggunakan daftar proksi eksternal (yang Anda sediakan) sebagai jalur keluar.
-   **Metode Wildcard/Bug Host**: Menyamarkan traffic Anda.
-   **Halaman Info Bawaan**: Menghasilkan Kode QR dan link VLESS secara otomatis.

---

## Langkah 1: Siapkan Daftar Proksi Anda

Skrip ini membutuhkan URL publik yang mengarah ke daftar proksi Anda. Anda bisa menghostingnya di GitHub atau layanan serupa.

-   **Contoh File JSON (`KV_PRX_URL`)**: [Lihat Contoh](https://raw.githubusercontent.com/FoolVPN-ID/Nautica/refs/heads/main/kvProxyList.json)
-   **Contoh File Teks (`PRX_BANK_URL`)**: [Lihat Contoh](https://raw.githubusercontent.com/FoolVPN-ID/Nautica/refs/heads/main/proxyList.txt)

---

## Langkah 2: Konfigurasi DNS Wildcard

Anda harus mengatur record DNS wildcard untuk domain Anda. Ini hanya perlu dilakukan sekali.

**➡️ Ikuti panduan lengkap di sini: [Panduan Pengaturan DNS Wildcard](./WILDCARD_SETUP.md)**

---

## Langkah 3: Deploy Worker & Atur Variabel (Paling Penting)

Ini adalah langkah inti yang menggabungkan deployment dan konfigurasi.

1.  **Login ke Cloudflare** > **Workers & Pages**.
2.  Klik **"Create Application"** > **"Create Worker"**. Beri nama unik dan klik **"Create service"**.
3.  Klik **"Quick edit"**. **Hapus kode default**, lalu **salin & tempel seluruh isi** dari file `vless-worker.js` proyek ini.
4.  Klik **"Save and Deploy"**.

5.  **Sekarang, atur variabelnya:**
    *   Kembali ke halaman utama worker Anda, klik tab **"Settings"**.
    *   Pilih submenu **"Variables"**.
    *   Di bawah bagian **"Environment Variables"**, klik **"Add variable"** untuk setiap item di bawah ini:

| Variable Name  | Value                                                                                            | Keterangan                                     |
| :------------- | :----------------------------------------------------------------------------------------------- | :--------------------------------------------- |
| `USER_ID`      | `d342d11e-d424-4583-b36e-524ab1f0afa4`                                                            | **(Wajib)** Ganti dengan UUID V2Ray Anda.      |
| `BUG_HOST`     | `api24-normal-alisg.tiktokv.com`                                                                 | (Opsional) Ganti dengan bug host pilihan Anda. |
| `KV_PRX_URL`   | `https://raw.githubusercontent.com/..`                                                           | **(Wajib)** URL ke file `.json` proksi Anda.   |
| `PRX_BANK_URL` | `https://raw.githubusercontent.com/..`                                                           | **(Wajib)** URL ke file `.txt` proksi Anda.    |

    *   **PENTING**: Untuk `USER_ID`, Anda bisa mengklik **"Encrypt"** untuk keamanan tambahan.
    *   Setelah menambahkan semua variabel, klik **"Save and Deploy"** sekali lagi di bagian atas halaman untuk menerapkan perubahan.

---

## Langkah 4: Tautkan Domain Kustom

1.  Di halaman worker Anda, klik tab **"Triggers"**.
2.  Di bawah "Custom Domains", klik **"Add Custom Domain"**.
3.  Masukkan domain wildcard Anda (misalnya, `*.domainanda.com`).
4.  Klik **"Add Custom Domain"**.

---

## Langkah 5: Dapatkan dan Gunakan Konfigurasi

1.  Buka **salah satu subdomain wildcard Anda** di browser (misalnya, `https://sub-acak.domainanda.com`).
2.  Halaman informasi akan muncul. **Pindai Kode QR** atau **Salin URL VLESS** ke klien V2Ray Anda.
3.  Selesai! Anda sekarang dapat mengubah `BUG_HOST` kapan pun hanya dengan mengedit variabel di Pengaturan Worker.
