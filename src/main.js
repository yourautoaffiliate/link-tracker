import { Client, Databases, Query } from 'node-appwrite';
import { extractDomain } from './utils.js';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client()
  .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
  .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function updateDB(uid, redirectUrl, ip, ua, log, error) {
  try {
    // Lookup city via free API
    let city = 'unknown';
    if (ip !== 'unknown') {
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=city`);
        const geoData = await geoRes.json();
        city = geoData.city || 'unknown';
      } catch (e) {
        log('Geo lookup failed: ' + e.message);
      }
    }
    const currentMonth = new Date().toLocaleString('default', {
      month: 'long',
    });
    const currentYear = new Date().getFullYear();

    // check if click already exists
    if (ip !== 'unknown') {
      const clicksDocs = await databases.listDocuments(
        process.env.DB_ID, // Database ID
        process.env.CLICKS_COL_ID, // Collection ID
        [Query.equal('redirectUrl', redirectUrl), Query.equal('ip', ip)]
      );
      if (clicksDocs.total > 0) {
        return;
      }
    }

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
    log(e.message);
  }
}

// This Appwrite function will be executed every time your function is triggered
export default async function trackFunction({
  req,
  res,
  log = console.log,
  error = console.error,
}) {
  log(req.headers);
  const redirectUrl = req.query.redirect;
  const uid = req.query.uid;

  // Capture request details
  const ip = req.headers['fastly-client-ip'] || 'unknown';
  const ua = req.headers['user-agent'] || 'unknown';

  if (!redirectUrl) {
    return res.send('Missing redirect param', 400);
  }

  updateDB(uid, redirectUrl, ip, ua, log, error);

  // Redirect user
  return res.redirect(redirectUrl, 302);
}
