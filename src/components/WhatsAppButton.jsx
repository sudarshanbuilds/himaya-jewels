const WhatsAppIcon = () => (
  <svg viewBox="0 0 32 32" width="26" height="26" fill="white" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 0C7.164 0 0 7.164 0 16c0 2.82.736 5.47 2.02 7.78L0 32l8.44-2.21A15.93 15.93 0 0 0 16 32c8.836 0 16-7.164 16-16S24.836 0 16 0zm8.27 22.36c-.34.96-2 1.84-2.74 1.9-.7.06-1.36.32-4.6-1-3.86-1.6-6.36-5.54-6.56-5.8-.2-.26-1.64-2.18-1.64-4.16s1.04-2.96 1.42-3.36c.34-.36.74-.44 1-.44l.72.014c.26.006.62-.1.96.74.34.84 1.18 2.84 1.28 3.04.1.2.16.44.02.7-.14.26-.22.42-.44.66-.22.24-.46.52-.66.7-.22.2-.44.42-.2.82.26.4 1.12 1.86 2.4 3.02 1.64 1.46 3.02 1.92 3.44 2.16.42.24.66.2.9-.1.26-.32 1.08-1.26 1.36-1.68.28-.44.56-.36.94-.22.38.14 2.4 1.14 2.8 1.34.42.2.7.32.8.48.1.18.1.96-.24 1.92z"/>
  </svg>
)

export default function WhatsAppButton() {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210'
  const message = encodeURIComponent("Hi! I'm interested in your jewelry at Himaya Jewels.")
  const href = `https://wa.me/${whatsappNumber}?text=${message}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      id="whatsapp-float-btn"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-green-500 hover:bg-green-400 flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 animate-float"
      style={{ boxShadow: '0 4px 20px rgba(37,211,102,0.45)' }}
    >
      <WhatsAppIcon />
      {/* Ping ring */}
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-ping opacity-75" />
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
    </a>
  )
}
