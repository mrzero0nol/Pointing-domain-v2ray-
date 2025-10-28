# Gateway Trojan Publik di Cloudflare Worker

Skrip ini mengubah Cloudflare Worker menjadi **gateway Trojan publik**. Ini adalah gateway "bodoh" (dumb gateway) yang tidak memvalidasi password, tetapi meneruskan traffic ke tujuan yang benar melalui *proxy rotator*.

## Fitur

-   **Gateway Trojan**: Menerima koneksi Trojan-over-WebSocket.
-   **Tidak Memvalidasi Password**: Dirancang untuk menjadi gateway publik di mana keamanan terletak pada kerahasiaan domain Anda.
-   **Dikelola via Variabel**: Konfigurasi diatur di Pengaturan Worker, bukan di dalam kode.
-   **Proxy Rotator**: Menggunakan daftar proksi eksternal sebagai jalur keluar.

---

## Langkah 1: Siapkan Daftar Proksi Anda

Anda membutuhkan URL publik yang mengarah ke daftar proksi Anda (format `.json` atau `.txt`). Anda bisa menghostingnya di GitHub atau layanan serupa.

-   **Contoh File JSON (`KV_PRX_URL`)**: [Lihat Contoh](https://raw.githubusercontent.com/FoolVPN-ID/Nautica/refs/heads/main/kvProxyList.json)
-   **Contoh File Teks (`PRX_BANK_URL`)**: [Lihat Contoh](https://raw.githubusercontent.com/FoolVPN-ID/Nautica/refs/heads/main/proxyList.txt)

---

## Langkah 2: Konfigurasi DNS Wildcard (Sangat Direkomendasikan)

Untuk menggunakan metode penyamaran di sisi klien, atur record DNS wildcard untuk domain Anda.

**➡️ Ikuti panduan lengkap di sini: [Panduan Pengaturan DNS Wildcard](./WILDCARD_SETUP.md)**

---

## Langkah 3: Deploy Worker & Atur Variabel

1.  **Login ke Cloudflare** > **Workers & Pages**.
2.  Buat Worker baru, **hapus kode default**, lalu **salin & tempel seluruh isi** dari file `trojan-worker.js` ini.
3.  Klik **"Save and Deploy"**.

4.  **Atur Variabel Lingkungan:**
    *   Buka tab **"Settings"** > **"Variables"** di worker Anda.
    *   Tambahkan variabel berikut:

| Variable Name  | Value                                                                                            | Keterangan                                   |
| :------------- | :----------------------------------------------------------------------------------------------- | :------------------------------------------- |
| `KV_PRX_URL`   | `https://raw.githubusercontent.com/...`                                                          | **(Wajib)** URL ke file `.json` proksi Anda. |
| `PRX_BANK_URL` | `https://raw.githubusercontent.com/...`                                                          | **(Wajib)** URL ke file `.txt` proksi Anda.  |

    *   Klik **"Save and Deploy"** sekali lagi untuk menerapkan variabel.

---

## Langkah 4: Tautkan Domain Kustom

1.  Di worker Anda, buka tab **"Triggers"**.
2.  Di bawah "Custom Domains", klik **"Add Custom Domain"**.
3.  Masukkan domain wildcard Anda (misalnya, `*.domainanda.com`).
4.  Klik **"Add Custom Domain"**.

---

## Langkah 5: Konfigurasi Klien Trojan

Gateway Anda sekarang siap. Konfigurasikan klien VPN Anda sesuai contoh di bawah ini (berdasarkan contoh yang Anda berikan):

-   **Protokol**: `Trojan`
-   **Address**: `ava.game.naver.com` (atau bug host pilihan Anda)
-   **Port**: `443`
-   **Password**: *Isi dengan apa pun, karena akan diabaikan oleh worker.*
-   **Network / Transport**: `ws` (WebSocket)
-   **Host**: `sub-acak.domainanda.com` (Subdomain wildcard Anda)
-   **Path**: `/path-acak-apapun` (Path acak apa pun)
-   **TLS**: `tls`
-   **SNI**: `sub-acak.domainanda.com` (Harus sama dengan Host)

Sekarang Anda dapat terhubung menggunakan konfigurasi ini.
