import fetch from 'node-fetch';

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

export async function notifyAdmin(message) {
  const BOT_TOKEN = '8332945325:AAEn4HDimUyNjk9SvHlQ9cglb_BAX6J0kwA';
  const CHAT_ID = '572769491'; // This must be a user who has started your bot
  // const MESSAGE = 'Hello from raw API!';

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const body = {
    chat_id: CHAT_ID,
    text: message,
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  console.log(data); // Telegram API response
}
