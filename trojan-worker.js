// --- Variabel Lingkungan (diatur di Pengaturan Worker Cloudflare) ---
// KV_PRX_URL   - (WAJIB) URL ke file .json daftar proksi KV Anda.
// PRX_BANK_URL - (WAJIB) URL ke file .txt daftar proksi cadangan Anda.
// --------------------------------------------------------------------

// --- LOGIKA INTI WORKER ---

let proxyLists = null;
let lastFetchTime = 0;
const CACHE_DURATION = 15 * 60 * 1000; // Cache proksi selama 15 menit

export default {
    async fetch(request, env, ctx) {
        // Jika ini bukan permintaan WebSocket, tolak.
        if (request.headers.get('Upgrade') !== 'websocket') {
            return new Response('Ini adalah endpoint untuk Trojan-over-WebSocket. Silakan hubungkan menggunakan klien yang sesuai.', { status: 426 });
        }

        // Ambil URL daftar proksi dari variabel lingkungan
        const KV_PRX_URL = env.KV_PRX_URL;
        const PRX_BANK_URL = env.PRX_BANK_URL;

        if (!KV_PRX_URL || !PRX_BANK_URL) {
            return new Response('Variabel lingkungan KV_PRX_URL dan PRX_BANK_URL harus diatur.', { status: 500 });
        }

        // Lanjutkan untuk menangani permintaan Trojan
        return handleTrojanRequest(request, { KV_PRX_URL, PRX_BANK_URL });
    }
};

async function fetchProxyLists(KV_PRX_URL, PRX_BANK_URL) {
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
    } catch (error) {
        console.error("Gagal mengambil daftar proksi:", error);
        if (!proxyLists) proxyLists = [];
    }
    return proxyLists;
}

function getRandomProxy() {
    if (!proxyLists || proxyLists.length === 0) return null;
    return proxyLists[Math.floor(Math.random() * proxyLists.length)];
}

async function handleTrojanRequest(request, config) {
    const [clientWs, serverWs] = Object.values(new WebSocketPair());
    serverWs.accept();

    serverWs.addEventListener('message', async (event) => {
        try {
            const { address, port, data } = parseTrojanHeader(event.data);

            await fetchProxyLists(config.KV_PRX_URL, config.PRX_BANK_URL);
            const proxyAddress = getRandomProxy();
            if (!proxyAddress) {
                serverWs.close(1011, 'Tidak ada proksi yang tersedia');
                return;
            }

            // Teruskan koneksi melalui proksi yang dipilih
            proxyConnection(serverWs, proxyAddress, address, port, data);
        } catch (err) {
            serverWs.close(1011, `Error memproses header: ${err.message}`);
        }
    }, { once: true });

    return new Response(null, { status: 101, webSocket: clientWs });
}

async function proxyConnection(serverWs, proxyAddress, targetAddress, targetPort, initialData) {
    const url = new URL(`https://${proxyAddress}`);
    url.searchParams.set('remote', `${targetAddress}:${targetPort}`);

    try {
        const resp = await fetch(url.toString(), {
            method: 'CONNECT',
            headers: { 'Upgrade': 'websocket' }
        });

        if (resp.status !== 101) throw new Error(`Proxy upstream gagal dengan status: ${resp.status}`);

        const upstreamSocket = resp.webSocket;
        if (!upstreamSocket) throw new Error("Proxy upstream tidak mengembalikan WebSocket.");

        upstreamSocket.accept();
        if (initialData.byteLength > 0) {
            upstreamSocket.send(initialData);
        }

        // Atur penerusan data dua arah
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
        console.error("Koneksi proksi gagal:", error);
        serverWs.close(1011, "Koneksi proksi gagal");
    }
}

function parseTrojanHeader(buffer) {
    const dataView = new DataView(buffer);
    let offset = 58; // Lewati Password (56 byte) + CRLF (2 byte)

    // Periksa Command (1 byte)
    const command = dataView.getUint8(offset);
    if (command !== 1) { // 1 = CONNECT
        throw new Error(`Command tidak didukung: ${command}`);
    }
    offset += 1;

    // Periksa Address Type (1 byte)
    const addrType = dataView.getUint8(offset);
    offset += 1;

    let address = '';
    switch (addrType) {
        case 1: // IPv4
            address = `${dataView.getUint8(offset)}.${dataView.getUint8(offset+1)}.${dataView.getUint8(offset+2)}.${dataView.getUint8(offset+3)}`;
            offset += 4;
            break;
        case 3: // Domain
            const domainLen = dataView.getUint8(offset);
            offset += 1;
            address = new TextDecoder().decode(buffer.slice(offset, offset + domainLen));
            offset += domainLen;
            break;
        case 4: // IPv6
             const ipv6 = [];
            for(let i=0; i < 8; i++) {
                ipv6.push(dataView.getUint16(offset, false).toString(16));
                offset += 2;
            }
            address = ipv6.join(':');
            break;
        default:
            throw new Error(`Tipe alamat tidak didukung: ${addrType}`);
    }

    // Ambil Port (2 byte)
    const port = dataView.getUint16(offset, false); // Big Endian
    offset += 2;

    // Lewati CRLF (2 byte)
    offset += 2;

    // Sisa data adalah payload awal
    const payload = buffer.slice(offset);

    return { address: address, port: port, data: payload };
}
