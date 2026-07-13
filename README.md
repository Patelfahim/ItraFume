# ItraFume — Bespoke Perfume Marketplace (MERN)

A full-stack e-commerce platform for artisanal perfume oils, attars, and oud — built with
MongoDB, Express, React (Vite), and Node.js. Includes dual payment gateways (Razorpay + Stripe),
transactional email, multimedia (image/video) uploads on both products and reviews, an admin
dashboard, and a hardened security layer.

---

## Stack

- **Frontend:** React 18, Vite, React Router 6, Tailwind CSS, Axios, react-hot-toast
- **Backend:** Node.js, Express 4, MongoDB + Mongoose 8
- **Auth:** JWT (httpOnly cookies), bcrypt password hashing, account lockout on repeated failed logins
- **Payments:** Razorpay (India / UPI / cards / netbanking) + Stripe Checkout (international cards)
- **Email:** Nodemailer (SMTP — works with Gmail App Passwords, SendGrid, Mailgun, Brevo, etc.)
- **Uploads:** Multer (disk storage) — products support multiple images + videos; reviews support
  multi-image/video attachments
- **Security:** helmet, cors, express-rate-limit, express-mongo-sanitize, xss-clean, hpp,
  express-validator, httpOnly cookies, bcrypt, account lockout, webhook signature verification

---

## Project Structure

```
itrafume-ecommerce/
├── backend/
│   ├── config/db.js
│   ├── controllers/        # auth, product, review, order, payment controllers
│   ├── middleware/         # auth, upload (multer), validation, error handling
│   ├── models/             # User, Product, Review, Order (Mongoose schemas)
│   ├── routes/
│   ├── utils/               # email templates, razorpay/stripe clients, token helpers
│   ├── seed/seedData.js     # populates sample products using real media assets
│   ├── uploads/              # user-uploaded product/review/avatar media (gitignored)
│   ├── server.js
│   └── .env.example
└── frontend/
    ├── public/media/         # brand images & videos from your ItraFume shoot
    ├── src/
    │   ├── api/axios.js
    │   ├── context/          # AuthContext, CartContext
    │   ├── components/       # Navbar, Footer, ProductCard, MediaUploader, ReviewSection...
    │   ├── pages/             # Home, Shop, ProductDetail, Cart, Checkout, Account, Admin/*
    │   └── App.jsx
    └── vite.config.js
```

---

## Local Development

### 1. Prerequisites
- Node.js 18+
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or a free MongoDB Atlas cluster
- Razorpay test account → https://dashboard.razorpay.com/app/keys (test mode)
- Stripe test account → https://dashboard.stripe.com/test/apikeys
- An SMTP sender — easiest is a Gmail account with an **App Password** (not your normal password),
  or a free tier of SendGrid/Mailgun/Brevo

### 2. Backend setup

```bash
cd backend
cp .env.example .env
# edit .env and fill in MONGO_URI, JWT secrets, Razorpay/Stripe test keys, SMTP creds
npm install
npm run seed        # creates sample products (using your brand media) + an admin + demo customer
npm run dev          # starts on http://localhost:5000
```

The seed script prints out login credentials, e.g.:
```
Admin login:    admin@itrafume.com / ChangeMe@12345
Customer login: customer@itrafume.com / Customer@123
```
**Change the admin password immediately after first login in production.**

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev          # starts on http://localhost:5173, proxies /api to :5000
```

Visit `http://localhost:5173`.

### 4. Webhooks (optional but recommended for reliability)

Payment confirmation happens two ways:
- **Immediately** after checkout (client-side verification call for Razorpay, redirect for Stripe)
- **Via webhook**, as a reliable fallback in case the browser closes before step 1 completes

To test webhooks locally, use the Stripe CLI (`stripe listen --forward-to localhost:5000/api/payments/stripe/webhook`)
and Razorpay's webhook testing tool from the dashboard, pointing at your local tunnel (e.g. ngrok).
In production, set the webhook URLs in each dashboard to:
- Razorpay: `https://yourdomain.com/api/payments/razorpay/webhook` (event: `payment.captured`)
- Stripe: `https://yourdomain.com/api/payments/stripe/webhook` (event: `checkout.session.completed`)

Copy the webhook signing secrets into `RAZORPAY_WEBHOOK_SECRET` and `STRIPE_WEBHOOK_SECRET`.

---



### Uploaded media in production

Files uploaded via the admin panel (product photos/videos) and via customer reviews are stored on
disk under `backend/uploads/`. On most PaaS platforms (Render, Railway, Heroku) **local disk storage
is ephemeral** — files can be wiped on redeploy. For a production launch, swap the Multer disk storage
in `backend/middleware/upload.js` for an S3-compatible storage backend (AWS S3, Cloudflare R2,
DigitalOcean Spaces) using `multer-s3`. This wasn't wired in by default since it requires your own
cloud storage credentials, but the upload controllers are structured so this is a small, contained change.

---

## Security Features Implemented

- Passwords hashed with bcrypt (cost factor 12), never returned in API responses
- JWT stored in an `httpOnly`, `sameSite`, `secure` (prod) cookie — not accessible to JS, mitigating XSS token theft
- Account lockout after 5 failed login attempts (15 min cooldown)
- Rate limiting: stricter on auth routes, global limiter on all `/api` routes
- `express-mongo-sanitize` — strips NoSQL injection operators from input
- `xss-clean` — sanitizes user-submitted HTML/JS
- `hpp` — prevents HTTP parameter pollution
- `helmet` — sets secure HTTP headers
- Server-side price calculation for every order — client-submitted prices are never trusted
- Razorpay payment signature verified server-side (HMAC-SHA256) before marking an order paid
- Stripe webhook signature verified via `stripe.webhooks.constructEvent`
- File upload validation: MIME-type allowlist + per-type size caps (images 8MB / videos 50MB by default),
  enforced both client-side (fast feedback) and server-side (authoritative)
- Role-based route protection (`customer` vs `admin`)
- Password reset & email verification tokens are hashed before storage and time-limited

---

## Features Checklist

- [x] Responsive storefront (mobile/tablet/desktop) — Home, Shop with filters/search/sort/pagination, Product Detail, Cart, Checkout, Account
- [x] Product media gallery (multiple images + videos) with thumbnail switcher and lightbox
- [x] Admin product management with multi-image/video upload and variant (size/price/stock) editor
- [x] Customer reviews with star ratings, verified-purchase badges, and **photo/video upload**
- [x] Admin review moderation (approve/reject) + admin replies
- [x] Razorpay checkout (order creation, signature verification, webhook fallback)
- [x] Stripe Checkout (hosted session, webhook confirmation)
- [x] Transactional emails: welcome/verify, password reset, order confirmation, order status updates
- [x] JWT auth with email verification, password reset, account lockout
- [x] Admin dashboard: revenue/orders stats, order status management with tracking numbers, customer management
- [x] Cart persisted in localStorage; stock validated server-side at checkout



