# 🌶️ FoodieExpress - Production Food Ordering Web Application

A complete, production-ready full-stack Food Ordering Platform built with **React 18 (Vite) + TypeScript + Tailwind CSS + Node.js + Express + Prisma ORM + Socket.IO**. Tailored for Sri Lankan & International culinary experiences with default currency in **LKR (Sri Lankan Rupees)**.

---

## 🚀 1. Features & User Roles

### 👤 1. Customer Features
- **Authentication**: JWT access + refresh tokens, bcrypt hashing, profile editing, saved delivery addresses.
- **Home Page**: Hero section, quick search, interactive category pills, featured restaurants, and popular dishes thalis.
- **Restaurant Listing**: Real-time search, filters (Cuisine, 4.5+ Rating, Open Now), sorting (Rating, Delivery Fee, Name), and pagination.
- **Restaurant Detail**: Info, opening hours, delivery fee, menu grouped by category, and customer reviews with admin replies.
- **Food Item Customization Modal**: Variant selection (Portions/Sizes), add-ons/toppings selection, quantity adjust, and special instructions.
- **Cart System**: Persistent Zustand cart with **Single Restaurant Constraint Enforcement** (prompts user to clear cart when selecting items from another restaurant), automatic subtotal, tax, delivery fee, and discount calculations.
- **Coupons**: Live promo code validation (e.g. `CEYLON20`, `WELCOME10`, `FREEDEL`).
- **Checkout**: Saved address selection, Delivery vs Pickup toggle, Stripe Card Test Payment or Cash on Delivery (COD).
- **Live Order Tracking**: Real-time Socket.IO status timeline: `PLACED` ➔ `CONFIRMED` ➔ `PREPARING` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED` (or `CANCELLED`).
- **Order History & Reviews**: Order history timeline with rating and review submission after delivery.
- **Wishlist**: Favorites for restaurants and dishes.

### 🏪 2. Restaurant Admin Features
- **Metrics Dashboard**: Today's revenue, order counts, pending orders count, and recent live feed.
- **Menu Management**: Full CRUD for menu items with local Multer image uploads, price, variants, add-ons, and single-click **Sold Out / Availability Toggle**.
- **Live Order Management**: Real-time incoming order stream with **Web Audio API sound notifications (chimes)**, Accept/Reject buttons, and status progression controls.
- **Store Profile**: Name, cover image, logo, opening hours, delivery fee, minimum order, and store open/closed toggle.
- **Customer Reviews**: View customer ratings and post official restaurant responses.

### 🛡️ 3. Super Admin Features
- **Analytics Dashboard**: Interactive **Recharts** charts for revenue over time, order volume, user growth, and top restaurants.
- **User Management**: Search, filter, change user roles, and suspend/unblock accounts.
- **Restaurant Management**: Approve or suspend restaurant partners.
- **Global Categories & Coupons**: Full CRUD for platform categories and promo vouchers.
- **All Orders Audit & CSV Export**: Search all platform orders and export to CSV with 1-click.

---

## 🔑 2. Test Accounts

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@foodie.com` | `User@123` | Browse, order, cart, checkout, live tracking, reviews |
| **Restaurant Admin** | `admin.spicy@foodie.com` | `Admin@123` | Manage Colombo Kottu House & Royal Diner orders & menu |
| **Restaurant Admin** | `admin.ceylon@foodie.com` | `Admin@123` | Manage Ceylon Spice Bistro & Pizza Artisan orders & menu |
| **Super Admin** | `admin@foodie.com` | `Admin@123` | Platform analytics, user control, approvals, CSV exports |

*Note: The login screen contains one-click demo login buttons to instantly switch roles.*

---

## 🛠️ 3. Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, React Router v6, Zustand, Lucide Icons, React Hot Toast, Recharts.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, Socket.IO, Multer, Stripe SDK, Zod, bcryptjs, jsonwebtoken, json2csv, Swagger UI.
- **Database**: SQLite (local dev zero-config) or PostgreSQL (production).

---

## 📁 4. Architecture & Directory Structure

```
.
├── client/                     # React Vite Frontend Application
│   ├── src/
│   │   ├── api/                # Axios API modules with refresh token interceptors
│   │   ├── components/         # Reusable UI library (Button, Modal, Input, Badge, etc.)
│   │   ├── context/            # AuthContext, SocketContext, ThemeContext
│   │   ├── store/              # Zustand cart & favorites stores
│   │   ├── pages/              # Customer, Restaurant Admin & Super Admin Pages
│   │   └── App.tsx             # React Router configuration & route guards
├── server/                     # Node.js Express Backend API
│   ├── prisma/
│   │   ├── schema.prisma       # Prisma Database Schema
│   │   └── seed.ts             # Seed script with 6 restaurants & 40+ Sri Lankan dishes
│   ├── src/
│   │   ├── config/             # Environment & Swagger OpenAPI configuration
│   │   ├── controllers/        # RESTful API controllers
│   │   ├── middlewares/        # Auth JWT, Zod Validation, Multer, Rate Limiting
│   │   ├── routes/             # Express API v1 route handlers
│   │   ├── services/           # Socket.IO & Stripe services
│   │   ├── utils/              # JWT, Prisma instance, Response helpers
│   │   ├── tests/              # Vitest unit tests
│   │   ├── app.ts              # Express App setup
│   │   └── index.ts            # HTTP & Socket.IO server entry point
└── docker-compose.yml          # Docker Compose production setup
```

---

## ⚡ 5. Quick Setup & Local Running Instructions

### Step 1: Install Dependencies
```bash
# Server dependencies
cd server
npm install

# Client dependencies
cd ../client
npm install
```

### Step 2: Database Setup & Seed
```bash
cd server
npx prisma db push
npm run db:seed
```

### Step 3: Run Dev Servers
```bash
# Start Backend Server (runs on http://localhost:5000)
cd server
npm run dev

# In another terminal window, start Frontend Client (runs on http://localhost:5173)
cd client
npm run dev
```

Visit **`http://localhost:5173`** in your web browser.

---

## 📚 6. API Documentation & OpenAPI Swagger

OpenAPI / Swagger documentation is available at:
👉 **`http://localhost:5000/api/docs`**

---

## 🧪 7. Running Backend Unit Tests

```bash
cd server
npm test
```

---

## 🐳 8. Docker Deployment

```bash
docker-compose up --build
```
This builds and launches the Node.js server, Nginx client, and PostgreSQL database in isolated containers.
