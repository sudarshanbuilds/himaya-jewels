# HIMAYA JEWELS 💎

> Premium Artificial Jewelry Ecommerce Website  
> Built with React + Vite + Tailwind CSS + Supabase

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env

# 3. Add your Supabase credentials to .env
#    VITE_SUPABASE_URL=https://your-project.supabase.co
#    VITE_SUPABASE_ANON_KEY=your-anon-key

# 4. Start development server
npm run dev

# App runs at: http://localhost:5173
```

---

## 📁 Folder Structure

```
himaya-jewels/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Navbar.jsx           # Sticky nav with search, cart, favorites
│   │   ├── Footer.jsx           # Links, contact, WhatsApp
│   │   ├── ProductCard.jsx      # Product card with cart/fav buttons
│   │   ├── WhatsAppButton.jsx   # Floating WhatsApp contact button
│   │   ├── HeroBanner.jsx       # Animated hero section
│   │   ├── CategoryShowcase.jsx # Category grid
│   │   ├── FilterPanel.jsx      # Shop filters (category, price, sort)
│   │   ├── LoadingSpinner.jsx   # Spinner & skeleton components
│   │   └── ProtectedRoute.jsx   # Admin auth guard
│   ├── context/
│   │   ├── CartContext.jsx      # Cart state (localStorage)
│   │   ├── FavoritesContext.jsx # Favorites (localStorage session)
│   │   └── AuthContext.jsx      # Admin auth (Supabase)
│   ├── data/
│   │   └── products.js          # Mock product data
│   ├── lib/
│   │   └── supabase.js          # Supabase client
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Shop.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── Favorites.jsx
│   │   ├── admin/
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Products.jsx
│   │   │   └── Orders.jsx
│   │   └── policies/
│   │       └── PolicyPages.jsx  # All 6 policy pages
│   ├── App.jsx                  # Routes
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles + Tailwind v4 theme
├── .env.example
├── vercel.json                  # Vercel SPA config
├── supabase_schema.sql          # Database schema
└── vite.config.js
```

---

## 🗄️ Supabase Setup Guide

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) → Sign up / Log in
2. Click **New Project** → Choose region: `South Asia (Mumbai)` for India
3. Set project name: `himaya-jewels`
4. Set a strong database password → Click **Create Project**

### Step 2: Run Schema
1. Go to **SQL Editor** in your Supabase dashboard
2. Paste the contents of `supabase_schema.sql`
3. Click **Run** — this creates all tables, policies, and sample data

### Step 3: Create Storage Buckets
1. Go to **Storage** → Click **New bucket**
2. Create: `product-images` (Public) 
3. Create: `banner-images` (Public)

### Step 4: Create Admin User
1. Go to **Authentication** → **Users** → **Invite user**
2. Enter your admin email → Send invite
3. Check email and set password
4. Use these credentials to log in at `/admin/login`

### Step 5: Get API Keys
1. Go to **Settings** → **API**
2. Copy `Project URL` and `anon public` key
3. Update your `.env` file:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_WHATSAPP_NUMBER=919876543210
```

---

## 🌐 Deployment to Vercel

### Method 1: Via Vercel Dashboard (Recommended)
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your GitHub repository
4. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL` → your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` → your anon key
   - `VITE_WHATSAPP_NUMBER` → your WhatsApp number (with country code, no +)
5. Click **Deploy** → Your site goes live!

### Method 2: Via Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## 🔐 Admin Usage Guide

| Route | Description |
|---|---|
| `/admin/login` | Admin login page |
| `/admin/dashboard` | Overview — stats & quick actions |
| `/admin/products` | Add, edit, delete products |
| `/admin/orders` | View & update order status |

### Admin Features
- **Add Product**: Click "Add Product" → fill name, price, stock, category, sizes, image URLs → Save
- **Edit Product**: Click ✏️ icon on any product row → update fields → Save
- **Delete Product**: Click 🗑️ icon → confirm deletion
- **Update Order Status**: Click the status dropdown on any order → select new status (pending → confirmed → shipped → delivered)

---

## 🛒 Customer Features

| Feature | Description |
|---|---|
| **Shop** | Browse all jewelry with filters (category, price, sort) |
| **Search** | Search by name or category |
| **Product Detail** | Full product view with size selector & image gallery |
| **Cart** | Add multiple items, update quantities, remove items |
| **Checkout** | Enter name, phone, address → Place order |
| **Favorites** | Save items to favorites (session-based, no login) |
| **WhatsApp** | Floating button for instant support |

---

## 📋 Environment Variables

| Variable | Description | Required |
|---|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `VITE_WHATSAPP_NUMBER` | WhatsApp number with country code (no +) | Optional |

---

## 🎨 Design System

| Token | Value | Usage |
|---|---|---|
| Gold | `#C9A227` | Primary CTA, prices, accents |
| White | `#FFFFFF` | Backgrounds |
| Blush | `#F8E8EE` | Section backgrounds |
| Charcoal | `#333333` | Body text |
| Display Font | Playfair Display | Headings, brand |
| Body Font | Inter | All body text |

---

## 🧪 Testing Checklist

### UI Tests
- [ ] Home page loads with hero, categories, products
- [ ] Navbar sticky on scroll
- [ ] Mobile menu opens/closes
- [ ] Search bar opens on mobile
- [ ] WhatsApp button visible on all pages

### Functional Tests
- [ ] Add product to cart → cart count updates
- [ ] Update quantity in cart → total recalculates
- [ ] Remove item from cart
- [ ] Mark product as favorite → heart fills
- [ ] Checkout form validation (empty fields, invalid phone)
- [ ] Order placed → success screen shows
- [ ] Shop filters by category
- [ ] Shop search by name
- [ ] Admin login (after Supabase setup)
- [ ] Admin add/edit/delete product
- [ ] Admin update order status

---

## 📊 Performance

- Lazy-loaded images with `loading="lazy"`
- Tailwind CSS (minimal CSS bundle)
- React code splitting via Vite
- localStorage for cart/favorites (instant access)
- Target: < 3s page load on 4G

---

## 📞 Support

WhatsApp: +91 98765 43210  
Email: hello@himayajewels.com
