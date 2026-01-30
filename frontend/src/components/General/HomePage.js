import React from 'react';
import { Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 flex flex-col">
      {/* Top nav */}
            <header className="w-full border-b border-slate-200/70 bg-white/95 backdrop-blur-2xl shadow-sm/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-5">
          {/* Logo */}
         <Link to="/" className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
        <div className="flex flex-col">
          <span className="font-bold text-xl text-slate-900">BijuliYatra</span>
          <span className="text-xs text-emerald-600 font-medium tracking-wide">Nepal's EV Charging Network</span>
        </div>
      </Link>

          {/* Nav Links */}
          <nav className="hidden xl:flex items-center gap-12 text-lg text-slate-600">
            <a href="#features" className="relative group font-semibold py-2 px-3 hover:text-emerald-600 transition-all duration-300">
              Features
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 group-hover:w-full transition-all duration-300" />
            </a>
            <a href="#pricing" className="relative group font-semibold py-2 px-3 hover:text-emerald-600 transition-all duration-300">
              Pricing
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 group-hover:w-full transition-all duration-300" />
            </a>
            <a href="#how-it-works" className="relative group font-semibold py-2 px-3 hover:text-emerald-600 transition-all duration-300">
              How it works
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 group-hover:w-full transition-all duration-300" />
            </a>
          </nav>

          {/* CTAs */}
          <div className="flex items-center gap-4">
            <Link
              to="/signup/ev-owner"
              className="hidden lg:inline-flex items-center justify-center px-8 py-4 rounded-3xl border-2 border-emerald-500/70 text-lg font-bold text-emerald-600 hover:bg-emerald-500 hover:text-white hover:shadow-emerald-500/50 hover:border-emerald-500 hover:-translate-y-0.5 transition-all duration-300 shadow-md backdrop-blur-sm"
            >
              Sign Up Free
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 text-lg font-bold text-white rounded-3xl hover:shadow-2xl hover:shadow-emerald-500/50 hover:-translate-y-1 transition-all duration-300 shadow-xl relative overflow-hidden"
            >
              <span className="relative z-10">Login</span>
              <div className="absolute inset-0 bg-white/30 rounded-3xl scale-0 hover:scale-100 transition-transform origin-center duration-300" />
            </Link>
            {/* Mobile menu */}
            <button className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

     {/* Main scrollable content */}
<main className="flex-1">

  <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50/60 via-white to-slate-50/30 py-32 border-b border-slate-200/50">
    {/* Background orbs */}
    <div className="absolute inset-0">
      <div className="absolute top-32 left-10 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-32 right-20 w-72 h-72 bg-emerald-100/30 rounded-full blur-3xl" />
    </div>

    <div className="relative max-w-7xl mx-auto px-6 grid gap-16 lg:gap-24 lg:grid-cols-[1.3fr_1fr] items-center">
  
      <div>
        <span className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-xl rounded-3xl text-lg font-bold text-emerald-700 border border-emerald-200/50 shadow-xl mb-8">
          <Zap className="h-5 w-5 animate-pulse" />
          Nepal's #1 EV Network
        </span>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] mb-8 bg-gradient-to-r from-slate-900 via-gray-900 to-emerald-800 bg-clip-text">
          Charge <span className="text-emerald-600 block">Smarter, Drive Farther
        </span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-xl leading-relaxed">
          Instant booking • Live availability • Khalti, eSewa, Cards • Transparent 7% service fee • 10K+ stations across Nepal
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-6 mb-16">
          <Link
            to="/login"
            className="group inline-flex items-center justify-center px-12 py-6 bg-gradient-to-r from-emerald-500 to-emerald-600 text-2xl font-black text-white rounded-3xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 shadow-xl relative overflow-hidden"
          >
            <span>Find Stations Now</span>
            <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 rounded-3xl transition-transform origin-center duration-300" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-12 py-6 border-2 border-slate-300 text-2xl font-bold text-slate-900 rounded-3xl hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-lg"
          >
            List Your Station (93% Revenue)
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 text-center lg:text-left lg:grid-cols-3">
          <div>
            <div className="text-4xl lg:text-5xl font-black text-emerald-600 mb-2">10,000+</div>
            <div className="text-lg text-slate-500 font-semibold">Stations Live</div>
          </div>
          <div>
            <div className="text-4xl lg:text-5xl font-black text-emerald-600 mb-2">500,000+</div>
            <div className="text-lg text-slate-500 font-semibold">Happy Drivers</div>
          </div>
          <div>
            <div className="text-4xl lg:text-5xl font-black text-emerald-600 mb-2">24/7</div>
            <div className="text-lg text-slate-500 font-semibold">Secure Payments</div>
          </div>
        </div>
      </div>


      <div className="relative group cursor-pointer transform hover:scale-[1.03] transition-all duration-500 max-w-2xl mx-auto lg:ml-auto">
        <div className="rounded-4xl bg-white/95 backdrop-blur-3xl border border-emerald-100/70 shadow-2xl hover:shadow-emerald-500/40 overflow-hidden">
          {/* Map */}
          <div className="aspect-[10/7] relative bg-gradient-to-br from-emerald-50 via-sky-50/70 to-slate-100/50 p-8">
            {/* Grid */}
            <div className="absolute inset-8 border-4 border-white/80 rounded-4xl backdrop-blur-xl shadow-2xl" />
            <div className="absolute left-1/2 top-16 bottom-16 border-l-4 border-white/80" />
            <div className="absolute top-1/2 left-16 right-16 border-t-4 border-white/80" />

         
            <div className="absolute left-[32%] top-[35%] -translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-all duration-300 z-20">
              <div className="relative">
                <div className="h-16 w-16 rounded-4xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 shadow-2xl shadow-emerald-400/60 flex items-center justify-center text-3xl font-black text-white">
                  ⚡
                </div>
                <div className="absolute inset-0 rounded-4xl border-4 border-emerald-500/70 animate-ping [animation-duration:1.5s]" />
                <div className="absolute inset-2 rounded-3xl bg-emerald-400/50 animate-ping [animation-duration:2s] delay-150" />
              </div>
            </div>

            {/* Secondary Pins */}
            <div className="absolute left-[70%] top-[25%] -translate-x-1/2 -translate-y-1/2 animate-bounce [animation-delay:400ms]" style={{animationDelay: '400ms'}}>
              <div className="h-10 w-10 rounded-3xl bg-emerald-400 shadow-2xl shadow-emerald-300/60 flex items-center justify-center text-xl text-white font-bold">⚡</div>
            </div>
            <div className="absolute left-[60%] top-[70%] -translate-x-1/2 -translate-y-1/2 animate-bounce [animation-delay:900ms]" style={{animationDelay: '900ms'}}>
              <div className="h-10 w-10 rounded-3xl bg-emerald-400 shadow-2xl shadow-emerald-300/60 flex items-center justify-center text-xl text-white font-bold">⚡</div>
            </div>

            {/* Location Badge */}
            <div className="absolute left-8 bottom-8 bg-white/95 backdrop-blur-2xl px-6 py-4 text-lg font-bold text-slate-800 shadow-2xl rounded-3xl border border-slate-200/50 flex items-center gap-3 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-all duration-300">
              <div className="h-5 w-5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg" />
              <span>Kathmandu Valley</span>
              <span className="text-emerald-600 font-black text-xl">• 12 stations</span>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="p-8 border-t border-slate-100/50">
            <div className="flex justify-between items-end">
              <div>
                <div className="text-3xl font-black text-emerald-600 group-hover:text-emerald-700 mb-1">Live Now</div>
                <div className="text-2xl text-slate-500 font-semibold">3/8 ports free</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-900 mb-1">Fast Chargers</div>
                <div className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 font-bold text-lg rounded-2xl shadow-md">
                  50kW+ <Zap className="ml-2 h-5 w-5 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>



            
      {/* Features */}
      <section id="features" className="py-32 relative overflow-hidden bg-gradient-to-br from-white via-emerald-50/20 to-slate-50">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-40 left-20 w-80 h-80 bg-emerald-200/10 rounded-full blur-3xl" />
          <div className="absolute bottom-40 right-20 w-64 h-64 bg-emerald-100/20 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-28 max-w-4xl mx-auto">
            <span className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500/10 to-emerald-400/10 rounded-3xl text-xl font-bold text-emerald-700 border-2 border-emerald-200/50 shadow-2xl backdrop-blur-sm mb-8">
              <Zap className="h-6 w-6" />
              Core Features
            </span>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-slate-900 via-gray-800 to-emerald-900 bg-clip-text leading-tight mb-6">
              Built for EV Drivers
            </h2>
            <p className="text-2xl md:text-3xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Three powerful tools that make charging simple, fast, and reliable
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-10 lg:gap-12">
            {/* Real-time */}
            <div className="group relative bg-white/80 backdrop-blur-xl rounded-3xl p-12 border border-white/50 shadow-2xl hover:shadow-emerald-500/10 hover:shadow-3xl hover:-translate-y-8 transition-all duration-700 overflow-hidden hover:bg-white">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent -skew-x-3 -translate-x-12 group-hover:translate-x-0 transition-transform duration-700" />
              
              <div className="relative z-10">
                {/* Icon */}
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 via-emerald-200 to-emerald-300 rounded-3xl flex items-center justify-center mb-8 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 mx-auto">
                  <svg className="w-14 h-14 text-emerald-600 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                
                <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 text-center leading-tight">
                  Live Availability
                </h3>
                <p className="text-xl text-slate-600 leading-relaxed text-center mb-10">
                  Every port's real-time status. Green = ready. Never drive to a full station.
                </p>
                <div className="flex items-center justify-center gap-3 text-emerald-600 font-bold text-2xl">
                  <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-lg" />
                  <span>10K+ live ports</span>
                </div>
              </div>
            </div>

            {/* Booking */}
            <div className="group relative bg-white/80 backdrop-blur-xl rounded-3xl p-12 border border-white/50 shadow-2xl hover:shadow-emerald-500/10 hover:shadow-3xl hover:-translate-y-8 transition-all duration-700 overflow-hidden hover:bg-white md:col-span-1 md:col-start-2">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-75 rotate-2 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700" />
              
              <div className="relative z-10">
                {/* Icon */}
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 via-emerald-200 to-emerald-300 rounded-3xl flex items-center justify-center mb-8 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 mx-auto">
                  <svg className="w-14 h-14 text-emerald-600 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                
                <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 text-center leading-tight">
                  One-Tap Booking
                </h3>
                <p className="text-xl text-slate-600 leading-relaxed text-center mb-10">
                  Reserve your exact time + connector. Your spot is secured instantly.
                </p>
                <div className="flex items-center justify-center gap-3 text-emerald-600 font-bold text-2xl">
                  <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Guaranteed</span>
                </div>
              </div>
            </div>

            {/* Payments */}
            <div className="group relative bg-white/80 backdrop-blur-xl rounded-3xl p-12 border border-white/50 shadow-2xl hover:shadow-emerald-500/10 hover:shadow-3xl hover:-translate-y-8 transition-all duration-700 overflow-hidden hover:bg-white">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent -skew-x-6 -translate-x-20 group-hover:translate-x-0 transition-transform duration-700" />
              
              <div className="relative z-10">
                {/* Icon */}
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 via-emerald-200 to-emerald-300 rounded-3xl flex items-center justify-center mb-8 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 mx-auto">
                  <svg className="w-14 h-14 text-emerald-600 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                
                <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 text-center leading-tight">
                  3-Way Payments
                </h3>
                <p className="text-xl text-slate-600 leading-relaxed text-center mb-10">
                  Khalti, eSewa, Cards. Instant checkout. Transparent fee only.
                </p>
                <div className="flex items-center justify-center gap-3 text-emerald-600 font-bold text-2xl">
                  <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-xl font-black">3x Faster</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


          <section id="how-it-works" className="relative py-32 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50">
            {/* Background elements */}
            <div className="absolute inset-0">
              <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl" />
              <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl animate-pulse" />
              <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-white/50 rounded-full blur-xl" />
            </div>

            <div className="relative max-w-7xl mx-auto px-6">
              {/* Header */}
              <div className="text-center mb-24 max-w-4xl mx-auto">
                <span className="inline-block px-8 py-4 bg-gradient-to-r from-emerald-500/10 to-emerald-400/10 rounded-3xl text-lg font-bold text-emerald-700 border-2 border-emerald-200/50 backdrop-blur-sm mb-8 shadow-2xl">
                  🚀 3 Simple Steps
                </span>
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-slate-900 via-gray-800 to-slate-900 bg-clip-text mb-6 leading-none">
                  From empty to full
                </h2>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                  <div className="text-2xl md:text-3xl font-bold text-emerald-600 bg-emerald-100 px-8 py-4 rounded-2xl shadow-lg">
                    30 seconds to book
                  </div>
                  <div className="w-20 h-1 bg-gradient-to-r from-emerald-200 to-emerald-400 rounded-full" />
                  <div className="text-lg text-slate-600 font-medium">
                    Trusted by 500K+ drivers
                  </div>
                </div>
                <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                  Charge anywhere in Nepal with the most reliable EV network
                </p>
              </div>

              {/* Steps */}
              <div className="grid md:grid-cols-3 gap-8 items-stretch">
                {/* Step 1 */}
                <div className="group relative bg-white/70 backdrop-blur-xl rounded-3xl p-10 border border-white/50 shadow-2xl hover:shadow-3xl hover:-translate-y-6 transition-all duration-700 hover:bg-white overflow-hidden">
                  {/* Step number */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-3xl flex items-center justify-center text-2xl font-black shadow-2xl group-hover:scale-110 transition-transform">
                      01
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col">
                    <div className="flex items-center gap-4 mb-8 mt-16">
                      <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center shadow-xl group-hover:rotate-12 transition-transform">
                        <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">
                          Find Nearby
                        </h3>
                        <p className="text-slate-600 font-semibold text-lg">in seconds</p>
                      </div>
                    </div>

                    <p className="text-xl text-slate-600 leading-relaxed flex-1 mb-12">
                      Search interactive map with live filters for your connector type, speed, and price
                    </p>

                    <div className="flex items-center gap-3 text-emerald-600 font-bold text-lg">
                      <Zap className="h-6 w-6 animate-pulse" />
                      <span>10,000+ stations</span>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="group relative bg-white/70 backdrop-blur-xl rounded-3xl p-10 border border-white/50 shadow-2xl hover:shadow-3xl hover:-translate-y-6 transition-all duration-700 hover:bg-white overflow-hidden md:col-span-1">
                  {/* Step number */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-3xl flex items-center justify-center text-2xl font-black shadow-2xl group-hover:scale-110 transition-transform">
                      02
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col">
                    <div className="flex items-center gap-4 mb-8 mt-16">
                      <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center shadow-xl group-hover:rotate-12 transition-transform">
                        <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">
                          Book Slot
                        </h3>
                        <p className="text-slate-600 font-semibold text-lg">One tap</p>
                      </div>
                    </div>

                    <p className="text-xl text-slate-600 leading-relaxed flex-1 mb-12">
                      Reserve your exact time slot and connector type before you even leave home
                    </p>

                    <div className="flex items-center gap-3 text-emerald-600 font-bold text-lg">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Guaranteed spot</span>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="group relative bg-white/70 backdrop-blur-xl rounded-3xl p-10 border border-white/50 shadow-2xl hover:shadow-3xl hover:-translate-y-6 transition-all duration-700 hover:bg-white overflow-hidden">
                  {/* Step number */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-3xl flex items-center justify-center text-2xl font-black shadow-2xl group-hover:scale-110 transition-transform">
                      03
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col">
                    <div className="flex items-center gap-4 mb-8 mt-16">
                      <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center shadow-xl group-hover:rotate-12 transition-transform">
                        <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">
                          Charge & Pay
                        </h3>
                        <p className="text-slate-600 font-semibold text-lg">Effortless</p>
                      </div>
                    </div>

                    <p className="text-xl text-slate-600 leading-relaxed flex-1 mb-12">
                      Plug in, watch your battery fill, pay securely with Khalti, eSewa or cards
                    </p>

                    <div className="flex items-center gap-3 text-emerald-600 font-bold text-lg">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Secure & fast</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

                
          {/* Pricing */}
          <section id="pricing" className="border-b border-slate-200 bg-gradient-to-b from-white via-emerald-50/30 to-white py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,emerald-100_0%,transparent_50%)] opacity-50" />
            
            <div className="max-w-5xl mx-auto px-6 relative z-10">
              {/* Section Header */}
              <div className="text-center mb-20">
                <span className="inline-block rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-700 mb-6 border border-emerald-500/20">
                  Transparent Pricing
                </span>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 bg-gradient-to-r from-slate-900 via-gray-800 to-slate-900 bg-clip-text">
                  No subscriptions.
                </h2>
                <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-4">
                  EV Owners: Completely <span className="font-bold text-emerald-600">FREE</span>
                </p>
                <p className="text-lg text-slate-500 max-w-lg mx-auto">
                  Operators: List free, earn 93% per booking (we take 7% service)
                </p>
              </div>

              {/* Pricing Cards */}
              <div className="grid gap-8 lg:gap-12 md:grid-cols-2 items-stretch max-w-5xl mx-auto">
                {/* EV Owners */}
                <div className="group relative rounded-3xl border-2 border-slate-200/50 bg-white/80 backdrop-blur-sm p-10 flex flex-col shadow-2xl hover:shadow-3xl hover:-translate-y-4 transition-all duration-500 overflow-hidden">
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-100 rounded-3xl -rotate-12 opacity-60 group-hover:opacity-100 transition" />
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-3 w-12 bg-emerald-500 rounded-full" />
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-bold rounded-full">
                        DRIVERS
                      </span>
                    </div>
                    
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">
                      EV Owners
                    </h3>
                    <p className="text-lg text-slate-600 mb-8 flex-1">
                      Everyday EV drivers across Nepal
                    </p>
                    
                    <div className="mb-10">
                      <div className="text-6xl md:text-7xl lg:text-8xl font-black text-emerald-500 mb-4">
                        FREE
                      </div>
                      <p className="text-2xl text-slate-500 font-semibold">Forever</p>
                    </div>

                    <Link
                      to="/login"
                      className="rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-10 py-6 text-xl font-bold text-white shadow-2xl hover:shadow-3xl hover:from-emerald-600 hover:to-emerald-700 transform hover:-translate-y-1 transition-all duration-300 mb-10 flex-shrink-0"
                    >
                      Start Charging Now
                    </Link>

                    <ul className="space-y-4 text-lg text-slate-700 mt-auto">
                      <li className="flex items-start gap-4 p-3 rounded-xl bg-emerald-50/50 hover:bg-emerald-100 transition">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                        <span>Find all stations near you</span>
                      </li>
                      <li className="flex items-start gap-4 p-3 rounded-xl bg-emerald-50/50 hover:bg-emerald-100 transition">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                        <span>Real-time availability</span>
                      </li>
                      <li className="flex items-start gap-4 p-3 rounded-xl bg-emerald-50/50 hover:bg-emerald-100 transition">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                        <span>Khalti, eSewa, Cards</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Operators */}
                <div className="group relative rounded-3xl border-4 border-emerald-200/60 bg-gradient-to-br from-emerald-50/90 to-white/80 backdrop-blur-sm p-10 flex flex-col shadow-3xl hover:shadow-4xl hover:border-emerald-300 transition-all duration-500 overflow-hidden">
                  <div className="absolute top-6 -right-6 w-32 h-32 bg-gradient-to-r from-emerald-200/60 to-transparent rounded-3xl group-hover:scale-110 transition-transform" />
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 rounded-2xl text-lg font-bold text-emerald-700 border-2 border-emerald-200/50 shadow-lg mb-8 backdrop-blur-sm">
                    <Zap className="h-5 w-5" />
                    MOST POPULAR
                  </div>
                  
                  <div className="relative z-10 flex flex-col h-full">
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">
                      Station Owners
                    </h3>
                    <p className="text-lg text-slate-600 mb-8 flex-1">
                      Earn revenue from your charging stations
                    </p>
                    
                    <div className="mb-10">
                      <div className="text-6xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent mb-4">
                        List Free
                      </div>
                      <p className="text-2xl text-emerald-600 font-bold">Keep 93% per booking</p>
                    </div>

                    <Link
                      to="/login"
                      className="rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-10 py-6 text-xl font-bold text-white shadow-2xl hover:shadow-3xl hover:from-emerald-600 hover:to-emerald-700 transform hover:-translate-y-1 transition-all duration-300 mb-10 flex-shrink-0"
                    >
                      List Your Stations
                    </Link>

                    <ul className="space-y-4 text-lg text-slate-700 mt-auto">
                      <li className="flex items-start gap-4 p-3 rounded-xl bg-white/60 hover:bg-white shadow-sm transition-all">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                        <span>Unlimited station listings</span>
                      </li>
                      <li className="flex items-start gap-4 p-3 rounded-xl bg-white/60 hover:bg-white shadow-sm transition-all">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                        <span>Real-time analytics dashboard</span>
                      </li>
                      <li className="flex items-start gap-4 p-3 rounded-xl bg-white/60 hover:bg-white shadow-sm transition-all">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                        <span>Automatic payouts</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

        {/* Footer */}
        <footer className="bg-slate-900 text-slate-200">
          <div className="max-w-6xl mx-auto px-6 pt-16 pb-12">
            <div className="grid gap-12 md:grid-cols-4 mb-12">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Zap className="h-7 w-7 text-white" />
                  </div>
                  <span className="font-bold text-xl text-white">
                    BijuliYatra
                  </span>
                </div>
                <p className="text-base leading-relaxed">
                  Nepal's growing EV charging network. Charge smarter,
                  drive farther.
                </p>
              </div>

              <div>
                <h4 className="mb-4 font-bold text-lg text-white">
                  Product
                </h4>
                <ul className="space-y-2 text-base">
                  <li><a href="#features" className="hover:text-emerald-400 transition">Features</a></li>
                  <li><a href="#pricing" className="hover:text-emerald-400 transition">Pricing</a></li>
                </ul>
              </div>

              <div>
                <h4 className="mb-4 font-bold text-lg text-white">
                  Company
                </h4>
                <ul className="space-y-2 text-base">
                  <li><a href="#" className="hover:text-emerald-400 transition">About us</a></li>
                  <li><a href="#" className="hover:text-emerald-400 transition">Blog</a></li>
                  <li><a href="#" className="hover:text-emerald-400 transition">Press</a></li>
                  <li><a href="#" className="hover:text-emerald-400 transition">Partners</a></li>
                </ul>
              </div>

              <div>
                <h4 className="mb-4 font-bold text-lg text-white">
                  Contact
                </h4>
                <ul className="space-y-2 text-base">
                  <li>support@bijuliyatra.com</li>
                  <li>+977 980-0000000</li>
                  <li>Kathmandu, Nepal</li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-sm md:text-base">
              <span>
                © {new Date().getFullYear()} BijuliYatra. All rights reserved.
              </span>
              <div className="flex gap-6">
                <a href="#" className="hover:text-emerald-400 transition">Privacy</a>
                <a href="#" className="hover:text-emerald-400 transition">Terms</a>
                <a href="#" className="hover:text-emerald-400 transition">Cookies</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

/* Small sub-components for clarity */

function FeatureCard({ title, body }) {
  return (
    <div className="group rounded-3xl border border-slate-200 bg-white p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
      <div className="mb-6 h-16 w-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
        <Zap className="h-8 w-8" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-4 leading-tight">{title}</h3>
      <p className="text-base text-slate-600 leading-relaxed">{body}</p>
    </div>
  );
}

function StepCard({ step, title, body }) {
  return (
    <div className="flex flex-col items-center md:items-start text-center md:text-left">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50 text-lg font-bold text-emerald-600 shadow-lg">
        STEP {step}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-base text-slate-600 max-w-md leading-relaxed">{body}</p>
    </div>
  );
}
