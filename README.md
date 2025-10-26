# Cloudflare Worker sebagai Reverse Proxy untuk V2Ray

Skrip ini mengubah Cloudflare Worker menjadi *reverse proxy* untuk server V2Ray (VMess/VLESS) Anda yang sudah ada. Tujuannya adalah untuk menyembunyikan alamat IP asli server Anda dan memungkinkan Anda menggunakan domain Anda sendiri sebagai alamat koneksi, SNI, dan Host.

## Cara Kerja

1.  **Klien V2Ray** terhubung ke domain Anda yang diarahkan ke Cloudflare Worker.
2.  **Cloudflare Worker** menerima koneksi WebSocket.
3.  **Cloudflare Worker** membuka koneksi WebSocket baru ke server V2Ray (VPS) asli Anda yang alamatnya telah Anda konfigurasikan.
4.  Worker kemudian bertindak sebagai jembatan, meneruskan data bolak-balik antara klien dan server V2Ray Anda.

Dari sudut pandang penyedia internet atau sensor, semua traffic terlihat menuju ke Cloudflare, bukan ke server asli Anda.

---

### Langkah 1: Konfigurasi Skrip

Satu-satunya hal yang perlu Anda ubah adalah alamat server V2Ray asli Anda.

1.  Buka file `reverse-proxy-worker.js`.
2.  Di bagian paling atas, temukan baris ini:
    ```javascript
    const UPSTREAM_HOST = '123.45.67.89';
    ```
3.  Ganti `123.45.67.89` dengan **alamat IP** atau **domain** dari server V2Ray (VPS) Anda yang sebenarnya.

---

### Langkah 2: Deploy Worker

1.  **Login ke Cloudflare** dan buka menu **Workers & Pages**.
2.  Klik **"Create Application"** > **"Create Worker"**.
3.  Berikan **nama unik** untuk worker Anda (misalnya, `v2ray-proxy`).
4.  Klik **"Create service"**.
5.  Klik **"Quick edit"**.
6.  **Hapus semua kode default**, lalu **salin dan tempel seluruh isi** dari file `reverse-proxy-worker.js` ini.
7.  Pastikan Anda sudah mengubah `UPSTREAM_HOST` dengan benar.
8.  Klik **"Save and Deploy"**.

Setelah di-deploy, Anda akan mendapatkan URL untuk worker Anda, seperti `v2ray-proxy.namaanda.workers.dev`.

---

### Langkah 3: Konfigurasi Klien V2Ray (Contoh: v2rayN)

Sekarang, konfigurasikan aplikasi klien V2Ray Anda untuk terhubung ke worker, bukan ke server asli Anda.

1.  Buka klien V2Ray Anda dan edit profil koneksi Anda.
2.  Ubah pengaturan berikut:
    *   **Address (Alamat)**: Masukkan domain worker Anda (misalnya, `v2ray-proxy.namaanda.workers.dev` atau domain kustom Anda jika Anda menautkannya).
    *   **Port**: `443`
    *   **UserID / AlterId, dll.**: Biarkan sama seperti konfigurasi server asli Anda.
    *   **Network (Jaringan)**: `ws` (WebSocket)
    *   **Host (SNI)**: Masukkan domain worker Anda (sama seperti Address).
    *   **Path**: Biarkan sama seperti konfigurasi server asli Anda (misalnya, `/vless`).
    *   **TLS**: Aktifkan (`tls`).

Simpan konfigurasi dan hubungkan. Traffic Anda sekarang akan dialihkan melalui Cloudflare Worker.
