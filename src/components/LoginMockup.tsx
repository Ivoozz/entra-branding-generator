import Image from 'next/image';

interface LoginMockupProps {
  backgroundUrl: string | null;
  logoUrl: string | null;
}

export default function LoginMockup({ backgroundUrl, logoUrl }: LoginMockupProps) {
  return (
    <div className="w-full mt-12 mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">Live Preview (Mockup)</h2>
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
        {/* Background Image */}
        {backgroundUrl ? (
          <Image
            src={backgroundUrl}
            alt="Background Preview"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-900" />
        )}

        {/* Overlay for realism */}
        <div className="absolute inset-0 bg-black/5" />

        {/* Sign-in Box */}
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[440px] p-11 shadow-lg border border-transparent">
            {/* Logo */}
            <div className="mb-6 h-10 relative w-full flex items-start">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt="Organization Logo"
                  width={245}
                  height={36}
                  className="object-contain object-left"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-600 rounded-sm" />
                  <span className="font-semibold text-zinc-700">Microsoft</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex flex-col gap-4">
              <h1 className="text-2xl font-semibold text-zinc-900">Sign in</h1>
              
              <div className="mt-2">
                <input
                  type="email"
                  placeholder="Email, phone, or Skype"
                  disabled
                  className="w-full border-b border-zinc-400 py-1.5 focus:border-blue-600 outline-none transition-colors bg-transparent text-zinc-800 placeholder:text-zinc-500"
                />
              </div>

              <div className="mt-4 text-sm">
                <p className="text-zinc-600">
                  No account? <a href="#" className="text-blue-600 hover:underline">Create one!</a>
                </p>
                <p className="text-blue-600 hover:underline mt-2">Can't access your account?</p>
              </div>

              <div className="mt-8 flex justify-end gap-2">
                <button
                  disabled
                  className="px-8 py-1.5 bg-[#0067b8] text-white text-sm hover:bg-[#005da6] transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Options Mock */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-[440px] px-4">
            <div className="bg-white/90 backdrop-blur-sm p-4 shadow-md flex items-center gap-3 cursor-pointer hover:bg-white transition-colors">
                <div className="w-6 h-6 flex items-center justify-center bg-zinc-200 rounded-full">
                    <svg className="w-4 h-4 text-zinc-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 11V5h2v6H9zm0 4v-2h2v2H9z" />
                    </svg>
                </div>
                <span className="text-sm text-zinc-700">Sign-in options</span>
            </div>
        </div>
      </div>
    </div>
  );
}
