// --- KONFIGURASI PENGGUNA ---

// Ganti dengan UUID V2Ray Anda.
const userID = 'd342d11e-d424-4583-b36e-524ab1f0afa4';

// Ganti dengan domain "palsu" yang ingin Anda gunakan untuk menyamarkan traffic.
const bugHost = 'api24-normal-alisg.tiktokv.com';

// (WAJIB) URL ke file JSON daftar proksi KV Anda.
// Contoh format file: https://raw.githubusercontent.com/FoolVPN-ID/Nautica/refs/heads/main/kvProxyList.json
const KV_PRX_URL = "https://raw.githubusercontent.com/FoolVPN-ID/Nautica/refs/heads/main/kvProxyList.json";

// (WAJIB) URL ke file .txt daftar proksi cadangan Anda.
// Contoh format file: https://raw.githubusercontent.com/FoolVPN-ID/Nautica/refs/heads/main/proxyList.txt
const PRX_BANK_URL = "https://raw.githubusercontent.com/FoolVPN-ID/Nautica/refs/heads/main/proxyList.txt";

// --- AKHIR DARI KONFIGURASI PENGGUNA ---


// --- HALAMAN HTML BAWAAN ---
const subHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Subscription Information</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f0f2f5; color: #333; margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; flex-direction: column; }
    .container { background-color: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 90%; width: 500px; text-align: center; }
    h1 { color: #1a73e8; margin-bottom: 20px; font-size: 24px; }
    p { margin: 10px 0; font-size: 16px; word-wrap: break-word; }
    code { background-color: #e8eaed; padding: 5px 8px; border-radius: 5px; font-family: 'Courier New', Courier, monospace; display: block; white-space: pre-wrap; word-break: break-all; text-align: left; }
    .qr-code { margin: 20px auto; }
    .copy-btn { background-color: #1a73e8; color: #fff; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; font-size: 16px; transition: background-color: 0.3s; margin-top: 15px; }
    .copy-btn:hover { background-color: #1558b3; }
    .footer { margin-top: 30px; font-size: 12px; color: #888; }
  </style>
</head>
<body>
  <div class="container">
    <h1>VLESS Configuration</h1>
    <p>Scan the QR code or copy the link below to import into your V2Ray client.</p>
    <div id="qrcode" class="qr-code"></div>
    <p><strong>VLESS URL:</strong></p>
    <code id="vless-url"></code>
    <button id="copy-button" class="copy-btn">Copy Link</button>
    <p class="footer">Powered by Cloudflare Workers</p>
  </div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
  <script>
    function generateVlessLink(uuid, bugHost, actualHost) {
      const randomPath = \`/\${Math.random().toString(36).substring(2, 8)}/\${Math.random().toString(36).substring(2, 8)}\`;
      const remarks = "CF-Worker-Wildcard";
      const vlessLink = \`vless://\${uuid}@\${bugHost}:443?encryption=none&security=tls&sni=\${actualHost}&fp=randomized&type=ws&host=\${actualHost}&path=\${encodeURIComponent(randomPath)}#\${remarks}\`;
      document.getElementById('vless-url').textContent = vlessLink;
      new QRCode(document.getElementById("qrcode"), { text: vlessLink, width: 200, height: 200 });
      document.getElementById('copy-button').addEventListener('click', () => {
        navigator.clipboard.writeText(vlessLink).then(() => alert('VLESS link copied!'));
      });
    }
    generateVlessLink("${userID}", "${bugHost}", window.location.hostname);
  </script>
</body>
</html>
`;

// --- LOGIKA INTI WORKER ---

let proxyLists = null;
let lastFetchTime = 0;
const CACHE_DURATION = 15 * 60 * 1000; // 15 menit

async function fetchProxyLists() {
    const now = Date.now();
    if (proxyLists && (now - lastFetchTime < CACHE_DURATION)) {
        return proxyLists;
    }

    try {
        const [kvResponse, bankResponse] = await Promise.all([
            fetch(KV_PRX_URL).then(res => res.json()),
            fetch(PRX_BANK_URL).then(res => res.text())
        ]);

        const bankProxies = bankResponse.trim().split('\n').map(p => p.trim());
        const combined = [...kvResponse.proxy, ...bankProxies];
        proxyLists = [...new Set(combined)]; // Hapus duplikat
        lastFetchTime = now;
        console.log(`Successfully fetched and combined ${proxyLists.length} proxies.`);
    } catch (error) {
        console.error("Failed to fetch proxy lists:", error);
        // Jika gagal, gunakan daftar yang lama jika ada
        if (!proxyLists) {
            proxyLists = [];
        }
    }
    return proxyLists;
}

function getRandomProxy() {
    if (!proxyLists || proxyLists.length === 0) {
        return null;
    }
    const randomIndex = Math.floor(Math.random() * proxyLists.length);
    return proxyLists[randomIndex];
}


addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    if (url.pathname === '/') {
        event.respondWith(new Response(subHTML, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } }));
    } else {
        event.respondWith(handleVlessRequest(event.request));
    }
});

async function handleVlessRequest(request) {
    if (request.headers.get('Upgrade') !== 'websocket') {
        return new Response('Expected websocket', { status: 426 });
    }

    const [clientWs, serverWs] = Object.values(new WebSocketPair());
    serverWs.accept();

    serverWs.addEventListener('message', async (event) => {
        try {
            const { receivedUserID, address, port, data } = parseVlessHeader(event.data);
            if (receivedUserID !== userID) {
                serverWs.close(1008, 'Invalid user');
                return;
            }

            await fetchProxyLists();
            const proxyAddress = getRandomProxy();
            if (!proxyAddress) {
                serverWs.close(1011, 'No available proxy');
                return;
            }

            proxyConnection(serverWs, proxyAddress, address, port, data);

        } catch (err) {
            serverWs.close(1011, err.message);
        }
    }, { once: true });

    return new Response(null, { status: 101, webSocket: clientWs });
}

async function proxyConnection(serverWs, proxyAddress, targetAddress, targetPort, initialData) {
    const [proxyClient, proxyServer] = Object.values(new WebSocketPair());

    const url = new URL(`https://${proxyAddress}`);
    url.searchParams.set('remote', `${targetAddress}:${targetPort}`);

    const proxyRequest = new Request(url, {
        method: 'CONNECT',
        headers: { 'Upgrade': 'websocket' }
    });

    try {
        const resp = await fetch(proxyRequest.url, {
            method: proxyRequest.method,
            headers: proxyRequest.headers,
            body: proxyRequest.body,
            redirect: 'follow'
        });

        if (resp.status !== 101) {
            throw new Error(`Upstream proxy connection failed with status: ${resp.status}`);
        }

        const upstreamSocket = resp.webSocket;
        if (!upstreamSocket) {
             throw new Error("Upstream proxy did not return a WebSocket.");
        }

        upstreamSocket.accept();
        upstreamSocket.send(initialData);

        // Piping data
        serverWs.addEventListener('message', e => upstreamSocket.send(e.data));
        upstreamSocket.addEventListener('message', e => serverWs.send(e.data));

        const closeHandler = () => {
            if (serverWs.readyState !== WebSocket.CLOSED) serverWs.close();
            if (upstreamSocket.readyState !== WebSocket.CLOSED) upstreamSocket.close();
        };
        serverWs.addEventListener('close', closeHandler);
        serverWs.addEventListener('error', closeHandler);
        upstreamSocket.addEventListener('close', closeHandler);
        upstreamSocket.addEventListener('error', closeHandler);

    } catch (error) {
        console.error("Proxy connection failed:", error);
        serverWs.close(1011, "Proxy connection failed");
    }
}


function parseVlessHeader(buffer) {
    const view = new DataView(buffer);
    if (view.getUint8(0) !== 0) throw new Error('Invalid VLESS version.');

    const receivedUserIDBytes = new Uint8Array(buffer.slice(1, 17));
    const receivedUserID = Array.from(receivedUserIDBytes).map(byte => byte.toString(16).padStart(2, '0')).join('');
    const formattedUserID = `${receivedUserID.slice(0, 8)}-${receivedUserID.slice(8, 12)}-${receivedUserID.slice(12, 16)}-${receivedUserID.slice(16, 20)}-${receivedUserID.slice(20)}`;

    let offset = 17;
    const protoOpt = view.getUint8(offset++);
    let address, port;
    const addressType = protoOpt & 0x0F;

    switch (addressType) {
        case 1: // IPv4
            address = new Uint8Array(buffer.slice(offset, offset + 4)).join('.');
            offset += 4;
            break;
        case 2: // Domain
            const domainLength = view.getUint8(offset++);
            address = new TextDecoder().decode(buffer.slice(offset, offset + domainLength));
            offset += domainLength;
            break;
        case 3: // IPv6
            address = Array.from(new Uint16Array(buffer.slice(offset, offset + 16))).map(p => p.toString(16)).join(':');
            offset += 16;
            break;
        default:
            throw new Error(`Unsupported address type: ${addressType}`);
    }

    port = view.getUint16(offset);
    offset += 2;
    const data = buffer.slice(offset);

    return { receivedUserID: formattedUserID, address, port, data };
}
