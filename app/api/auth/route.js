import { NextResponse } from 'next/server';
import { getDictionary } from '../../dictionaries';

const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userMac = searchParams.get('id');
  const dict = await getDictionary();

  if (!userMac) {
    return NextResponse.json({ error: dict.auth.missingSignature }, { status: 400 });
  }

  const clientId = process.env.PUBLIC_GOOGLE_CLIENT_ID;
  const redirectUri = process.env.PUBLIC_GOOGLE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: dict.auth.notConfigured }, { status: 500 });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    access_type: 'online',
    response_type: 'code',
    prompt: 'select_account',
    scope: 'openid email profile',
    // We pass the user's MAC address inside the 'state' parameter to retrieve it later
    state: userMac,
  });

  return NextResponse.redirect(`${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`, 302);
}
