import { useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';

export default function PrivacyPage() {
  useEffect(() => {
    document.title = 'Privacy Policy — Kumpuni';
    const setMeta = (name: string, content: string, prop = false) => {
      const attr = prop ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };
    setMeta('description', 'Kumpuni Privacy Policy — your home maintenance companion. We minimize data collection and keep your information safe.');
    setMeta('og:title', 'Privacy Policy — Kumpuni', true);
    setMeta('og:description', 'Kumpuni respects your privacy. Learn how we handle your data responsibly.', true);
    setMeta('og:url', 'https://kumpuni.netlify.app/privacy', true);
    setMeta('twitter:title', 'Privacy Policy — Kumpuni');
    setMeta('twitter:description', 'Kumpuni respects your privacy. Learn how we handle your data responsibly.');
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', 'https://kumpuni.netlify.app/privacy');
    return () => {
      document.title = 'Kumpuni — DIY Home Maintenance Guide';
      if (canonical) canonical.setAttribute('href', 'https://kumpuni.netlify.app/');
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#1F2937]">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Back */}
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#9CA3AF] hover:text-[#6DBE75] transition-colors mb-10"
        >
          <ChevronLeft size={16} />
          Back to Kumpuni
        </a>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <img src="/logo.png" alt="Kumpuni" className="w-10 h-10 rounded-xl" />
            <span className="text-xl font-bold">Kumpuni</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-[#9CA3AF] text-sm">Last updated: April 19, 2026</p>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#E5E7EB] mb-12" />

        {/* Content */}
        <div className="prose max-w-none space-y-10 text-[#6B7280] leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-[#1F2937] mb-3">1. Overview</h2>
            <p>
              Kumpuni is designed from the ground up with privacy as a core principle.
              We do not sell your personal data. Most features work locally on your device.
              We only collect what is necessary to help you maintain your home.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1F2937] mb-3">2. Data We Do Not Collect</h2>
            <p>Kumpuni does <strong className="text-[#1F2937]">not</strong> collect any of the following:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Personal identifiers without your consent</li>
              <li>Selling your data to third parties</li>
              <li>Device identifiers for advertising</li>
              <li>Behavioral tracking across apps</li>
              <li>Unnecessary analytics or profiling</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1F2937] mb-3">3. On-Device Processing</h2>
            <p>
              DIY guides and the AI assistant operate primarily on your device.
              Guide content and AI responses are processed locally when possible.
              Any cloud-based AI interactions use encrypted connections to trusted providers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1F2937] mb-3">4. Camera Access</h2>
            <p>
              Kumpuni may request camera access to take photos when posting a job.
              Camera access is only active when you explicitly choose to add a photo.
              Photos are stored on your device and only shared when you post a job to find fixers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1F2937] mb-3">5. File Uploads</h2>
            <p>
              When you upload photos for a job posting, those images may be shared with fixers
              you choose to connect with. We do not use your photos for any other purpose.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1F2937] mb-3">6. Network Usage</h2>
            <p>
              The app requires an internet connection to load guide content, use the AI assistant,
              and connect with fixers in your area. Core guide content may be cached for offline use.
              Location services are only used when finding nearby fixers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1F2937] mb-3">7. Third-Party Services</h2>
            <p>
              Kumpuni does not integrate any third-party analytics, advertising, or tracking SDKs.
              We do not use services such as Firebase, Google Analytics, Mixpanel, Amplitude, or similar platforms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1F2937] mb-3">8. Children's Privacy</h2>
            <p>
              Kumpuni does not knowingly collect any data from children under 13 years of age.
              Since we collect no data from anyone, the app is safe for all age groups.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1F2937] mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy occasionally. Any changes will be posted on this page
              with an updated date. Continued use of the app after changes constitutes acceptance
              of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1F2937] mb-3">10. Contact</h2>
            <p>
              If you have any questions about this Privacy Policy, you can contact us at:
            </p>
            <div className="mt-3 bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
              <p className="font-semibold text-[#1F2937]">Richmond Constante</p>
              <p className="text-sm text-[#9CA3AF] mt-1">
                Portfolio:{' '}
                <a href="https://rcconstante.dev" className="text-[#6DBE75] hover:underline" target="_blank" rel="noopener noreferrer">
                  rcconstante.dev
                </a>
              </p>
              <p className="text-sm text-[#9CA3AF] mt-1">
                GitHub:{' '}
                <a href="https://github.com/rcconstante" className="text-[#6DBE75] hover:underline" target="_blank" rel="noopener noreferrer">
                  github.com/rcconstante
                </a>
              </p>
            </div>
          </section>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#E5E7EB] mt-16 mb-8" />

        {/* Footer mini */}
        <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
          <span>© 2026 Kumpuni</span>
          <a href="/terms" className="hover:text-[#6DBE75] transition-colors">Terms of Service</a>
        </div>
      </div>
    </div>
  );
}
