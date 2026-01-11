import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col">
      {/* Top nav */}
      <header className="w-full border-b border-white/5 bg-[#020617]/90 backdrop-blur">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-emerald-500 flex items-center justify-center">
              <span className="text-xl font-bold">⚡</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-sm">BijuliYatra</span>
              <span className="text-[11px] text-slate-400">
                India&apos;s largest EV charging network
              </span>
            </div>
          </Link>

          {/* Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-200">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <a href="#operators" className="hover:text-white">For Operators</a>
            <a href="#owners" className="hover:text-white">For EV Owners</a>
          </nav>

          {/* Auth / CTA */}
          <div className="flex items-center gap-3 text-sm">
            <Link to="/login" className="hidden sm:inline text-slate-200 hover:text-white">
              Login
            </Link>
            <Link
              to="/signup"
              className="hidden sm:inline rounded-full border border-emerald-500/40 px-4 py-2 text-emerald-400 hover:bg-emerald-500 hover:text-white transition"
            >
              Sign up
            </Link>
            <Link
              to="/app"
              className="rounded-full bg-emerald-500 px-4 py-2 font-medium hover:bg-emerald-600 transition"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Main scrollable content */}
      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-white/5 bg-gradient-to-b from-[#020617] to-[#020617]">
          <div className="max-w-6xl mx-auto px-6 pt-16 pb-20 grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-center">
            {/* Left hero content */}
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-400 mb-3">
                EV CHARGING MADE EASY
              </p>
              <h1 className="text-4xl sm:text-5xl font-semibold leading-tight mb-4">
                Charge smarter, <span className="text-emerald-400">drive farther</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-md mb-6">
                Find and book EV charging stations near you instantly. Access real‑time
                availability, smart payments, and the largest charging network across India.
              </p>

              {/* Primary CTAs */}
              <div className="flex flex-wrap gap-4 mb-6">
                <Link
                  to="/app/find-stations"
                  className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-medium hover:bg-emerald-600 transition"
                >
                  Find stations
                </Link>
                <Link
                  to="/signup?role=OPERATOR"
                  className="inline-flex items-center justify-center rounded-full border border-slate-600 px-5 py-2.5 text-sm font-medium text-slate-100 hover:border-emerald-500 hover:text-white transition"
                >
                  Become an operator
                </Link>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-6 text-[11px] text-slate-300">
                <div>
                  <div className="font-semibold text-emerald-400 text-sm">10,000+ </div>
                  <div>Stations</div>
                </div>
                <div>
                  <div className="font-semibold text-emerald-400 text-sm">500,000+ </div>
                  <div>Users</div>
                </div>
                <div>
                  <div className="font-semibold text-emerald-400 text-sm">24/7</div>
                  <div>Secure payments</div>
                </div>
              </div>
            </div>

            {/* Right mock image/card */}
            <div className="relative">
              <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 shadow-[0_0_80px_rgba(16,185,129,0.35)] overflow-hidden">
                <div className="aspect-video w-full bg-slate-900/40 flex items-center justify-center">
                  {/* Placeholder for hero image – swap with real image later */}
                  <span className="text-xs text-slate-500">
                    Charging station mockup / illustration
                  </span>
                </div>
                <div className="p-4 flex justify-between text-xs text-slate-200 border-t border-white/5">
                  <div>
                    <div className="font-medium text-emerald-400">Available now</div>
                    <div className="text-[11px] text-slate-400">3 ports free</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-slate-200">Nearby stations</div>
                    <div className="text-[11px] text-emerald-400">All with fast charging</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-b border-white/5 bg-[#020617]">
          <div className="max-w-6xl mx-auto px-6 py-14 grid gap-6 md:grid-cols-3">
            <FeatureCard
              title="Real‑time station availability"
              body="Check live availability of charging ports across all stations so you never drive to a full charger again."
            />
            <FeatureCard
              title="Smart booking & payments"
              body="Reserve your slot in advance and pay seamlessly with integrated digital payments."
            />
            <FeatureCard
              title="Operator analytics"
              body="Give station owners detailed insights into usage patterns, revenue and performance."
            />
          </div>
        </section>

        {/* How it works */}
        <section id="owners" className="border-b border-white/5 bg-[#020617]">
          <div className="max-w-4xl mx-auto px-6 py-16 text-center">
            <h2 className="text-2xl font-semibold mb-2">How BijuliYatra works</h2>
            <p className="text-sm text-slate-300 mb-10">
              Get charged in three simple steps.
            </p>

            <div className="grid gap-10 md:grid-cols-3 text-left md:text-center">
              <StepCard
                step="01"
                title="Find a station"
                body="Search for nearby charging stations on an interactive map."
              />
              <StepCard
                step="02"
                title="Book your slot"
                body="Reserve a charging port at your preferred time."
              />
              <StepCard
                step="03"
                title="Charge & pay"
                body="Plug in, monitor your session and pay securely."
              />
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="border-b border-white/5 bg-[#020617]">
          <div className="max-w-5xl mx-auto px-6 py-16 text-center">
            <h2 className="text-2xl font-semibold mb-2">Simple, transparent pricing</h2>
            <p className="text-sm text-slate-300 mb-10">
              Choose the plan that fits your needs.
            </p>

            <div className="grid gap-6 md:grid-cols-2 items-stretch">
              {/* EV Owners card */}
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 text-left flex flex-col">
                <h3 className="text-sm font-semibold text-slate-200 mb-1">EV Owners</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Perfect for individual EV drivers.
                </p>
                <p className="text-3xl font-semibold mb-1">Free</p>
                <p className="text-[11px] text-slate-400 mb-4">No monthly fees.</p>
                <button className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium mb-4 self-start hover:bg-emerald-600 transition">
                  Start charging
                </button>
                <ul className="mt-auto space-y-2 text-xs text-slate-200">
                  <li>• Find all charging stations</li>
                  <li>• Real‑time availability</li>
                  <li>• Book charging slots</li>
                  <li>• Digital payments</li>
                  <li>• Trip history</li>
                  <li>• Mobile app access (coming soon)</li>
                </ul>
              </div>

              {/* Station Operators card */}
              <div className="relative rounded-3xl border border-emerald-500/70 bg-gradient-to-br from-emerald-600/15 to-emerald-500/5 p-6 text-left flex flex-col shadow-[0_0_80px_rgba(16,185,129,0.35)]">
                <div className="inline-block rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] text-emerald-300 mb-3">
                  MOST POPULAR
                </div>
                <h3 className="text-sm font-semibold text-slate-200 mb-1">
                  Station Operators
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  For charging station owners and fleets.
                </p>
                <p className="text-3xl font-semibold mb-1">₹2,999</p>
                <p className="text-[11px] text-slate-400 mb-4">per month</p>
                <button className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium mb-4 self-start hover:bg-emerald-600 transition">
                  Start 30‑day trial
                </button>
                <ul className="mt-auto space-y-2 text-xs text-slate-200">
                  <li>• List unlimited stations</li>
                  <li>• Advanced analytics dashboard</li>
                  <li>• Revenue and settlement reports</li>
                  <li>• Customer insights & marketing tools</li>
                  <li>• Priority support & API access</li>
                  <li>• White‑label option for fleets</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#020617]">
          <div className="max-w-6xl mx-auto px-6 pt-10 pb-8 border-t border-white/5 text-xs text-slate-400">
            <div className="grid gap-8 md:grid-cols-4 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center">
                    <span className="text-sm font-bold">⚡</span>
                  </div>
                  <span className="font-semibold text-sm text-slate-100">BijuliYatra</span>
                </div>
                <p className="text-[11px]">
                  India&apos;s largest EV charging network. Charge smarter, drive farther.
                </p>
              </div>

              <div>
                <h4 className="mb-2 font-semibold text-slate-200 text-xs">Product</h4>
                <ul className="space-y-1">
                  <li>Features</li>
                  <li>Pricing</li>
                  <li>For EV Owners</li>
                  <li>For Operators</li>
                </ul>
              </div>

              <div>
                <h4 className="mb-2 font-semibold text-slate-200 text-xs">Company</h4>
                <ul className="space-y-1">
                  <li>About us</li>
                  <li>Blog</li>
                  <li>Press</li>
                  <li>Partners</li>
                </ul>
              </div>

              <div>
                <h4 className="mb-2 font-semibold text-slate-200 text-xs">Contact</h4>
                <ul className="space-y-1">
                  <li>support@bijuliyatra.com</li>
                  <li>+91 1800‑123‑4567</li>
                  <li>Bengaluru, India</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>© {new Date().getFullYear()} BijuliYatra. All rights reserved.</span>
              <div className="flex gap-3 text-[11px]">
                <span>Privacy</span>
                <span>Terms</span>
                <span>Cookies</span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

/* Small sub‑components for clarity */

function FeatureCard({ title, body }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
      <div className="mb-3 h-9 w-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
        ⚡
      </div>
      <h3 className="text-sm font-semibold mb-1">{title}</h3>
      <p className="text-xs text-slate-300">{body}</p>
    </div>
  );
}

function StepCard({ step, title, body }) {
  return (
    <div className="flex flex-col items-center md:items-center text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 text-xs text-emerald-400">
        STEP {step}
      </div>
      <h3 className="text-sm font-semibold mb-1">{title}</h3>
      <p className="text-xs text-slate-300 max-w-[220px]">{body}</p>
    </div>
  );
}
