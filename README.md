# Favourite Books — Online Bookstore (SWE30003 Assignment 3)

A web-based online bookstore implemented as a **two-tier application**:

- **Backend** (`/Backend`) — Node.js + Fastify REST API over a 4-layer design
  (Actors → Business Logic → Repositories → Persistence with JSON flat files).
- **Frontend** (`/Frontend`) — React + Vite single-page application that consumes the API.

## Implemented business operations (4)

1. **Login / Create Account** (customer & staff)
2. **Browse / Search / Sort the book catalogue**
3. **Add to Cart and Purchase** (cart → simulated payment → order → invoice/receipt → order history)
4. **Update Inventory** (staff) — plus a weekly sales report

## Platform

Developed and tested on macOS (Darwin), Node.js v24, with VS Code. Runs on any OS with Node 18+.

## How to run

Open two terminals from the project root.

**1. Backend API (port 8000)**
```bash
cd Backend
npm install
npm start          # node Server.js  ->  http://localhost:8000
```

**2. Frontend (port 5173)**
```bash
cd Frontend
npm install
npm run dev        # vite  ->  http://localhost:5173
```

Then open **http://localhost:5173**. The Vite dev server proxies all `/api/*`
requests to the backend on port 8000 (see `Frontend/vite.config.js`).

To produce a production build of the frontend: `cd Frontend && npm run build`.

## Demo accounts (seeded in `Backend/Persistence/accounts.json`)

| Role     | Email                   | Password     |
|----------|-------------------------|--------------|
| Customer | `john@gmail.com`        | `customer123`|
| Staff    | `admin@bookstore.com`   | `admin123`   |

New customer accounts can also be created from the Login page.

## Testing

With the backend running, an end-to-end API test of all four operations:
```bash
cd Backend && node testApi.js     # 23 checks, all four business operations
```
