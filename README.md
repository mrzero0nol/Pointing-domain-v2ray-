# Server VLESS di Cloudflare Worker

Proyek ini memungkinkan Anda menjalankan server VLESS (V2Ray) sepenuhnya di dalam Cloudflare Worker, menghilangkan kebutuhan akan VPS. Ini adalah solusi yang hemat biaya dan efisien untuk membuat proksi pribadi Anda.

## Konfigurasi

Sebelum mendeploy, ada **satu hal penting** yang harus Anda ubah di dalam skrip `vless-worker.js`.

1.  **Ubah `userID`**:
    Buka file `vless-worker.js` dan temukan baris berikut di bagian paling atas:
    ```javascript
    const userID = 'd342d11e-d424-4583-b36e-524ab1f0afa4'; // Your UUID
    ```
    Ganti nilai UUID yang ada (`'d342d11e-d424-4583-b36e-524ab1f0afa4'`) dengan UUID V2Ray pribadi Anda. Anda bisa membuat UUID baru menggunakan generator online jika perlu.

## Cara Deploy

Ikuti langkah-langkah ini untuk mendeploy skrip ke akun Cloudflare Anda.

1.  **Login ke Cloudflare**:
    *   Buka browser Anda dan masuk ke [dasbor Cloudflare](https://dash.cloudflare.com/).

2.  **Buka Menu Workers & Pages**:
    *   Di sidebar kiri, klik pada **Workers & Pages**.

3.  **Buat Worker Baru**:
    *   Klik tombol **"Create Application"** atau **"Create Service"**.
    *   Pilih opsi **"Create Worker"**.

4.  **Konfigurasi Worker**:
    *   Berikan nama unik untuk worker Anda (misalnya, `server-vless-saya`). Nama ini akan menjadi bagian dari URL worker Anda.
    *   Pilih **"HTTP handler"** sebagai starter.
    *   Klik **"Create service"**.

5.  **Edit Kode Worker**:
    *   Setelah layanan dibuat, klik **"Quick edit"**.
    *   Anda akan melihat kode "Hello World" default. **Hapus semua kode tersebut.**

6.  **Salin dan Tempel Skrip**:
    *   Buka file `vless-worker.js` dari proyek ini.
    *   Salin **seluruh isi** skrip.
    *   Tempelkan ke dalam editor kode di Cloudflare.

7.  **PENTING: Pastikan `userID` Sudah Diubah**:
    *   Pastikan Anda sudah mengubah `userID` di dalam kode sesuai dengan petunjuk konfigurasi di atas.

8.  **Deploy**:
    *   Klik tombol **"Save and Deploy"**.

Setelah beberapa saat, worker Anda akan aktif dan bisa diakses melalui URL yang disediakan (misalnya, `server-vless-saya.nama-anda.workers.dev`).

## Cara Menggunakan

Setelah worker Anda berhasil di-deploy, mengkonfigurasi klien V2Ray Anda sangatlah mudah.

1.  **Buka URL Worker Anda**:
    *   Buka browser dan kunjungi URL root worker Anda (misalnya, `https://server-vless-saya.nama-anda.workers.dev`).

2.  **Dapatkan Konfigurasi**:
    *   Anda akan melihat halaman web yang berisi semua informasi yang Anda butuhkan:
        *   **Kode QR**: Pindai (scan) kode ini menggunakan aplikasi klien V2Ray di ponsel Anda (seperti v2flyNG).
        *   **URL VLESS**: Salin (copy) link VLESS yang ditampilkan.

3.  **Impor ke Klien V2Ray**:
    *   **Untuk Klien Seluler (Ponsel)**: Gunakan opsi "Scan QR code" dan arahkan kamera ke kode QR di browser Anda.
    *   **Untuk Klien Desktop (misalnya, v2rayN)**: Salin URL VLESS, lalu di klien Anda, gunakan opsi untuk mengimpor dari clipboard (biasanya "Add profile from clipboard" atau sejenisnya).

Server VLESS Anda sekarang siap digunakan.
