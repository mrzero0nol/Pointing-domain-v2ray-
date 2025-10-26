// --- Configuration ---
const userID = 'd342d11e-d424-4583-b36e-524ab1f0afa4'; // Your UUID
const bugHost = 'api24-normal-alisg.tiktokv.com'; // Your Bug Host (e.g., a popular domain)
const proxyIPs = ['']; // Optional: Your custom proxy IPs. Leave empty to use default.
// --------------------

// --- Static Content ---
// HTML for the subscription endpoint, displaying a QR code and VLESS link.
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
      // Generate a random path, simulating a real URL structure
      const randomPath = \`/\${Math.random().toString(36).substring(2, 8)}/\${Math.random().toString(36).substring(2, 8)}\`;
      const remarks = "CF-Worker-Wildcard";

      // Construct the VLESS URL using the bug host and actual host (SNI/Host header)
      const vlessLink = \`vless://\${uuid}@\${bugHost}:443?encryption=none&security=tls&sni=\${actualHost}&fp=randomized&type=ws&host=\${actualHost}&path=\${encodeURIComponent(randomPath)}#\${remarks}\`;

      // Display the link
      const urlElement = document.getElementById('vless-url');
      urlElement.textContent = vlessLink;

      // Generate QR Code
      new QRCode(document.getElementById("qrcode"), {
        text: vlessLink,
        width: 200,
        height: 200,
      });

      // Copy to clipboard
      document.getElementById('copy-button').addEventListener('click', () => {
        navigator.clipboard.writeText(vlessLink).then(() => {
          alert('VLESS link copied to clipboard!');
        }).catch(err => {
          console.error('Failed to copy text: ', err);
        });
      });
    }

    // Get the actual domain from the URL
    const actualDomain = window.location.hostname;
    // Get the UUID and Bug Host from the Worker script configuration
    const userUUID = "${userID}";
    const configuredBugHost = "${bugHost}";
    generateVlessLink(userUUID, configuredBugHost, actualDomain);
  </script>
</body>
</html>
`;

// --- Worker Logic ---

// Main fetch event listener
addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Serve the HTML page on the root path.
  // For all other paths, attempt to handle as a WebSocket request.
  if (url.pathname === '/') {
    event.respondWith(
      new Response(subHTML, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' },
      })
    );
  } else {
    event.respondWith(handleVlessRequest(event.request));
  }
});

/**
 * Handles VLESS WebSocket requests.
 * @param {Request} request
 */
async function handleVlessRequest(request) {
  const upgradeHeader = request.headers.get('Upgrade');
  if (!upgradeHeader || upgradeHeader.toLowerCase() !== 'websocket') {
    return new Response('Expected a WebSocket upgrade request.', { status: 426 });
  }

  const [clientWs, serverWs] = Object.values(new WebSocketPair());
  serverWs.accept();

  // Handle the first message from the client, which contains the VLESS header.
  serverWs.addEventListener('message', async (event) => {
    try {
      const { receivedUserID, address, port, data } = parseVlessHeader(event.data);

      // Security Check: Validate the received UUID against the configured userID.
      if (receivedUserID !== userID) {
        serverWs.close(1008, 'Invalid user');
        return;
      }

      // Connect to the requested destination.
      const remoteSocket = await connectToRemote(address, port, serverWs);
      // Write the initial data packet.
      remoteSocket.write(data);
    } catch (error) {
      console.error('Error processing VLESS message:', error);
      serverWs.close(1011, error.message);
    }
  }, { once: true }); // Important: This listener should only run once to avoid conflicts.

  // Handle WebSocket closure.
  serverWs.addEventListener('close', () => {
    console.log('Client WebSocket closed.');
  });
  serverWs.addEventListener('error', (err) => {
    console.error('Client WebSocket error:', err);
  });

  // Return the server-side WebSocket to the Cloudflare runtime.
  return new Response(null, {
    status: 101,
    webSocket: clientWs,
  });
}

