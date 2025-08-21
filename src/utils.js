import fetch from 'node-fetch';
const https = require('https');

export function extractDomain(redirectUrl) {
  try {
    const url = new URL(redirectUrl);

    // ✅ Ensure only http/https allowed
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('Invalid protocol');
    }

    // ✅ Host gives domain + subdomain
    const fullHost = url.hostname; // e.g. "track.flipkart.com"

    // ✅ Optionally extract root domain
    const parts = fullHost.split('.');
    let domain = fullHost;
    if (parts.length > 2) {
      // Subdomain exists, return last 2 parts as root domain
      domain = parts.slice(-2).join('.');
    }

    return {
      fullHost, // "track.flipkart.com"
      rootDomain: domain, // "flipkart.com"
      protocol: url.protocol, // "https:"
    };
  } catch (err) {
    return null; // Invalid redirect URL
  }
}

// export async function notifyAdmin(message) {
//   const BOT_TOKEN = '8332945325:AAEn4HDimUyNjk9SvHlQ9cglb_BAX6J0kwA';
//   const CHAT_ID = '572769491'; // This must be a user who has started your bot
//   // const MESSAGE = 'Hello from raw API!';

//   const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
//   const body = {
//     chat_id: CHAT_ID,
//     text: message,
//   };
//   await fetch(url, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(body),
//   });
//   // const data = await res.json();
// }

export async function notifyAdmin(message) {
  const BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN';
  const CHAT_ID = 'USER_CHAT_ID';
  const MESSAGE = 'Hello from HTTPS!';

  const data = JSON.stringify({
    chat_id: CHAT_ID,
    text: message,
  });

  const options = {
    hostname: 'api.telegram.org',
    path: `/bot${BOT_TOKEN}/sendMessage`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
    },
  };

  const req = https.request(options, (res) => {
    let response = '';
    res.on('data', (chunk) => (response += chunk));
    res.on('end', () => console.log(response));
  });

  req.on('error', (e) => console.error(e));
  req.write(data);
  req.end();
}
