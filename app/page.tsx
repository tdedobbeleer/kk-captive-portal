import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { getDictionary } from './dictionaries';

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; ap?: string }>;
}) {
  // Capture parameters automatically passed by the Ubiquiti AP
  const { id: userMac } = await searchParams;
  const dict = await getDictionary();

  if (!userMac) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl border border-gray-100">
          <p className="text-red-500 font-semibold">{dict.landing.missingTitle}</p>
          <p className="text-sm text-gray-500 mt-2">{dict.landing.missingDescription}</p>
        </div>
      </div>
    );
  }

  // The backend auth endpoint builds the Google OAuth URL and redirects the client
  const authUrl = `/api/auth?id=${encodeURIComponent(userMac)}`;
  const [whitelistedBefore, whitelistedAfter] = dict.landing.whitelisted.split('{mac}');

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-gray-50 px-4">
      <div className="w-full max-w-md transform rounded-2xl bg-white p-10 text-center shadow-2xl transition-all border border-gray-100/50">

        {/* Organization Branding */}
        <img
          src="/logo.png"
          alt="Koning Kevin"
          className="mx-auto mb-6 h-24 w-24 rounded-2xl object-cover shadow-lg shadow-blue-500/20"
        />

        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          {dict.landing.title}
        </h1>
        <p className="mt-3 text-sm text-gray-500 leading-relaxed">
          {dict.landing.welcome}
        </p>

        <div className="mt-8">
          <a
            href={authUrl}
            className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-gray-900 px-5 py-3.5 text-base font-medium text-white shadow-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all active:scale-[0.98]"
          >
            <FontAwesomeIcon icon={faGoogle} className="h-5 w-5 text-red-400" />
            {dict.landing.signIn}
          </a>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-6">
          <p className="text-xs text-gray-400">
            {whitelistedBefore}
            <span className="font-mono text-gray-500">{userMac}</span>
            {whitelistedAfter}
          </p>
        </div>
      </div>
    </div>
  );
}
