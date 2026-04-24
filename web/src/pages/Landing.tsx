import { Star, ChevronRight, CheckCircle, Home, MessageCircle, Wrench, Shield } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#1F2937]">
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(109,190,117,0.08)_0%,_transparent_60%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 pt-20 pb-28 lg:pb-40">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-14 lg:gap-16">
            {/* Left – mockup */}
            <div className="relative flex-shrink-0 w-64 sm:w-72 lg:w-80 order-2 lg:order-1">
              <div className="relative z-10">
                <img
                  src="/mockup.png"
                  alt="Kumpuni App Mockup"
                  className="w-full drop-shadow-2xl rounded-3xl"
                />
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] rounded-full bg-[#6DBE75]/[0.06] blur-3xl -z-0" />
            </div>

            {/* Right – copy */}
            <div className="text-center lg:text-left max-w-xl w-full px-2 sm:px-0 order-1 lg:order-2">
              <div className="flex items-center gap-3 justify-center lg:justify-start mb-7">
                <img src="/logo.png" alt="Kumpuni" className="w-12 h-12 rounded-2xl" />
                <span className="text-2xl font-bold tracking-tight text-[#1F2937]">Kumpuni</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-[#6DBE75]/10 backdrop-blur px-5 py-2 rounded-full text-sm font-medium mb-8 text-[#6DBE75]">
                <Shield size={18} />
                Your DIY Home Maintenance Guide
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-[4.5rem] font-extrabold tracking-tight leading-[1.05] mb-8 text-[#1F2937]">
                Keep Your Home
                <br />
                <span className="text-[#6DBE75]">In Great Shape.</span>
              </h1>
              <p className="text-[#6B7280] text-xl sm:text-2xl leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0">
                Guides, AI assistance, and trusted fixers — all in one friendly app.
              </p>

              {/* Store buttons */}
              <div id="download" className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <a
                  href="#download"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#1F2937] text-white px-8 py-4 rounded-2xl font-semibold text-base hover:bg-black transition-colors shadow-lg shadow-[#1F2937]/20"
                >
                  <svg viewBox="0 0 24 24" className="w-8 h-8 flex-shrink-0" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs leading-none opacity-70">Download on the</div>
                    <div className="text-base leading-tight font-bold">App Store</div>
                  </div>
                </a>
                <a
                  href="#download"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#1F2937] text-white px-8 py-4 rounded-2xl font-semibold text-base hover:bg-black transition-colors shadow-lg shadow-[#1F2937]/20"
                >
                  <svg viewBox="0 0 24 24" className="w-8 h-8 flex-shrink-0" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.4l2.583 1.496c.572.331.572.87 0 1.2l-2.583 1.497-2.606-2.597 2.606-2.596z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs leading-none opacity-70">GET IT ON</div>
                    <div className="text-base leading-tight font-bold">Google Play</div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Looking For a Fixer ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 -mt-10 relative z-20">
        <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
          <div className="order-1 flex-1 text-center sm:text-left">
            <p className="text-sm font-semibold text-[#6DBE75] uppercase tracking-wide mb-1">
              Looking For a Fixer?
            </p>
            <h3 className="text-2xl font-bold text-[#1F2937] mb-2">
              Find trusted local pros in minutes.
            </h3>
            <p className="text-[#6B7280] text-sm sm:text-base">
              Browse verified fixers, compare ratings, and contact the right expert for the job.
            </p>
          </div>
          <img
            src="/fix.png"
            alt="Looking for a fixer"
            className="order-2 w-28 h-28 sm:w-32 sm:h-32 object-contain"
          />
          <a
            href="#download"
            className="order-3 w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#6DBE75] text-white px-6 py-3 rounded-2xl font-semibold hover:bg-[#5CAE65] transition-colors"
          >
            Open Find Fixer <ChevronRight size={18} />
          </a>
        </div>
      </section>

      {/* ─── App Screenshots ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-28 lg:py-40">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 text-[#1F2937]">
            Three ways to fix your home.
          </h2>
          <p className="text-[#6B7280] text-lg sm:text-xl max-w-lg mx-auto">
            Everything you need, nothing you don't.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              img: '/greetings.png',
              label: 'Explore',
              title: 'DIY Home Guides',
              desc: 'Browse easy-to-follow maintenance guides and seasonal tips.',
              bg: '#FFF9F0',
            },
            {
              img: '/assistant.png',
              label: 'Ask AI',
              title: 'AI Assistant',
              desc: 'Got a leak or flicker? Chat with our AI for step-by-step help.',
              bg: '#FFF3E0',
            },
            {
              img: '/fix.png',
              label: 'Hire Pro',
              title: 'Find Trusted Fixers',
              desc: 'Connect with rated plumbers, electricians, and handymen nearby.',
              bg: '#E3F2FD',
            },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center text-center">
              <div
                className="w-full rounded-3xl p-8 flex items-center justify-center mb-6"
                style={{ backgroundColor: item.bg }}
              >
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-40 h-40 object-contain drop-shadow-md"
                />
              </div>
              <div className="inline-flex items-center gap-2 text-sm text-[#6DBE75] bg-[#6DBE75]/10 px-4 py-1.5 rounded-full mb-3 font-medium">
                {item.label}
              </div>
              <h3 className="text-lg font-bold mb-2 text-[#1F2937]">{item.title}</h3>
              <p className="text-[#6B7280] text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Stats Strip ─── */}
      <section className="border-y border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-24 grid grid-cols-2 lg:grid-cols-4 gap-10 text-center">
          <div>
            <p className="text-5xl sm:text-6xl font-extrabold text-[#6DBE75]">50+</p>
            <p className="text-[#9CA3AF] text-base mt-2">DIY Guides</p>
          </div>
          <div>
            <p className="text-5xl sm:text-6xl font-extrabold text-[#6DBE75]">24/7</p>
            <p className="text-[#9CA3AF] text-base mt-2">AI Assistant</p>
          </div>
          <div>
            <p className="text-5xl sm:text-6xl font-extrabold text-[#6DBE75]">100+</p>
            <p className="text-[#9CA3AF] text-base mt-2">Trusted Fixers</p>
          </div>
          <div>
            <p className="text-5xl sm:text-6xl font-extrabold text-[#6DBE75]">0</p>
            <p className="text-[#9CA3AF] text-base mt-2">Subscription Fees</p>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-28 lg:py-40">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 text-[#1F2937]">
            Three steps. That's it.
          </h2>
          <p className="text-[#6B7280] text-lg sm:text-xl max-w-lg mx-auto">
            Get started in under a minute.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {[
            {
              step: '01',
              title: 'Pick a Guide',
              desc: 'Browse DIY guides for leaks, wiring, seasonal checks, and more.',
              icon: 'Home',
            },
            {
              step: '02',
              title: 'Ask the AI',
              desc: 'Chat with our AI assistant for step-by-step repair guidance anytime.',
              icon: 'MessageCircle',
            },
            {
              step: '03',
              title: 'Call a Fixer',
              desc: 'Need a pro? Find and connect with rated fixers near you in seconds.',
              icon: 'Wrench',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="relative bg-white border border-[#E5E7EB] rounded-3xl p-10 text-center shadow-sm"
            >
              <div className="text-7xl font-black text-[#1F2937]/[0.04] absolute top-6 right-8">
                {item.step}
              </div>
              <div className="w-20 h-20 rounded-3xl bg-[#E8F5E9] flex items-center justify-center mx-auto mb-7">
                {item.icon === 'Home' && <Home size={34} className="text-[#6DBE75]" />}
                {item.icon === 'MessageCircle' && <MessageCircle size={34} className="text-[#6DBE75]" />}
                {item.icon === 'Wrench' && <Wrench size={34} className="text-[#6DBE75]" />}
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#1F2937]">{item.title}</h3>
              <p className="text-[#6B7280] text-base leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Testimonials / Reviews ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-28 lg:py-40">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 text-[#1F2937]">
            What homeowners are saying
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              name: 'Grace M.',
              text: "I fixed my leaky faucet myself using Kumpuni's step-by-step guide. Saved me a plumber visit!",
              rating: 5,
            },
            {
              name: 'Brian T.',
              text: "The AI assistant is a lifesaver. I asked about wiring and got clear, safe instructions instantly.",
              rating: 5,
            },
            {
              name: 'Liza K.',
              text: 'Found a great handyman near me through the app. Super easy to post a job and get responses.',
              rating: 5,
            },
            {
              name: 'Marc D.',
              text: 'Love the quarterly tips. My home maintenance is now on autopilot. Highly recommend!',
              rating: 5,
            },
          ].map((review, i) => (
            <div
              key={i}
              className="bg-white border border-[#E5E7EB] rounded-3xl p-8 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-base text-[#1F2937]">{review.name}</span>
                <div className="flex gap-1">
                  {[...Array(review.rating)].map((_, j) => (
                    <Star key={j} size={18} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-[#6B7280] text-base leading-relaxed">"{review.text}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Download CTA ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-28 lg:py-40">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 text-[#1F2937]">
            Get Kumpuni Today
          </h2>
          <p className="text-[#6B7280] text-lg sm:text-xl max-w-lg mx-auto">
            Free to download. No subscription. Start maintaining your home smarter.
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <div className="relative bg-white border border-[#E5E7EB] rounded-3xl p-10 sm:p-12 text-center overflow-hidden shadow-sm">
            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <img src="/logo.png" alt="Kumpuni" className="w-20 h-20 rounded-2xl" />
              </div>
              <p className="text-sm font-semibold text-[#9CA3AF] uppercase tracking-widest mb-4">Free Download</p>
              <div className="space-y-3 text-left mb-8">
                {[
                  '50+ DIY home maintenance guides',
                  'AI assistant for instant repair help',
                  'Find trusted fixers near you',
                  'Quarterly home tips & checklists',
                  'All future updates included',
                  'No ads, no tracking, no subscription',
                ].map((feat) => (
                  <div key={feat} className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-[#6DBE75] flex-shrink-0" />
                    <span className="text-sm font-medium text-[#374151]">{feat}</span>
                  </div>
                ))}
              </div>
              <a
                href="#download"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#6DBE75] text-white px-8 py-4 rounded-2xl font-semibold text-base hover:bg-[#5CAE65] transition-colors shadow-lg shadow-[#6DBE75]/20"
              >
                Get Kumpuni <ChevronRight size={20} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pb-28 lg:pb-40">
        <div className="relative bg-white border border-[#E5E7EB] rounded-3xl p-10 sm:p-16 lg:p-20 flex flex-col sm:flex-row items-center gap-10 overflow-hidden shadow-sm">
          <div className="absolute -right-16 -bottom-16 opacity-5">
            <img src="/greetings.png" alt="" className="w-64 h-64" />
          </div>
          <div className="flex-1 relative z-10 text-center sm:text-left">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1F2937] mb-3">
              Ready to fix your home?
            </h2>
            <p className="text-[#6B7280] text-lg max-w-lg">
              Download Kumpuni for free — your personal DIY home maintenance guide. No subscription ever.
            </p>
          </div>
          <a
            href="#download"
            className="relative z-10 w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#6DBE75] text-white px-10 py-5 rounded-full font-semibold text-lg hover:bg-[#5CAE65] transition-colors whitespace-nowrap shadow-lg shadow-[#6DBE75]/20"
          >
            Get the App <ChevronRight size={22} />
          </a>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-14 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Kumpuni" className="w-11 h-11 rounded-xl" />
            <span className="font-semibold text-base text-[#1F2937]">Kumpuni</span>
          </div>
          <div className="flex items-center gap-8 text-base text-[#9CA3AF]">
            <a href="/privacy" className="hover:text-[#6DBE75] transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-[#6DBE75] transition-colors">
              Terms
            </a>
          </div>
          <p className="text-sm text-[#9CA3AF]">
            Made by{' '}
            <a
              href="https://rcconstante.dev"
              className="text-[#6DBE75] hover:text-[#5CAE65] transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Richmond C. Constante
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
