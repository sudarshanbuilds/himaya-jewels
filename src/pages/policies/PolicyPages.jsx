function PolicyLayout({ title, subtitle, children }) {
  return (
    <main className="min-h-screen bg-white">
      <div className="bg-gradient-to-r from-amber-900 to-yellow-800 text-white py-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-3xl sm:text-4xl font-bold">{title}</h1>
          {subtitle && <p className="text-amber-200 mt-2 text-sm">{subtitle}</p>}
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 prose prose-sm prose-gray max-w-none">
        {children}
      </div>
    </main>
  )
}

const S = ({ children }) => <section className="mb-8">{children}</section>
const H = ({ children }) => <h2 className="font-display text-xl font-bold text-gray-800 mb-3 mt-6">{children}</h2>
const P = ({ children }) => <p className="text-gray-600 leading-relaxed mb-3 text-sm">{children}</p>
const Li = ({ children }) => <li className="text-gray-600 text-sm leading-relaxed">{children}</li>

export function AboutUs() {
  return (
    <PolicyLayout title="About Us" subtitle="Our story and mission">
      <S>
        <P>Welcome to <strong>Himaya Jewels</strong> — your destination for premium artificial jewelry that combines elegance, craftsmanship, and affordability. We believe every woman deserves to feel beautiful and adorned, without compromising on quality or spending a fortune.</P>
        <P>Founded with a passion for jewelry and a commitment to excellence, Himaya Jewels was born out of the desire to bring high-quality artificial jewelry to jewelry lovers across India. Our collection features carefully curated bangles, earrings, and stunning combo sets that are crafted with precision and care.</P>
      </S>
      <S>
        <H>Our Mission</H>
        <P>At Himaya Jewels, our mission is simple — to make every woman feel like royalty. We source and design jewelry pieces that reflect the rich cultural heritage of Indian craftsmanship while incorporating modern design sensibilities.</P>
      </S>
      <S>
        <H>What We Offer</H>
        <ul className="list-disc pl-5 space-y-1 mb-4">
          <Li>Premium quality artificial bangles in various sizes and designs</Li>
          <Li>Elegant earrings — from traditional jhumkas to modern hoops</Li>
          <Li>Complete combo sets perfect for weddings and festive occasions</Li>
          <Li>Affordable pricing without compromising on quality</Li>
          <Li>Curated designs that blend tradition with modern trends</Li>
        </ul>
      </S>
      <S>
        <H>Our Promise</H>
        <P>Every piece that leaves our store has been quality-checked to ensure it meets our high standards. We are committed to providing you with the best shopping experience — from browsing our collection to doorstep delivery.</P>
        <P>Thank you for choosing Himaya Jewels. We look forward to being a part of your special moments!</P>
      </S>
    </PolicyLayout>
  )
}

export function Contact() {
  return (
    <PolicyLayout title="Contact Us" subtitle="We'd love to hear from you">
      <S>
        <P>Have questions, feedback, or need assistance? Our team is here to help you!</P>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 my-6 space-y-4">
          {[
            { label: 'WhatsApp / Phone', value: '+91 95582 85403', href: 'tel:+919558285403' },
            { label: 'Email', value: 'himadreevarma4@gmail.com', href: 'mailto:himadreevarma4@gmail.com' },
            { label: 'Business Hours', value: 'Monday – Saturday, 9 AM – 7 PM IST' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide w-40">{item.label}</span>
              {item.href ? (
                <a href={item.href} className="text-yellow-700 font-semibold text-sm hover:underline">{item.value}</a>
              ) : (
                <span className="text-gray-700 text-sm font-medium">{item.value}</span>
              )}
            </div>
          ))}
        </div>
      </S>
      <S>
        <H>WhatsApp Support</H>
        <P>For fastest support, message us on WhatsApp. Our team typically responds within 1 hour during business hours. You can also reach us 24/7 for order-related queries through WhatsApp.</P>
        <a
          href="https://wa.me/919558285403?text=Hi! I need help with Himaya Jewels."
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 bg-green-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-green-500 transition-colors mt-2"
        >
          Chat on WhatsApp
        </a>
      </S>
      <S>
        <H>Order Inquiries</H>
        <P>For order tracking, modifications, or cancellations, please contact us with your Order ID. We will resolve your query as quickly as possible.</P>
      </S>
    </PolicyLayout>
  )
}

export function Shipping() {
  return (
    <PolicyLayout title="Shipping Policy" subtitle="Delivery information and timelines">
      <S>
        <H>Delivery Timelines</H>
        <ul className="list-disc pl-5 space-y-1 mb-4">
          <Li><strong>Standard Delivery:</strong> 5–7 business days</Li>
          <Li><strong>Express Delivery:</strong> 2–3 business days (where available)</Li>
          <Li>Orders are processed within 24 hours of placement</Li>
        </ul>
      </S>
      <S>
        <H>Shipping Charges</H>
        <ul className="list-disc pl-5 space-y-1 mb-4">
          <Li><strong>Free Shipping</strong> on all orders above ₹499</Li>
          <Li>Orders below ₹499: ₹49 flat shipping fee</Li>
          <Li>No hidden charges — what you see is what you pay</Li>
        </ul>
      </S>
      <S>
        <H>Delivery Locations</H>
        <P>We currently deliver across all major cities and towns in India. Remote areas may take an additional 2–3 days.</P>
      </S>
      <S>
        <H>Order Tracking</H>
        <P>Once your order is shipped, you will receive a tracking number via SMS/WhatsApp. You can use this to track your delivery status.</P>
      </S>
      <S>
        <H>Damaged or Lost Packages</H>
        <P>If your package arrives damaged or is lost in transit, please contact us immediately at himadreevarma4@gmail.com or WhatsApp. We will arrange a replacement or full refund at no extra cost.</P>
      </S>
    </PolicyLayout>
  )
}

