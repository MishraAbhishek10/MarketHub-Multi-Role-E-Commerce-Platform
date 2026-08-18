# ShopSphere — Real-World Full Stack E-Commerce Portfolio Project

This version is intentionally structured as a small real-world platform instead of one buyer-only page.

## Three separate interfaces

### Buyer
- Product discovery
- Search and category filters
- Cart
- Checkout
- Order history

### Seller
- Seller dashboard
- Add products
- Edit/delete own products
- Upload product images
- Inventory/stock
- Seller order visibility

### Admin
- Platform statistics
- User management
- Seller/buyer counts
- Product moderation
- Order overview
- Admin-only destructive operations

## Authentication flow

```text
Landing
   |
   +--> Buyer Login --------> Buyer Shop
   |
   +--> Seller Login -------> Seller Dashboard
   |
   +--> Admin Login --------> Admin Console
```

The backend is the authority for roles. The frontend only controls navigation/UI; every protected API route checks JWT + role.

## Architecture

```text
                    React + Vite
                         |
                    Axios / REST
                         |
                Node.js + Express
                  /       |       \
               MySQL    Redis    Uploads
                 |
          users/products/orders
```

## Start

```powershell
docker compose up -d mysql redis

cd backend
npm install
Copy-Item .env.example .env
npm run dev
```

New terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Demo accounts

Password: `Password@123`

- Admin: admin@example.com
- Seller: seller@example.com
- Buyer: buyer@example.com

## Important production upgrades

The project now includes the core portfolio architecture, but a production deployment should additionally use:

- HttpOnly secure cookies / refresh token rotation
- Real payment gateway such as Razorpay/Stripe
- S3/Cloudinary for production image storage
- Rate limiting
- Helmet and stronger CORS/CSP
- Input validation with Zod/Joi
- Automated unit/integration tests
- GitHub Actions CI/CD
- HTTPS
- Database migrations
- Observability/logging
- Email notifications
