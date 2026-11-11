# ShopEase — Professional Online Shopping System
### College DBMS Academic Full-Stack Project

ShopEase is a full-featured, production-quality e-commerce platform built with **Next.js 16**, **TypeScript**, **Tailwind CSS**, **PostgreSQL**, and **Prisma ORM**. It is architected specifically to demonstrate real-world relational database management system (DBMS) principles, ACID transaction workflows, third normal form (3NF) normalization, referential integrity, and secure session authentication.

---

## 1. System Architecture & Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript | Server and Client components, responsive UI |
| **Styling** | Tailwind CSS | Clean, minimal, professional design system |
| **Icons** | Lucide React | Modern iconography |
| **Database** | PostgreSQL | Relational storage, foreign keys, triggers, constraints |
| **ORM** | Prisma ORM 6 | Schema migrations, type-safe queries, connection pooling |
| **Authentication** | `iron-session`, `bcryptjs` (salt rounds: 12) | Encrypted HTTP-only cookies, role-based access control (RBAC) |
| **Validation** | Zod | Server-side and client-side runtime validation schemas |
| **Currency** | INR (₹) | Indian Rupee formatting with GST calculation |

---

## 2. Relational Database Design (DBMS)

The database schema is normalized to **Third Normal Form (3NF)** and implements 10 relational entities:

```
+----------------+          1 : N          +-----------------+
|   CUSTOMERS    |------------------------>|    ADDRESSES    |
+----------------+                         +-----------------+
        |                                           |
        | 1 : 1                                     | 1 : N
        v                                           v
+----------------+          1 : N          +-----------------+          1 : 1          +-----------------+
|     CARTS      |<------------------------|     ORDERS      |------------------------>|    PAYMENTS     |
+----------------+                         +-----------------+                         +-----------------+
        | 1 : N                                     | 1 : N                             | 1 : 1
        v                                           v                                   v
+----------------+          N : 1          +-----------------+                         +-----------------+
|   CART_ITEMS   |------------------------>|   ORDER_ITEMS   |                         |   DELIVERIES    |
+----------------+                         +-----------------+                         +-----------------+
        |                                           |
        | N : 1                                     | N : 1
        +-------------------+   +-------------------+
                            |   |
                            v   v
                     +-----------------+          N : 1          +-----------------+
                     |    PRODUCTS     |------------------------>|   CATEGORIES    |
                     +-----------------+                         +-----------------+
```

### Table Definitions & Key Relationships
1. **`customers`**: Holds user credentials, hashed passwords, contact details, and role (`CUSTOMER` vs `ADMIN`).
2. **`addresses`**: 1-to-N customer delivery locations with default flag and cascading deletion on customer removal.
3. **`categories`**: 1-to-N with products. Deletion is restricted if products are assigned.
4. **`products`**: Inventory records with check constraints (`price > 0`, `stock >= 0`), ratings, and review counts.
5. **`carts` & `cart_items`**: Persistent customer carts with composite uniqueness (`cart_id, product_id`).
6. **`orders`**: Transaction root containing order numbers, subtotal, 18% GST tax, shipping, and lifecycle status.
7. **`order_items`**: Preserves the purchase-time product unit price independently of subsequent product price modifications.
8. **`payments`**: 1-to-1 audit trail tracking payment methods (`UPI`, `CREDIT_CARD`, `DEBIT_CARD`, `NET_BANKING`, `COD`) and states (`PENDING`, `SUCCESS`, `FAILED`).
9. **`deliveries`**: 1-to-1 fulfillment tracking recording carriers, tracking numbers, dispatch dates, and delivery confirmations.

### ACID Transaction Order Processing
Orders are processed inside atomic Prisma transactions:
1. Validates that all items in the customer's cart have sufficient stock in real time.
2. Re-calculates subtotal and taxes strictly from server-side database records.
3. Decrements product inventory safely (`stock - quantity`).
4. Creates the `Order` and itemized `OrderItems`.
5. Creates the initial `Payment` record and initializes the `Delivery` dispatch record.
6. Empties the customer's shopping cart.
7. Automatically rolls back all changes if any step fails or inventory is insufficient.
8. Cancelling an order automatically restores inventory stock to products.

---

## 3. Demo Credentials

The database seed script populates the following verified accounts:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Administrator** | `admin@shopease.com` | `admin123` | Full access to Admin Dashboard, inventory, orders, customer records, payments, and shipments |
| **Customer 1** | `rahul.sharma@example.com` | `password123` | Shopping, cart, checkout, profile, addresses, order history |
| **Customer 2** | `aarav.sharma@email.com` | `password123` | Pre-seeded with existing orders and tracking history |

---

## 4. Setup & Installation Instructions

### Prerequisites
- Node.js 18.18+ or 20+
- PostgreSQL database instance (local PostgreSQL, Supabase, Neon, or Docker)

### Step 1: Clone and Install Dependencies
```bash
cd Shopping_site
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update the `DATABASE_URL` in `.env`:
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/shopping_db?schema=public"
SESSION_SECRET="your-secure-32-character-session-secret-here"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 3: Run Database Migrations & Seed
```bash
# Push Prisma schema to PostgreSQL
npx prisma db push

