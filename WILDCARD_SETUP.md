# Panduan Pengaturan DNS Wildcard di Cloudflare

Untuk menggunakan metode Bug Host / Wildcard, Anda harus mengkonfigurasi record DNS di Cloudflare agar subdomain acak (`*.domainanda.com`) dapat diarahkan ke Worker Anda.

Berikut adalah cara mengaturnya:

### Langkah 1: Buka Pengaturan DNS Anda

1.  Login ke [dasbor Cloudflare](https://dash.cloudflare.com/).
2.  Pilih domain utama yang ingin Anda gunakan (misalnya, `kangfurqon.my.id`).
3.  Di sidebar kiri, navigasi ke menu **DNS**.

### Langkah 2: Tambahkan Record DNS Wildcard

1.  Klik tombol **"Add record"**.
2.  Isi formulir dengan detail berikut:
    *   **Type**: `A`
    *   **Name**: `*` (Ini menandakan "wildcard", mencakup semua subdomain yang tidak didefinisikan secara eksplisit).
    *   **IPv4 address**: `192.0.2.1` (Ini adalah "dummy" IP. Alamat IP ini tidak penting karena traffic akan ditangani oleh Cloudflare, tetapi kolom ini harus diisi).
    *   **Proxy status**: Pastikan **Proxied** (awan oranye). Ini sangat penting. Traffic harus melewati proxy Cloudflare.

3.  Klik **"Save"**.

### Contoh Tampilan

Setelah disimpan, Anda akan melihat entri baru di daftar record DNS Anda yang terlihat seperti ini:

| Type | Name | Content     | Proxy status |
| :--- | :--- | :---------- | :----------- |
| A    | \*   | 192.0.2.1   | Proxied      |

### Selesai!

Itu saja! Dengan pengaturan ini, setiap permintaan ke subdomain acak seperti `subdomain-acak.domainanda.com` akan secara otomatis ditangani oleh jaringan Cloudflare, yang kemudian akan meneruskannya ke Worker Anda setelah Anda menautkannya di langkah berikutnya.