export function Returns() {
  return (
    <PolicyLayout title="Return Policy" subtitle="Easy returns and exchanges">
      <S>
        <P>At Himaya Jewels, we want you to love every piece you buy. If you're not completely satisfied, we offer a hassle-free return policy.</P>
      </S>
      <S>
        <H>Return Window</H>
        <P>You can return or exchange products within <strong>7 days</strong> of delivery.</P>
      </S>
      <S>
        <H>Conditions for Returns</H>
        <ul className="list-disc pl-5 space-y-1 mb-4">
          <Li>Product must be unused and in original condition</Li>
          <Li>Original packaging must be intact</Li>
          <Li>Return request must be made within 7 days of delivery</Li>
          <Li>Products damaged due to misuse are not eligible for return</Li>
        </ul>
      </S>
      <S>
        <H>Non-Returnable Items</H>
        <ul className="list-disc pl-5 space-y-1 mb-4">
          <Li>Customized or personalized jewelry</Li>
          <Li>Items purchased during clearance sales</Li>
          <Li>Items without original tags or packaging</Li>
        </ul>
      </S>
      <S>
        <H>Refund Process</H>
        <P>Once we receive and inspect your return, we will initiate a refund within 3–5 business days. Refunds are processed to the original payment method or as store credit.</P>
      </S>
      <S>
        <H>How to Initiate a Return</H>
        <P>WhatsApp us at +91 95582 85403 with your Order ID and reason for return. We will guide you through the process.</P>
      </S>
    </PolicyLayout>
  )
}

export function Privacy() {
  return (
    <PolicyLayout title="Privacy Policy" subtitle="How we handle your personal information">
      <S>
        <P>Your privacy is important to us. This policy explains how Himaya Jewels collects, uses, and protects your personal information.</P>
      </S>
      <S>
        <H>Information We Collect</H>
        <ul className="list-disc pl-5 space-y-1 mb-4">
          <Li>Name and contact information (phone number)</Li>
          <Li>Delivery address for order fulfillment</Li>
          <Li>Browsing behavior on our website (anonymized)</Li>
        </ul>
      </S>
      <S>
        <H>How We Use Your Information</H>
        <ul className="list-disc pl-5 space-y-1 mb-4">
          <Li>To process and fulfill your orders</Li>
          <Li>To send order confirmations and delivery updates</Li>
          <Li>To improve our website and product offerings</Li>
          <Li>To respond to your queries and feedback</Li>
        </ul>
      </S>
      <S>
        <H>Data Sharing</H>
        <P>We do not sell, trade, or share your personal information with third parties, except for delivery partners who require it to fulfill your orders.</P>
      </S>
      <S>
        <H>Data Security</H>
        <P>We implement industry-standard security measures to protect your personal information from unauthorized access, disclosure, or misuse.</P>
      </S>
      <S>
        <H>Cookies</H>
        <P>Our website uses local storage to save your cart and favorites. No tracking cookies are used without your consent.</P>
      </S>
      <S>
        <H>Contact Us</H>
        <P>For privacy-related queries, contact us at himadreevarma4@gmail.com.</P>
      </S>
    </PolicyLayout>
  )
}

export function Terms() {
  return (
    <PolicyLayout title="Terms & Conditions" subtitle="Please read these terms carefully">
      <S>
        <P>By accessing or using the Himaya Jewels website, you agree to be bound by these Terms and Conditions.</P>
      </S>
      <S>
        <H>Use of Website</H>
        <ul className="list-disc pl-5 space-y-1 mb-4">
          <Li>You must be 18 years or older to place an order</Li>
          <Li>You agree to provide accurate information when placing orders</Li>
          <Li>You are responsible for maintaining the confidentiality of your account</Li>
        </ul>
      </S>
      <S>
        <H>Product Information</H>
        <P>We strive to display accurate product images and descriptions. However, actual colors may vary slightly due to screen settings. All jewelry sold is artificial/fashion jewelry and not made of precious metals or gemstones.</P>
      </S>
      <S>
        <H>Pricing</H>
        <P>All prices are listed in Indian Rupees (₹) and are inclusive of applicable taxes. Prices are subject to change without notice.</P>
      </S>
      <S>
        <H>Order Acceptance</H>
        <P>We reserve the right to refuse or cancel any order for any reason, including but not limited to product unavailability, errors in pricing, or suspected fraudulent activity.</P>
      </S>
      <S>
        <H>Intellectual Property</H>
        <P>All content on this website, including images, text, and design, is the property of Himaya Jewels and may not be reproduced without prior written permission.</P>
      </S>
      <S>
        <H>Limitation of Liability</H>
        <P>Himaya Jewels is not liable for any indirect, incidental, or consequential damages arising from the use of our products or website.</P>
      </S>
      <S>
        <H>Governing Law</H>
        <P>These terms are governed by the laws of India. Any disputes shall be resolved under the jurisdiction of courts in India.</P>
      </S>
    </PolicyLayout>
  )
}
