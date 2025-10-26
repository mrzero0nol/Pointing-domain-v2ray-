# Panduan Penerapan Cloudflare Worker untuk VLESS Server

Berikut adalah panduan langkah demi langkah untuk menerapkan skrip VLESS Server di Cloudflare Worker dan mengarahkannya ke domain Anda. Dengan metode ini, Anda **tidak memerlukan VPS**.

### Langkah 1: Masuk ke Dasbor Cloudflare
- Buka browser Anda dan pergi ke [dash.cloudflare.com](https://dash.cloudflare.com).
- Masuk menggunakan akun Cloudflare Anda.
- Pastikan domain yang ingin Anda gunakan sudah ditambahkan ke akun Cloudflare Anda.

### Langkah 2: Buat Worker Baru
1.  Di menu sebelah kiri, klik **Workers & Pages**.
2.  Klik tombol **Create Application**.
3.  Di bawah bagian "Create from scratch", pilih **Create Worker**.
4.  Beri nama yang deskriptif untuk worker Anda, misalnya `vless-server`, lalu klik **Deploy**.

### Langkah 3: Konfigurasi dan Tempel Skrip
1.  Setelah Worker dibuat, klik tombol **Configure Worker**.
2.  Anda akan melihat editor kode dengan beberapa skrip "Hello World" default. **Hapus semua konten** di dalam editor.
3.  Salin seluruh isi skrip `vless_worker.js` yang telah dibuat sebelumnya dan tempelkan ke dalam editor.

### Langkah 4: Sesuaikan Konfigurasi Skrip (Sangat Penting)
Di dalam editor, cari bagian `// Konfigurasi Utama` di bagian atas skrip. Ganti nilai placeholder `userID` dengan UUID Anda sendiri.

- **`userID`**: Ganti `"d342d11e-d424-4583-b36e-524ab1f0afa4"` dengan UUID VLESS Anda. Ini adalah satu-satunya hal yang **wajib** Anda ubah. Anda bisa membuat UUID baru dari situs seperti [www.uuidgenerator.net](https://www.uuidgenerator.net/).

### Langkah 5: Simpan dan Terapkan
Setelah Anda selesai mengedit `userID`, klik tombol **Save and Deploy**. Perubahan Anda akan segera aktif di URL worker (misalnya, `vless-server.your-subdomain.workers.dev`).

### Langkah 6: Hubungkan Worker ke Domain Anda
Langkah ini akan membuat Worker merespons pada domain atau subdomain pilihan Anda, yang akan Anda gunakan di klien V2Ray.
1.  Di dasbor Worker Anda, klik tab **Triggers**.
2.  Di bawah bagian "Routes", klik **Add Route**.
3.  Di kolom **Route**, masukkan domain atau subdomain yang ingin Anda gunakan. **PENTING:** Tambahkan `/*` di akhir untuk menangkap semua lalu lintas.
    - **Contoh untuk Subdomain (Direkomendasikan):** `vless.yourdomain.com/*`
    - **Contoh untuk Domain Utama:** `yourdomain.com/*`
4.  Di dropdown **Zone**, pilih domain utama Anda (misalnya, `yourdomain.com`).
5.  Klik **Add Route**.

Selesai! Cloudflare Worker Anda sekarang berfungsi sebagai server VLESS. Lanjutkan ke konfigurasi klien untuk mulai menggunakannya.