/**
 * Parses the VLESS header from the client's first message.
 * @param {ArrayBuffer} buffer The incoming data from the client.
 */
function parseVlessHeader(buffer) {
  const view = new DataView(buffer);
  if (view.getUint8(0) !== 0) throw new Error('Invalid VLESS version.');

  // Extract the 16-byte userID (UUID).
  const receivedUserIDBytes = new Uint8Array(buffer.slice(1, 17));
  const receivedUserID = Array.from(receivedUserIDBytes).map(byte => byte.toString(16).padStart(2, '0')).join('');
  const formattedUserID = `${receivedUserID.slice(0, 8)}-${receivedUserID.slice(8, 12)}-${receivedUserID.slice(12, 16)}-${receivedUserID.slice(16, 20)}-${receivedUserID.slice(20)}`;

  let offset = 17; // 1 (version) + 16 (UUID)

  const protoOpt = view.getUint8(offset); // Addr type + Opt
  offset += 1;

  let address, port;
  const addressType = protoOpt & 0x0F;

  switch (addressType) {
    case 1: // IPv4
      address = new Uint8Array(buffer.slice(offset, offset + 4)).join('.');
      offset += 4;
      break;
    case 2: // Domain
      const domainLength = view.getUint8(offset);
      offset += 1;
      address = new TextDecoder().decode(buffer.slice(offset, offset + domainLength));
      offset += domainLength;
      break;
    case 3: // IPv6
      const ipv6 = new Uint16Array(buffer.slice(offset, offset + 16));
      address = Array.from(ipv6).map(part => part.toString(16)).join(':');
      offset += 16;
      break;
    default:
      throw new Error(`Unsupported address type: ${addressType}`);
  }

  port = view.getUint16(offset);
  offset += 2;

  // The rest of the buffer is the initial data packet.
  const data = buffer.slice(offset);

  return { receivedUserID: formattedUserID, address, port, data };
}

/**
 * Establishes a TCP connection to the destination server.
 * @param {string} address The destination address (IP or domain).
 * @param {number} port The destination port.
 * @param {WebSocket} serverWs The server-side WebSocket for piping data.
 */
async function connectToRemote(address, port, serverWs) {
  // Use a proxy if configured and the address is not a private IP.
  const proxy = proxyIPs.length > 0 && !isPrivateAddress(address)
    ? proxyIPs[Math.floor(Math.random() * proxyIPs.length)]
    : null;

  const connectOptions = {
    hostname: address,
    port: port,
  };

  // Connect to the destination, either directly or via a proxy.
  const remoteSocket = await (proxy
    ? fetch(`https://${proxy}/`, {
        method: 'CONNECT',
        headers: { 'Host': `${address}:${port}` },
      }).then(res => res.body.getReader()) // Simplified; real proxying is more complex.
    : connect(connectOptions)
  );

  // Pipe data between the client WebSocket and the remote TCP socket.
  pump(serverWs, remoteSocket);

  return remoteSocket;
}

/**
 * Pipes data between the WebSocket and the remote socket.
 * @param {WebSocket} ws
 * @param {any} remoteSocket Readable/Writable stream for the remote connection.
 */
function pump(ws, remoteSocket) {
  // Forward data from remote to client
  (async () => {
    const reader = remoteSocket.readable.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        ws.send(value);
      }
    } catch (error) {
      console.log('Remote read error:', error);
    }
  })();

  // Forward data from client to remote
  ws.addEventListener('message', event => {
    remoteSocket.write(event.data);
  });
}

/**
 * A helper to check for private IP addresses.
 * @param {string} ip
 */
function isPrivateAddress(ip) {
    return /^(10(\.\d{1,3}){3}|172\.(1[6-9]|2\d|3[01])(\.\d{1,3}){2}|192\.168(\.\d{1,3}){2}|127(\.\d{1,3}){3}|\[::1\]|fe80::)/.test(ip);
}

// In a real Worker environment, 'connect' is provided by the runtime.
// No declaration is needed here as it's a native part of the Cloudflare Workers API.
