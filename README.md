# TradeGrid Africa 🌍

A production-ready B2B trade platform MVP connecting manufacturers and distributors across Africa.

## 🧱 Tech Stack

| Layer      | Technology                                    |
|------------|-----------------------------------------------|
| Frontend   | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| Backend    | Node.js, Express.js, TypeScript               |
| Database   | PostgreSQL + Prisma ORM                       |
| Auth       | JWT (email + password)                        |

## 🗂️ Project Structure

```
Tradegrid-Africa/
├── backend/                 # Express API server
│   ├── src/
│   │   ├── index.ts         # App entry point
│   │   ├── middleware/auth.ts
│   │   ├── routes/          # auth, products, orders, reviews
│   │   └── controllers/     # business logic
│   ├── prisma/
│   │   ├── schema.prisma    # DB schema
│   │   └── seed.ts          # Demo seed data
│   └── package.json
└── frontend/                # Next.js app
    ├── app/
    │   ├── page.tsx          # Landing page
    │   ├── auth/             # Login & Register
    │   ├── marketplace/      # Product browsing
    │   ├── dashboard/        # Supplier dashboard
    │   └── orders/           # Order management
    ├── components/Navbar.tsx
    └── lib/                  # API client & auth helpers
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ running locally

### 1. Clone & Setup Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL connection string
npm install
npm run db:generate
npm run db:migrate
npm run db:seed    # Load demo data
npm run dev        # Starts on port 5000
```

### 2. Setup Frontend

```bash
cd frontend
cp .env.local.example .env.local  # or create with NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm install
npm run dev        # Starts on port 3000
```

### 3. Open in Browser

Visit [http://localhost:3000](http://localhost:3000)

## 🔑 Demo Accounts

| Role     | Email                        | Password    |
|----------|------------------------------|-------------|
| Supplier | supplier1@tradegrid.com      | password123 |
| Supplier | supplier2@tradegrid.com      | password123 |
| Buyer    | buyer1@tradegrid.com         | password123 |

## 🧩 Core Features

- **Authentication** — Register/login with role selection (Supplier or Buyer)
- **Marketplace** — Browse & search products by category, location, price
- **Supplier Dashboard** — Add products, view & manage incoming orders
- **Order System** — Place orders, accept/reject, track status
- **Escrow Simulation** — Buyer marks payment → Supplier marks delivery → Complete
- **Trust Layer** — Verified supplier badges, ratings & reviews

## 🧠 API Endpoints

| Method | Endpoint                    | Description            |
|--------|-----------------------------|------------------------|
| POST   | /api/auth/register          | Register a new user    |
| POST   | /api/auth/login             | Login                  |
| GET    | /api/products               | Browse products        |
| POST   | /api/products               | Create product         |
| POST   | /api/orders                 | Place an order         |
| GET    | /api/orders/mine            | My orders              |
| PATCH  | /api/orders/:id/status      | Accept/reject order    |
| PATCH  | /api/orders/:id/payment     | Mark payment sent      |
| PATCH  | /api/orders/:id/delivery    | Mark goods delivered   |
| POST   | /api/reviews                | Leave a review         |

## 📄 Environment Variables

### Backend (`backend/.env`)
```
DATABASE_URL="postgresql://user:password@localhost:5432/tradegrid"
JWT_SECRET="your-secret-key"
PORT=5000
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```