function extractDomain(redirectUrl) {
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

export default extractDomain;
