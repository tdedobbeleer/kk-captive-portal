import { redirect } from 'next/navigation';

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
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

  // The backend auth route builds the Google OAuth URL and redirects the client
  redirect(`/api/auth?id=${encodeURIComponent(userMac)}`);
}
