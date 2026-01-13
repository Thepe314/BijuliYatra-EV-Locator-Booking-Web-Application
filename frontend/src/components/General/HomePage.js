import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 flex flex-col">
      {/* Top nav */}
      <header className="w-full border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-emerald-500 flex items-center justify-center">
              <span className="text-xl font-bold text-white">⚡</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-sm text-slate-900">
                BijuliYatra
              </span>
              <span className="text-[11px] text-slate-500">
                Nepal&apos;s largest EV charging network
              </span>
            </div>
          </Link>

          {/* Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <a href="#features" className="hover:text-slate-900">
              Features
            </a>
            <a href="#pricing" className="hover:text-slate-900">
              Pricing
            </a>
            <a href="#operators" className="hover:text-slate-900">
              For Operators
            </a>
            <a href="#owners" className="hover:text-slate-900">
              For EV Owners
            </a>
          </nav>

          {/* Auth / CTA */}
          <div className="flex items-center gap-3 text-sm">
            <Link
              to="/signup/ev-owner"
              className="hidden sm:inline rounded-full border border-emerald-500/60 px-4 py-2 text-emerald-600 hover:bg-emerald-500 hover:text-white transition"
            >
              Sign up
            </Link>
            <Link
              to="/login"
              className="rounded-full bg-emerald-500 px-4 py-2 font-medium text-white hover:bg-emerald-600 transition"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main scrollable content */}
      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-slate-200 bg-gradient-to-b from-white to-emerald-50/40">
          <div className="max-w-6xl mx-auto px-6 pt-16 pb-20 grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-center">
            {/* Left hero content */}
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-600 mb-3">
                EV CHARGING MADE EASY
              </p>
              <h1 className="text-4xl sm:text-5xl font-semibold leading-tight mb-4 text-slate-900">
                Charge smarter,{' '}
                <span className="text-emerald-600">drive farther</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 max-w-md mb-6">
                Find and book EV charging stations near you instantly. Access
                real‑time availability, smart payments, and a growing charging
                network across Nepal.
              </p>

              {/* Primary CTAs */}
              <div className="flex flex-wrap gap-4 mb-6">
                <Link
                  to="/app/find-stations"
                  className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-600 transition"
                >
                  Find stations
                </Link>
                <Link
                  to="/signup?role=OPERATOR"
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:border-emerald-500 hover:text-emerald-700 transition"
                >
                  Become an operator
                </Link>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-6 text-[11px] text-slate-500">
                <div>
                  <div className="font-semibold text-emerald-600 text-sm">
                    10,000+
                  </div>
                  <div>Stations</div>
                </div>
                <div>
                  <div className="font-semibold text-emerald-600 text-sm">
                    500,000+
                  </div>
                  <div>Users</div>
                </div>
                <div>
                  <div className="font-semibold text-emerald-600 text-sm">
                    24/7
                  </div>
                  <div>Secure payments</div>
                </div>
              </div>
            </div>

            {/* Right mock image/card */}
            <div className="relative">
              <div className="rounded-3xl bg-white border border-emerald-100 shadow-xl overflow-hidden">
                {/* Fake map */}
                <div className="aspect-video w-full relative bg-gradient-to-br from-emerald-50 via-sky-50 to-slate-100">
                  {/* Subtle grid */}
                  <div className="absolute inset-6 border border-white/70 rounded-2xl" />
                  <div className="absolute left-1/2 top-6 bottom-6 border-l border-white/70" />
                  <div className="absolute top-1/2 left-6 right-6 border-t border-white/70" />

                  {/* Pins */}
                  <div className="absolute left-[35%] top-[40%] -translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                      <div className="h-6 w-6 rounded-full bg-emerald-500 shadow-lg shadow-emerald-400/50 flex items-center justify-center text-[11px] text-white">
                        ⚡
                      </div>
                      <div className="absolute inset-0 rounded-full border border-emerald-500/40 animate-ping" />
                    </div>
                  </div>

                  <div className="absolute left-[65%] top-[30%] -translate-x-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 rounded-full bg-emerald-400 shadow shadow-emerald-300 flex items-center justify-center text-[9px] text-white">
                      ⚡
                    </div>
                  </div>

                  <div className="absolute left-[55%] top-[65%] -translate-x-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 rounded-full bg-emerald-400 shadow shadow-emerald-300 flex items-center justify-center text-[9px] text-white">
                      ⚡
                    </div>
                  </div>

                  {/* Bottom label */}
                  <div className="absolute left-4 bottom-4 rounded-full bg-white/90 px-3 py-1 text-[11px] text-slate-700 shadow-sm flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Kathmandu • 12 stations nearby
                  </div>
                </div>

                {/* Caption row */}
                <div className="p-4 flex justify-between text-xs text-slate-700 border-t border-slate-100">
                  <div>
                    <div className="font-medium text-emerald-600">Available now</div>
                    <div className="text-[11px] text-slate-500">3 ports free</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-slate-800">Nearby stations</div>
                    <div className="text-[11px] text-emerald-600">
                      All with fast charging
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-b border-slate-200 bg-white">
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
        <section id="owners" className="border-b border-slate-200 bg-gray-50">
          <div className="max-w-4xl mx-auto px-6 py-16 text-center">
            <h2 className="text-2xl font-semibold mb-2 text-slate-900">
              How BijuliYatra works
            </h2>
            <p className="text-sm text-slate-600 mb-10">
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
        <section id="pricing" className="border-b border-slate-200 bg-white">
          <div className="max-w-5xl mx-auto px-6 py-16 text-center">
            <h2 className="text-2xl font-semibold mb-2 text-slate-900">
              Simple, transparent pricing
            </h2>
            <p className="text-sm text-slate-600 mb-10">
              Choose the plan that fits your needs.
            </p>

            <div className="grid gap-6 md:grid-cols-2 items-stretch">
              {/* EV Owners card */}
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-left flex flex-col">
                <h3 className="text-sm font-semibold text-slate-900 mb-1">
                  EV Owners
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Perfect for individual EV drivers.
                </p>
                <p className="text-3xl font-semibold mb-1 text-slate-900">
                  Free
                </p>
                <p className="text-[11px] text-slate-500 mb-4">
                  No monthly fees.
                </p>
                <button className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium mb-4 self-start text-white hover:bg-emerald-600 transition">
                  Start charging
                </button>
                <ul className="mt-auto space-y-2 text-xs text-slate-700">
                  <li>• Find all charging stations</li>
                  <li>• Real‑time availability</li>
                  <li>• Book charging slots</li>
                  <li>• Digital payments</li>
                  <li>• Trip history</li>
                  <li>• Mobile app access (coming soon)</li>
                </ul>
              </div>

              {/* Station Operators card */}
              <div className="relative rounded-3xl border border-emerald-300 bg-gradient-to-br from-emerald-50 to-emerald-100/40 p-6 text-left flex flex-col shadow-lg">
                <div className="inline-block rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-700 mb-3">
                  MOST POPULAR
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">
                  Station Operators
                </h3>
                <p className="text-xs text-slate-600 mb-4">
                  For charging station owners and fleets.
                </p>
                <p className="text-3xl font-semibold mb-1 text-slate-900">
                  ₹2,999
                </p>
                <p className="text-[11px] text-slate-600 mb-4">per month</p>
                <button className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium mb-4 self-start text-white hover:bg-emerald-600 transition">
                  Start 30‑day trial
                </button>
                <ul className="mt-auto space-y-2 text-xs text-slate-700">
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
        <footer className="bg-gray-50">
          <div className="max-w-6xl mx-auto px-6 pt-10 pb-8 border-t border-slate-200 text-xs text-slate-500">
            <div className="grid gap-8 md:grid-cols-4 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">⚡</span>
                  </div>
                  <span className="font-semibold text-sm text-slate-900">
                    BijuliYatra
                  </span>
                </div>
                <p className="text-[11px]">
                  Nepal&apos;s growing EV charging network. Charge smarter,
                  drive farther.
                </p>
              </div>

              <div>
                <h4 className="mb-2 font-semibold text-slate-900 text-xs">
                  Product
                </h4>
                <ul className="space-y-1">
                  <li>Features</li>
                  <li>Pricing</li>
                  <li>For EV Owners</li>
                  <li>For Operators</li>
                </ul>
              </div>

              <div>
                <h4 className="mb-2 font-semibold text-slate-900 text-xs">
                  Company
                </h4>
                <ul className="space-y-1">
                  <li>About us</li>
                  <li>Blog</li>
                  <li>Press</li>
                  <li>Partners</li>
                </ul>
              </div>

              <div>
                <h4 className="mb-2 font-semibold text-slate-900 text-xs">
                  Contact
                </h4>
                <ul className="space-y-1">
                  <li>support@bijuliyatra.com</li>
                  <li>+977 980‑0000000</li>
                  <li>Kathmandu, Nepal</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>
                © {new Date().getFullYear()} BijuliYatra. All rights reserved.
              </span>
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
    <div className="rounded-3xl border border-slate-200 bg-white p-6">
      <div className="mb-3 h-9 w-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
        ⚡
      </div>
      <h3 className="text-sm font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-600">{body}</p>
    </div>
  );
}

function StepCard({ step, title, body }) {
  return (
    <div className="flex flex-col items-center md:items-center text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-xs text-emerald-600">
        STEP {step}
      </div>
      <h3 className="text-sm font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-600 max-w-[220px]">{body}</p>
    </div>
  );
}
