import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import https from 'https';

const oauth2Client = new OAuth2Client(
  process.env.PUBLIC_GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.PUBLIC_GOOGLE_REDIRECT_URI
);

const unifiClient = axios.create({
  baseURL: process.env.UNIFI_CONTROLLER_URL,
  withCredentials: true,
  headers: { 'X-API-Key': process.env.UNIFI_API_KEY },
  httpsAgent: new https.Agent({ rejectUnauthorized: false })
});

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const userMac = searchParams.get('state'); // Extracted from the state token we sent

  if (!code || !userMac) {
    return NextResponse.json({ error: 'Authentication payload missing.' }, { status: 400 });
  }

  try {
    // 1. Get user profile from Google
    const { tokens } = await oauth2Client.getToken(code);
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.PUBLIC_GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();

    // 2. Domain Check
    if (!payload.email.endsWith(`@${process.env.ALLOWED_DOMAIN}`)) {
      return new NextResponse(
        `<h1 style="color:red; text-align:center; margin-top:10%;">Access Denied: Corporate Accounts Only.</h1>`,
        { headers: { 'Content-Type': 'text/html' }, status: 403 }
      );
    }

    // 3. Authorize device on Ubiquiti via API key header
    await unifiClient.post('/api/s/default/cmd/stamgr', {
      cmd: 'authorize-guest',
      mac: userMac.toLowerCase(),
      minutes: 1440 // 24 hours
    });

    // 4. Return user with success webpage injection
    return new NextResponse(`
      <body style="font-family:sans-serif; display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; background:#f0fdf4; margin:0;">
        <div style="text-align:center; padding:2rem; background:white; border-radius:1rem; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);">
          <h2 style="color:#16a34a; margin:0 0 0.5rem 0;">Connection Successful!</h2>
          <p style="color:#4b5563; margin:0;">You are now connected to the internet.</p>
        </div>
        <script>setTimeout(function(){ window.location.href = "https://google.com"; }, 2500);</script>
      </body>
    `, { headers: { 'Content-Type': 'text/html' } });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal system connection issue.' }, { status: 500 });
  }
}
