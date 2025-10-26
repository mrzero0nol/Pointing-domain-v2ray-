// ------------------------------------------------------------------//
//          | |                        / _ \                       //
//          | |   ___   ___  _ __     / /_\ \ ___  _   _ _ __ ___   //
//      _   | |  / _ \ / _ \| '_ \    |  _  |/ __|| | | | '_ ` _ \  //
//     | |__| ||  __/|  __/| | | |   | | | |\__ \| |_| | | | | | | //
//      \____/  \___| \___||_| |_|   \_| |_/\___/ \__,_|_| |_| |_| //
//                                                                //
// ------------------------------------------------------------------//

// Konfigurasi Utama - Silakan ganti nilai-nilai di bawah ini
const config = {
  // UUID V2Ray Anda. Pastikan ini sama persis dengan yang ada di server V2Ray Anda.
  // Contoh: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
  uuid: "YOUR_V2RAY_UUID",

  // Alamat IP atau domain dari server V2Ray asli Anda.
  // Ini adalah server tempat V2Ray (v2-core) sebenarnya berjalan.
  // Contoh: "123.45.67.89" atau "vps.yourdomain.com"
  proxyIP: "YOUR_SERVER_IP_OR_DOMAIN",

  // URL Kamuflase.
  // Jika seseorang mencoba mengakses domain worker Anda melalui browser,
  // mereka akan dialihkan ke URL ini.
  // Contoh: "https://www.wikipedia.org"
  camouflageUrl: "https://www.google.com",
};

// Logika Worker
addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  // Cek apakah path URL sama dengan UUID (tanpa karakter '/')
  // Ini adalah "pintu rahasia" untuk lalu lintas V2Ray.
  if (url.pathname.substring(1) === config.uuid) {
    // Ini adalah koneksi V2Ray. Mari kita teruskan ke server asli.
    return await proxyToV2Ray(request, url);
  } else {
    // Ini bukan kone-ksi V2Ray. Alihkan ke situs kamuflase.
    return Response.redirect(config.camouflageUrl, 301);
  }
}

async function proxyToV2Ray(request, url) {
  // Buat URL baru yang menunjuk ke server V2Ray asli Anda.
  // Ganti host dari URL permintaan dengan IP/domain proxy Anda.
  const proxyUrl = new URL(url);
  proxyUrl.hostname = config.proxyIP;

  // Port default untuk V2Ray WebSocket + TLS adalah 443.
  // Cloudflare akan otomatis terhubung ke port ini.
  proxyUrl.port = '443';

  // Buat permintaan baru dengan URL yang sudah diubah.
  // Kita perlu membuat objek header yang bisa diubah.
  const newHeaders = new Headers(request.headers);

  // Atur header 'Host' agar cocok dengan tujuan proxy.
  newHeaders.set("Host", config.proxyIP);

  const newRequest = new Request(proxyUrl, {
    method: request.method,
    headers: newHeaders,
    body: request.body,
    redirect: "follow",
  });

  // Kirim permintaan yang dimodifikasi ke server V2Ray Anda.
  // Worker akan bertindak sebagai jembatan.
  const response = await fetch(newRequest);

  return response;
}
