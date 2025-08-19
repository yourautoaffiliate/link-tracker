import { Client, Databases, Query } from 'node-appwrite';
import { extractDomain } from './utils.js';

// This Appwrite function will be executed every time your function is triggered
export default async ({ req, res, log, error }) => {
  // You can use the Appwrite SDK to interact with other services
  // For this example, we're using the Users service

  // const users = new Users(client);

  const redirectUrl = req.query.redirect;
  const uid = req.query.uid;

  if (!redirectUrl) {
    return res.send('Missing redirect param', 400);
  }

  // Redirect user
  res.redirect(redirectUrl, 302);

  try {
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);

    // Capture request details
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.connection?.remoteAddress;
    const ua = req.headers['user-agent'] || 'unknown';

    // Lookup city via free API
    let city = 'unknown';
    try {
      const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=city`);
      const geoData = await geoRes.json();
      city = geoData.city || 'unknown';
    } catch (e) {
      log('Geo lookup failed: ' + e.message);
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // get analyitics object id
    const analyticsDocs = await databases.listDocuments(
      process.env.DB_ID, // Database ID
      process.env.ANALYTICS_COL_ID, // Collection ID
      [
        Query.equal('user', uid),
        Query.equal('month', currentMonth),
        Query.equal('year', currentYear),
      ]
    );

    if (analyticsDocs.total > 0) {
      const analyticsDoc = analyticsDocs.documents[0];
      const analyticsId = analyticsDoc.$id;

      const extractedDomain = extractDomain(redirectUrl);
      const fullHost = extractedDomain?.fullHost;

      // Save into Appwrite Database
      await databases.createDocument(
        process.env.DB_ID, // Database ID
        process.env.CLICKS_COL_ID, // Collection ID
        'unique()', // Auto-generate ID
        {
          domain: fullHost,
          redirectUrl: redirectUrl,
          ip,
          city,
          userAgent: ua,
          timestamp: new Date().toISOString(),
          analytics: analyticsId,
        }
      );
    }
  } catch (e) {
    error(e.message);
    return res.send('Server Error', 500);
  }
};
