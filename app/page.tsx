import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; ap?: string }>;
}) {
  // Capture parameters automatically passed by the Ubiquiti AP
  const { id: userMac } = await searchParams;

  if (!userMac) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl border border-gray-100">
          <p className="text-red-500 font-semibold">Network Signature Missing</p>
          <p className="text-sm text-gray-500 mt-2">Please disconnect and reconnect to the Wi-Fi network.</p>
        </div>
      </div>
    );
  }

  // Construct the Google OAuth login link
  const rootUrl = 'https://google.com';
  const options = {
    redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ?? '',
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '',
    access_type: 'online',
    response_type: 'code',
    prompt: 'select_account',
    scope: ['openid', 'email', 'profile'].join(' '),
    // We pass the user's MAC address inside the 'state' parameter to retrieve it later
    state: userMac, 
  };

  const qs = new URLSearchParams(options).toString();
  const googleAuthUrl = `${rootUrl}?${qs}`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-gray-50 px-4">
      <div className="w-full max-w-md transform rounded-2xl bg-white p-10 text-center shadow-2xl transition-all border border-gray-100/50">
        
        {/* Organization Branding Placeholder */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20 font-bold text-2xl">
          ♥
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Staff & Volunteer Wi-Fi
        </h1>
        <p className="mt-3 text-sm text-gray-500 leading-relaxed">
          Welcome! Please authenticate using your official organization Google Workspace account to securely log onto the network.
        </p>

        <div className="mt-8">
          <a
            href={googleAuthUrl}
            className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-gray-900 px-5 py-3.5 text-base font-medium text-white shadow-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all active:scale-[0.98]"
          >
            <FontAwesomeIcon icon={faGoogle} className="h-5 w-5 text-red-400" />
            Sign in with Google
          </a>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-6">
          <p className="text-xs text-gray-400">
            By signing in, your device (<span className="font-mono text-gray-500">{userMac}</span>) will be whitelisted for 24 hours.
          </p>
        </div>
      </div>
    </div>
  );
}
