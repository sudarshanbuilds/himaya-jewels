import { Link } from 'react-router-dom'
import { Gem, Mail, Phone, MapPin, Heart } from 'lucide-react'

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
)

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

export default function Footer() {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210'

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Golden top border */}
      <div className="h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center">
                <Gem size={16} className="text-white" />
              </div>
              <span className="font-display text-xl font-bold text-yellow-400">Himaya Jewels</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Premium artificial jewelry crafted with love. Bangles, earrings, and stunning combo sets for every occasion.
            </p>
            <div className="flex items-center gap-3">
              <a
                href={`https://instagram.com`}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-gray-800 hover:bg-yellow-500 flex items-center justify-center transition-colors group"
                aria-label="Instagram"
              >
                <span className="text-gray-400 group-hover:text-white"><InstagramIcon /></span>
              </a>
              <a
                href={`https://facebook.com`}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-gray-800 hover:bg-yellow-500 flex items-center justify-center transition-colors group"
                aria-label="Facebook"
              >
                <span className="text-gray-400 group-hover:text-white"><FacebookIcon /></span>
              </a>
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-gray-800 hover:bg-green-500 flex items-center justify-center transition-colors group"
                aria-label="WhatsApp"
              >
                <Phone size={16} className="text-gray-400 group-hover:text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-5 h-0.5 bg-yellow-500 inline-block" />
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {[
                { to: '/', label: 'Home' },
                { to: '/shop', label: 'Shop All' },
                { to: '/shop?category=Bangles', label: 'Bangles' },
                { to: '/shop?category=Earrings', label: 'Earrings' },
                { to: '/shop?category=Combos', label: 'Combo Sets' },
                { to: '/favorites', label: 'Favorites' },
                { to: '/cart', label: 'Cart' },
              ].map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-400 hover:text-yellow-400 transition-colors hover:translate-x-1 inline-block duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-5 h-0.5 bg-yellow-500 inline-block" />
              Policies
            </h3>
            <ul className="space-y-2.5">
              {[
                { to: '/about', label: 'About Us' },
                { to: '/contact', label: 'Contact Us' },
                { to: '/shipping', label: 'Shipping Policy' },
                { to: '/returns', label: 'Return Policy' },
                { to: '/privacy', label: 'Privacy Policy' },
                { to: '/terms', label: 'Terms & Conditions' },
              ].map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-400 hover:text-yellow-400 transition-colors hover:translate-x-1 inline-block duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-5 h-0.5 bg-yellow-500 inline-block" />
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <Phone size={15} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                <a href={`tel:+${whatsappNumber}`} className="text-sm text-gray-400 hover:text-yellow-400 transition-colors">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail size={15} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                <a href="mailto:hello@himayajewels.com" className="text-sm text-gray-400 hover:text-yellow-400 transition-colors">
                  hello@himayajewels.com
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={15} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-400">India</span>
              </li>
            </ul>
            <a
              href={`https://wa.me/${whatsappNumber}?text=Hi! I'm interested in your jewelry.`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 mt-4 bg-green-600 hover:bg-green-500 text-white text-sm font-medium px-4 py-2 rounded-full transition-all hover:shadow-lg"
            >
              <Phone size={14} />
              WhatsApp Us
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Himaya Jewels. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            Made with <Heart size={12} className="text-red-400 fill-red-400" /> for jewelry lovers
          </p>
        </div>
      </div>
    </footer>
  )
}
