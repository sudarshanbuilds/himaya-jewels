import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

export default function HeroBanner() {
  return (
    <section className="relative min-h-[88vh] flex items-center overflow-hidden bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900">
      {/* Background decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-yellow-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-amber-600/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-yellow-400/5 blur-3xl" />
        {/* Floating jewelry dots */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-yellow-400/40"
            style={{
              top: `${10 + (i * 7.5) % 80}%`,
              left: `${5 + (i * 8.3) % 90}%`,
              animationDelay: `${i * 0.3}s`,
              animation: `float ${3 + (i % 3)}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left content */}
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-yellow-500/15 border border-yellow-500/30 text-yellow-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6 animate-fadeInUp">
            <Sparkles size={14} />
            Premium Artificial Jewelry
          </div>

          <h1
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 animate-fadeInUp"
            style={{ animationDelay: '0.1s' }}
          >
            Where Every
            <span className="block text-gradient-gold">Piece Tells</span>
            a Story
          </h1>

          <p
            className="text-gray-300 text-lg leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0 animate-fadeInUp"
            style={{ animationDelay: '0.2s' }}
          >
            Discover our exquisite collection of bangles, earrings, and combo sets — crafted to make you shine at every occasion.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start animate-fadeInUp"
            style={{ animationDelay: '0.3s' }}
          >
            <Link to="/shop" id="hero-shop-btn" className="btn-gold text-center">
              Shop Collection
            </Link>
            <Link to="/shop?category=Combos" className="btn-outline-gold text-center" style={{ borderColor: 'rgba(201,162,39,0.6)', color: '#E8C547' }}>
              View Combos
            </Link>
          </div>

          {/* Stats */}
          <div
            className="mt-10 flex items-center gap-8 justify-center lg:justify-start animate-fadeInUp"
            style={{ animationDelay: '0.4s' }}
          >
            {[
              { value: '500+', label: 'Designs' },
              { value: '10K+', label: 'Happy Customers' },
              { value: '4.9★', label: 'Rating' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-yellow-400 font-bold text-xl font-display">{stat.value}</div>
                <div className="text-gray-400 text-xs mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — floating jewelry card */}
        <div className="hidden lg:flex items-center justify-center">
          <div className="relative">
            {/* Main image */}
            <div className="w-72 h-72 rounded-3xl overflow-hidden shadow-2xl border border-yellow-500/30 rotate-3 hover:rotate-0 transition-transform duration-500">
              <img
                src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80"
                alt="Himaya Jewels featured jewelry"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Floating cards */}
            <div className="absolute -top-6 -left-10 bg-white rounded-2xl shadow-xl p-3 animate-float" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=100&q=80" alt="earrings" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">Pearl Earrings</p>
                  <p className="text-xs text-yellow-600 font-bold">₹199</p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -right-8 bg-white rounded-2xl shadow-xl p-3 animate-float" style={{ animationDelay: '1s' }}>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=100&q=80" alt="bangles" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">Gold Bangles</p>
                  <p className="text-xs text-yellow-600 font-bold">₹349</p>
                </div>
              </div>
            </div>

            {/* Gold glow */}
            <div className="absolute inset-0 rounded-3xl bg-yellow-400/10 blur-2xl -z-10 scale-110" />
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="white" />
        </svg>
      </div>
    </section>
  )
}
