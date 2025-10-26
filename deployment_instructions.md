# Panduan Penerapan Cloudflare Worker untuk V2Ray

Berikut adalah panduan langkah demi langkah untuk menerapkan skrip V2Ray di Cloudflare Worker dan mengarahkannya ke domain Anda.

### Langkah 1: Masuk ke Dasbor Cloudflare
- Buka browser Anda dan pergi ke [dash.cloudflare.com](https://dash.cloudflare.com).
- Masuk menggunakan akun Cloudflare Anda.
- Pastikan domain yang ingin Anda gunakan sudah ditambahkan ke akun Cloudflare Anda.

### Langkah 2: Buat Worker Baru
1.  Di menu sebelah kiri, klik **Workers & Pages**.
2.  Klik tombol **Create Application**.
3.  Di bawah bagian "Create from scratch", pilih **Create Worker**.
4.  Anda akan diminta untuk memberikan nama subdomain untuk worker Anda (ini bukan domain akhir Anda). Beri nama yang deskriptif, misalnya `v2ray-proxy-handler`, lalu klik **Deploy**.

### Langkah 3: Konfigurasi dan Tempel Skrip
1.  Setelah Worker dibuat, Anda akan dibawa ke dasbornya. Klik tombol **Configure Worker**.
2.  Anda akan melihat editor kode dengan beberapa skrip "Hello World" default. **Hapus semua konten** di dalam editor.
3.  Salin seluruh isi skrip `v2ray_worker.js` yang telah dibuat sebelumnya dan tempelkan ke dalam editor.

### Langkah 4: Sesuaikan Konfigurasi Skrip
Di dalam editor, cari bagian `// Konfigurasi Utama` di bagian atas skrip. Ganti nilai-nilai placeholder dengan konfigurasi Anda:
- **`uuid`**: Ganti `"YOUR_V2RAY_UUID"` dengan UUID V2Ray Anda yang sebenarnya.
- **`proxyIP`**: Ganti `"YOUR_SERVER_IP_OR_DOMAIN"` dengan alamat IP atau domain dari server VPS V2Ray Anda.
- **`camouflageUrl`**: (Opsional) Anda bisa mengganti `"https://www.google.com"` dengan situs web lain yang ingin Anda gunakan sebagai kamuflase.

### Langkah 5: Simpan dan Terapkan
Setelah Anda selesai mengedit konfigurasi, klik tombol **Save and Deploy**. Perubahan Anda akan segera aktif di URL worker (misalnya, `v2ray-proxy-handler.your-subdomain.workers.dev`).

### Langkah 6: Hubungkan Worker ke Domain Anda (Paling Penting)
Langkah ini akan membuat Worker merespons pada domain atau subdomain pilihan Anda.
1.  Di dasbor Worker Anda, klik tab **Triggers**.
2.  Di bawah bagian "Routes", klik **Add Route**.
3.  Di kolom **Route**, masukkan domain atau subdomain yang ingin Anda gunakan. **PENTING:** Tambahkan `/*` di akhir untuk menangkap semua lalu lintas.
    - **Contoh untuk Subdomain (Direkomendasikan):** `vless.yourdomain.com/*`
    - **Contoh untuk Domain Utama:** `yourdomain.com/*`
4.  Di dropdown **Zone**, pilih domain utama Anda (misalnya, `yourdomain.com`).
5.  Klik **Add Route**.

Selesai! Sekarang, setiap lalu lintas yang masuk ke `vless.yourdomain.com` (atau rute apa pun yang Anda tetapkan) akan diproses oleh skrip Worker Anda. Permintaan V2Ray akan diteruskan ke server Anda, dan permintaan lainnya akan dialihkan ke situs kamuflase.
