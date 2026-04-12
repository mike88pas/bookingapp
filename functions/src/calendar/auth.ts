import { onRequest } from 'firebase-functions/v2/https';
import { google } from 'googleapis';
import * as admin from 'firebase-admin';
import {
  REGION,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALENDAR_SCOPES,
  APP_URL,
} from '../config';

const db = admin.firestore();

function getOAuth2Client() {
  const clientId = GOOGLE_CLIENT_ID.value();
  const clientSecret = GOOGLE_CLIENT_SECRET.value();
  const redirectUri = `https://${REGION}-bookingapp-dev.cloudfunctions.net/googleCalendarCallback`;

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

/**
 * Step 1: Trainer clicks "Connect Calendar" -> redirected to Google consent screen.
 * Query params: ?trainerId=xxx&uid=xxx
 */
export const googleCalendarAuthStart = onRequest(
  {
    region: REGION,
    cors: false,
    invoker: 'public',
    secrets: [GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET],
  },
  async (req, res) => {
    const { trainerId, uid } = req.query;

    if (!trainerId || !uid) {
      res.status(400).send('Brak trainerId lub uid');
      return;
    }

    const roleDoc = await db.collection('roles').doc(uid as string).get();
    const roleData = roleDoc.data();
    if (
      !roleDoc.exists ||
      !roleData ||
      (roleData.role !== 'trainer' && roleData.role !== 'tenant_admin' && roleData.role !== 'super_admin')
    ) {
      res.status(403).send('Brak uprawnien');
      return;
    }

    const oauth2Client = getOAuth2Client();
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: GOOGLE_CALENDAR_SCOPES,
      state: JSON.stringify({ trainerId, uid }),
    });

    res.redirect(authUrl);
  }
);

/**
 * Step 2: Google redirects back with authorization code.
 */
export const googleCalendarCallback = onRequest(
  {
    region: REGION,
    cors: false,
    invoker: 'public',
    secrets: [GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET],
  },
  async (req, res) => {
    const { code, state, error } = req.query;

    if (error) {
      res.redirect(`${APP_URL.value()}/app?calendar=error&reason=${error}`);
      return;
    }

    if (!code || !state) {
      res.status(400).send('Brak code lub state');
      return;
    }

    let parsedState: { trainerId: string; uid: string };
    try {
      parsedState = JSON.parse(state as string);
    } catch {
      res.status(400).send('Nieprawidlowy state');
      return;
    }

    const { trainerId } = parsedState;

    try {
      const oauth2Client = getOAuth2Client();
      const { tokens } = await oauth2Client.getToken(code as string);

      if (!tokens.refresh_token) {
        res.redirect(`${APP_URL.value()}/app?calendar=error&reason=no_refresh_token`);
        return;
      }

      let googleEmail = '';
      try {
        oauth2Client.setCredentials(tokens);
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const userInfo = await oauth2.userinfo.get();
        googleEmail = userInfo.data.email || '';
      } catch (emailErr) {
        console.warn('Could not fetch Google email:', emailErr);
      }

      // Save tokens (functions-only collection)
      await db.collection('trainerTokens').doc(trainerId).set({
        refreshToken: tokens.refresh_token,
        accessToken: tokens.access_token || '',
        googleEmail,
        connectedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Update trainer profile flag
      await db.collection('trainers').doc(trainerId).update({
        googleCalendarConnected: true,
        googleCalendarId: 'primary',
      });

      res.redirect(`${APP_URL.value()}/app?calendar=connected`);
    } catch (err) {
      console.error('Error exchanging OAuth code:', err);
      res.redirect(`${APP_URL.value()}/app?calendar=error`);
    }
  }
);

/**
 * Get authenticated OAuth2 client for a trainer (used by events.ts).
 */
export async function getTrainerOAuth2Client(trainerId: string) {
  const tokenDoc = await db.collection('trainerTokens').doc(trainerId).get();
  if (!tokenDoc.exists) return null;

  const data = tokenDoc.data();
  if (!data?.refreshToken) return null;

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: data.refreshToken });
  return oauth2Client;
}