# Run the comprehensive database seed script (10 customers, 6 categories, 28 products, sample carts, 12 orders)
npm run db:seed
```

### Step 4: Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### Step 5: Production Build (Verified)
```bash
npm run build
npm start
```

---

## 5. Application Features & Demonstration Tour

### Customer Portal
- **Home Page (`/`)**: Minimal hero banner, featured category cards, trending items, and new arrivals.
- **Product Catalog (`/products`)**: Responsive product grid with search by name/description, category filter, price range slider, sort by price/newest, and real-time stock availability badges.
- **Product Details (`/products/[slug]`)**: Image gallery, pricing, stock counter, interactive quantity selector, and related products carousel.
- **Cart (`/cart`)**: Live quantity adjustment, stock limit guardrails, instant subtotal & GST tax calculations, and empty states.
- **Checkout (`/checkout`)**: Multi-step checkout with address selection/creation, order summary, simulated payment options, and ACID transaction order placement.
- **Account Dashboard (`/account`)**: Profile editor, saved delivery address management (`/account/addresses`), order history (`/account/orders`), and order delivery tracking (`/account/orders/[id]`).

### Protected Admin Portal (`/admin`)
- **Dashboard Overview (`/admin`)**: Real-time database metrics: Total Customers, Catalog Products, Total Orders, Settled Revenue, order status distribution, recent orders table, and low-stock alerts.
- **Product Management (`/admin/products`)**: Inventory table, search, category filter, stock level badges, Add Product (`/admin/products/new`), Edit Product (`/admin/products/[id]`), and safe deletion guards.
- **Category Management (`/admin/categories`)**: Create, inline edit, and delete categories with live product count badges.
- **Order Management (`/admin/orders`)**: View all orders, filter by status, inspect itemized line items, update lifecycle status (`PENDING` → `DELIVERED`), or `CANCELLED` with automatic stock restoration.
- **Payment Audits (`/admin/payments`)**: Filter payments by status (`SUCCESS`, `PENDING`, `FAILED`) and update payment settlement status.
- **Delivery Dispatches (`/admin/deliveries`)**: Assign tracking numbers, assign carriers (`BlueDart`, `Delhivery`, `DTDC`), update shipment status, and record delivery timestamps.

### Interactive DBMS Documentation (`/database`)
An in-app documentation portal is available directly at [http://localhost:3000/database](http://localhost:3000/database) displaying:
- Mermaid ER diagrams and cardinality mappings.
- Detailed table specifications with data types, nullability, primary keys, and foreign key actions.
- Normalization breakdown (1NF, 2NF, 3NF).
- Production SQL demonstration benchmarks covering INNER JOINs, multi-table joins, aggregates, GROUP BY, subqueries, and transactions.

---

## 6. Sample SQL Queries for DBMS Viva & Demonstration

### Query A: All Products with Categories (INNER JOIN)
```sql
SELECT 
  p.id AS product_id,
  p.name AS product_name,
  c.name AS category_name,
  p.price,
  p.stock
FROM products p
INNER JOIN categories c ON p.category_id = c.id
WHERE p.is_active = TRUE
ORDER BY c.name ASC, p.price DESC;
```

### Query B: Customer Order History (Multi-Table JOIN)
```sql
SELECT 
  o.order_number,
  CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
  o.total,
  o.status AS order_status,
  p.method AS payment_method,
  p.status AS payment_status,
  d.tracking_number
FROM orders o
JOIN customers c ON o.customer_id = c.id
LEFT JOIN payments p ON p.order_id = o.id
LEFT JOIN deliveries d ON d.order_id = o.id
ORDER BY o.created_at DESC;
```

### Query C: Total Revenue from Successful Payments (Aggregate)
```sql
SELECT 
  COUNT(o.id) AS successful_orders,
  SUM(p.amount) AS total_settled_revenue,
  ROUND(AVG(p.amount), 2) AS average_order_value
FROM orders o
INNER JOIN payments p ON o.id = p.order_id
WHERE p.status = 'SUCCESS';
```

### Query D: Top-Selling Products by Revenue (GROUP BY & HAVING)
```sql
SELECT 
  p.name AS product_name,
  SUM(oi.quantity) AS total_units_sold,
  SUM(oi.total) AS total_revenue
FROM order_items oi
INNER JOIN products p ON oi.product_id = p.id
INNER JOIN orders o ON oi.order_id = o.id
WHERE o.status != 'CANCELLED'
GROUP BY p.name
HAVING SUM(oi.quantity) > 0
ORDER BY total_revenue DESC
LIMIT 5;
```

### Query E: Sales Breakdown by Category (GROUP BY)
```sql
SELECT 
  c.name AS category_name,
  COUNT(DISTINCT p.id) AS product_count,
  COALESCE(SUM(oi.quantity), 0) AS units_sold,
  COALESCE(SUM(oi.total), 0) AS category_revenue
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
LEFT JOIN order_items oi ON oi.product_id = p.id
LEFT JOIN orders o ON oi.order_id = o.id AND o.status != 'CANCELLED'
GROUP BY c.name
ORDER BY category_revenue DESC;
```
