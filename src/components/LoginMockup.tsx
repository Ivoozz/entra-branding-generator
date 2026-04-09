import Image from 'next/image';

interface LoginMockupProps {
  backgroundUrl: string | null;
  logoUrl: string | null;
  theme: 'light' | 'dark';
}

export default function LoginMockup({ backgroundUrl, logoUrl, theme }: LoginMockupProps) {
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
          <div className={`w-full max-w-[440px] p-11 shadow-lg border border-transparent transition-colors duration-300 ${
            theme === 'light' ? 'bg-white' : 'bg-[#1b1b1b]'
          }`}>
            {/* Logo */}
            <div className="mb-6 h-10 relative w-full flex items-start">
              {logoUrl ? (
                <div className="checkerboard rounded p-1 border border-zinc-100 dark:border-zinc-800">
                  <Image
                    src={logoUrl}
                    alt="Organization Logo"
                    width={245}
                    height={36}
                    className="object-contain object-left max-h-8 w-auto"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-600 rounded-sm" />
                  <span className={`font-semibold ${theme === 'light' ? 'text-zinc-700' : 'text-zinc-300'}`}>Microsoft</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex flex-col gap-4">
              <h1 className={`text-2xl font-semibold ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>Sign in</h1>
              
              <div className="mt-2">
                <input
                  type="email"
                  placeholder="Email, phone, or Skype"
                  disabled
                  className={`w-full border-b py-1.5 outline-none transition-colors bg-transparent placeholder:text-zinc-500 ${
                    theme === 'light' 
                      ? 'border-zinc-400 text-zinc-800 focus:border-blue-600' 
                      : 'border-zinc-600 text-zinc-100 focus:border-blue-400'
                  }`}
                />
              </div>

              <div className="mt-4 text-sm">
                <p className={theme === 'light' ? 'text-zinc-600' : 'text-zinc-400'}>
                  No account? <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Create one!</a>
                </p>
                <p className="text-blue-600 dark:text-blue-400 hover:underline mt-2">Can't access your account?</p>
              </div>

              <div className="mt-8 flex justify-end gap-2">
                <button
                  disabled
                  className={`px-8 py-1.5 text-sm transition-colors ${
                    theme === 'light'
                      ? 'bg-[#0067b8] text-white hover:bg-[#005da6]'
                      : 'bg-[#0067b8] text-white hover:bg-[#005da6] opacity-90'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Options Mock */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-[440px] px-4">
            <div className={`backdrop-blur-sm p-4 shadow-md flex items-center gap-3 cursor-pointer transition-colors ${
              theme === 'light' 
                ? 'bg-white/90 hover:bg-white' 
                : 'bg-[#1b1b1b]/90 hover:bg-[#1b1b1b]'
            }`}>
                <div className={`w-6 h-6 flex items-center justify-center rounded-full ${
                  theme === 'light' ? 'bg-zinc-200' : 'bg-zinc-800'
                }`}>
                    <svg className={`w-4 h-4 ${theme === 'light' ? 'text-zinc-600' : 'text-zinc-400'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 11V5h2v6H9zm0 4v-2h2v2H9z" />
                    </svg>
                </div>
                <span className={`text-sm ${theme === 'light' ? 'text-zinc-700' : 'text-zinc-300'}`}>Sign-in options</span>
            </div>
        </div>
      </div>
    </div>
  );
}
