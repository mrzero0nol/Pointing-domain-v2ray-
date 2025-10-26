// -------------------  KONFIGURASI  -------------------
// Ganti nilai di bawah ini dengan alamat IP atau domain
// dari server V2Ray (VPS) Anda yang sebenarnya.
const UPSTREAM_HOST = '123.45.67.89';
// ----------------------------------------------------

/**
 * Event listener utama untuk semua permintaan yang masuk.
 */
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

/**
 * Menangani permintaan yang masuk ke worker.
 * @param {Request} request Permintaan dari klien
 */
async function handleRequest(request) {
  // Hanya proses permintaan upgrade WebSocket
  const upgradeHeader = request.headers.get('Upgrade');
  if (!upgradeHeader || upgradeHeader.toLowerCase() !== 'websocket') {
    return new Response('Expected WebSocket upgrade', { status: 426 });
  }

  // Buat URL untuk koneksi ke server V2Ray asli Anda.
  const upstreamUrl = new URL(request.url);
  upstreamUrl.hostname = UPSTREAM_HOST;

  // Gunakan fetch untuk memulai koneksi WebSocket ke server upstream.
  // Ini adalah cara yang benar untuk meneruskan header dari klien.
  const upstreamResponse = await fetch(upstreamUrl.toString(), {
    headers: request.headers,
  });

  // Periksa apakah server V2Ray asli merespons dengan benar.
  const upstreamSocket = upstreamResponse.webSocket;
  if (!upstreamSocket) {
    return new Response('Gagal terhubung ke server V2Ray upstream.', { status: 502 });
  }

  // Buat pasangan WebSocket untuk bertindak sebagai perantara.
  const [clientSocket, serverSocket] = Object.values(new WebSocketPair());

  // Terima koneksi dari sisi worker (yang akan terhubung ke klien).
  serverSocket.accept();

  // --- Atur Piping Data Dua Arah ---

  // 1. Teruskan data dari klien ke server V2Ray
  serverSocket.addEventListener('message', event => {
    try {
      upstreamSocket.send(event.data);
    } catch (err) {
      serverSocket.close(1011, err.message);
    }
  });

  // 2. Teruskan data dari server V2Ray kembali ke klien
  upstreamSocket.addEventListener('message', event => {
    try {
      serverSocket.send(event.data);
    } catch (err) {
      upstreamSocket.close(1011, err.message);
    }
  });

  // --- Atur Penanganan Penutupan dan Kesalahan ---

  const closeHandler = () => {
    // Pastikan kedua koneksi ditutup jika salah satu dari mereka ditutup.
    if (upstreamSocket.readyState !== WebSocket.CLOSED) {
      upstreamSocket.close();
    }
    if (serverSocket.readyState !== WebSocket.CLOSED) {
      serverSocket.close();
    }
  };

  upstreamSocket.addEventListener('close', closeHandler);
  serverSocket.addEventListener('close', closeHandler);
  upstreamSocket.addEventListener('error', closeHandler);
  serverSocket.addEventListener('error', closeHandler);

  // Kembalikan clientSocket ke runtime, yang akan menautkannya ke klien.
  // Ini menyelesaikan jabat tangan (handshake).
  return new Response(null, {
    status: 101,
    webSocket: clientSocket,
  });
}
