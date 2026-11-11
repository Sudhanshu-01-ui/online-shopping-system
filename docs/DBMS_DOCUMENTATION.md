# Online Shopping System — Relational Database Management System (DBMS) Project Documentation

## 1. Project Overview
This project implements a full-featured, enterprise-grade e-commerce application utilizing **Next.js 16**, **TypeScript**, **PostgreSQL**, and **Prisma ORM**. The data tier adheres strictly to relational database principles, third normal form (3NF), ACID transactions, primary/foreign key referential integrity constraints, and domain validation checks.

---

## 2. Entity-Relationship (ER) Model & Cardinalities

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

### Cardinality Summary
- **Customer to Addresses:** One-to-Many (`1:N`). A customer may save multiple delivery addresses (`Home`, `Work`, `Other`).
- **Category to Products:** One-to-Many (`1:N`). Each product belongs to exactly one category; a category contains multiple products.
- **Customer to Cart:** One-to-One (`1:1`). Each registered user has one persistent shopping cart.
- **Cart to Cart_Items:** One-to-Many (`1:N`). Composite relationship between cart and products.
- **Customer to Orders:** One-to-Many (`1:N`). A customer can place multiple historical orders.
- **Order to Order_Items:** One-to-Many (`1:N`). Captures itemized product quantities and captures purchase-time price.
- **Order to Payment:** One-to-One (`1:1`). Every order has an audit trail payment record.
- **Order to Delivery:** One-to-One (`1:1`). Every order has an associated delivery dispatch record.

---

## 3. Relational Schema & Table Specifications

### 1. `customers` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR (CUID) | `PRIMARY KEY` | Unique customer surrogate identifier |
| `email` | VARCHAR(255) | `UNIQUE, NOT NULL` | Login identifier |
| `password` | VARCHAR(255) | `NOT NULL` | Bcrypt one-way salt & hash |
| `first_name`| VARCHAR(100) | `NOT NULL` | Given name |
| `last_name` | VARCHAR(100) | `NOT NULL` | Family name |
| `phone` | VARCHAR(20) | `NULLABLE` | Contact telephone number |
| `role` | ENUM | `DEFAULT 'CUSTOMER'` | Access role (`CUSTOMER`, `ADMIN`) |
| `created_at`| TIMESTAMP | `DEFAULT now()` | Account creation timestamp |

### 2. `addresses` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR (CUID) | `PRIMARY KEY` | Address identifier |
| `customer_id` | VARCHAR | `FOREIGN KEY` | References `customers(id)` ON DELETE CASCADE |
| `label` | VARCHAR(50) | `DEFAULT 'Home'` | Friendly label |
| `full_name` | VARCHAR(150) | `NOT NULL` | Recipient name |
| `phone` | VARCHAR(20) | `NOT NULL` | Recipient phone |
| `address_line_1` | VARCHAR(255) | `NOT NULL` | Flat / House / Street |
| `address_line_2` | VARCHAR(255) | `NULLABLE` | Landmark / Locality |
| `city` | VARCHAR(100) | `NOT NULL` | City name |
| `state` | VARCHAR(100) | `NOT NULL` | State or Province |
| `pincode` | VARCHAR(10) | `NOT NULL` | 6-digit postal code |
| `is_default` | BOOLEAN | `DEFAULT FALSE` | Default flag |

### 3. `categories` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR (CUID) | `PRIMARY KEY` | Category identifier |
| `name` | VARCHAR(100) | `UNIQUE, NOT NULL` | Category label |
| `slug` | VARCHAR(100) | `UNIQUE, NOT NULL` | URL slug |
| `description` | TEXT | `NULLABLE` | Category description |

### 4. `products` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR (CUID) | `PRIMARY KEY` | Product surrogate key |
| `name` | VARCHAR(255) | `NOT NULL` | Item title |
| `slug` | VARCHAR(255) | `UNIQUE, NOT NULL` | Unique route slug |
| `description` | TEXT | `NOT NULL` | Detailed specs |
| `price` | DECIMAL(10,2)| `CHECK (price > 0)` | Base selling price (INR) |
| `compare_price` | DECIMAL(10,2)| `NULLABLE` | Original MRP / Compare price |
| `stock` | INTEGER | `CHECK (stock >= 0)` | Live inventory units count |
| `category_id` | VARCHAR | `FOREIGN KEY` | References `categories(id)` ON DELETE RESTRICT |
| `featured` | BOOLEAN | `DEFAULT FALSE` | Homepage spotlight |
| `is_active` | BOOLEAN | `DEFAULT TRUE` | Catalog visibility status |
| `rating` | DECIMAL(2,1)| `DEFAULT 0.0` | 5-star aggregate rating |

### 5. `carts` & `cart_items` Tables
- `carts`: `id` (PK), `customer_id` (FK to `customers.id`, UNIQUE)
- `cart_items`: `id` (PK), `cart_id` (FK), `product_id` (FK), `quantity` (`CHECK (quantity > 0)`), `UNIQUE(cart_id, product_id)`.

### 6. `orders` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR (CUID) | `PRIMARY KEY` | Order identifier |
| `order_number`| VARCHAR(50) | `UNIQUE, NOT NULL`| User-facing invoice reference |
| `customer_id` | VARCHAR | `FOREIGN KEY` | References `customers(id)` ON DELETE RESTRICT |
| `address_id` | VARCHAR | `FOREIGN KEY` | References `addresses(id)` ON DELETE RESTRICT |
| `status` | ENUM | `DEFAULT 'PENDING'`| Lifecycle state |
| `subtotal` | DECIMAL(10,2)| `NOT NULL` | Pre-tax sum of items |
| `tax` | DECIMAL(10,2)| `NOT NULL` | 18% GST calculation |
| `shipping` | DECIMAL(10,2)| `NOT NULL` | Shipping charge (₹0 if >= ₹500, else ₹50) |
| `total` | DECIMAL(10,2)| `NOT NULL` | Final billable amount |

### 7. `order_items` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR (CUID) | `PRIMARY KEY` | Item identifier |
| `order_id` | VARCHAR | `FOREIGN KEY` | References `orders(id)` ON DELETE CASCADE |
| `product_id` | VARCHAR | `FOREIGN KEY` | References `products(id)` ON DELETE RESTRICT |
| `quantity` | INTEGER | `CHECK (quantity > 0)`| Purchased units |
| `price` | DECIMAL(10,2)| `NOT NULL` | Frozen price at moment of purchase |
| `total` | DECIMAL(10,2)| `NOT NULL` | `quantity * price` |

### 8. `payments` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR (CUID) | `PRIMARY KEY` | Payment identifier |
| `order_id` | VARCHAR | `UNIQUE, FOREIGN KEY` | References `orders(id)` ON DELETE CASCADE |
| `method` | ENUM | `NOT NULL` | Method (`CREDIT_CARD`, `UPI`, `COD`, etc.) |
| `amount` | DECIMAL(10,2)| `NOT NULL` | Transaction total |
| `status` | ENUM | `DEFAULT 'PENDING'` | State (`PENDING`, `SUCCESS`, `FAILED`) |
| `transaction_id` | VARCHAR | `NULLABLE` | External reference ID |

### 9. `deliveries` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR (CUID) | `PRIMARY KEY` | Delivery identifier |
| `order_id` | VARCHAR | `UNIQUE, FOREIGN KEY` | References `orders(id)` ON DELETE CASCADE |
| `status` | ENUM | `DEFAULT 'PENDING'` | State (`PENDING`, `SHIPPED`, `DELIVERED`, etc.) |
| `tracking_number` | VARCHAR | `NULLABLE` | Unique courier tracking barcode |
| `carrier` | VARCHAR | `NULLABLE` | Courier agency |

---

## 4. Normalization Analysis

### First Normal Form (1NF)
1. Every attribute stores atomic values.
2. No repeating groups or comma-separated lists exist in transaction records.
3. Every table has a distinct primary key.

### Second Normal Form (2NF)
1. Meets 1NF.
2. In associative junction tables (`cart_items`, `order_items`), non-key attributes (`quantity`, `price`, `total`) are fully functionally dependent on the entire composite key.

### Third Normal Form (3NF)
1. Meets 2NF.
2. All non-key attributes are strictly non-transitively dependent on the primary key ($X \to Y$, and $Y$ is not dependent on $Z$ for a non-prime attribute $Z$).
3. Categories are segregated into a standalone entity rather than embedding category names and metadata redundantly into the products table.
4. Addresses are separated into a dedicated entity to decouple customer profile data from delivery coordinates.

---

## 5. SQL Demonstration Benchmarks

### Query 1: INNER JOIN — Catalog Products with Categories
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

### Query 2: Multi-Table JOIN — Detailed Customer Orders
```sql
SELECT 
  o.order_number,
  CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
  c.email,
  o.total AS order_total,
  o.status AS order_status,
  p.method AS payment_method,
  p.status AS payment_status,
  d.status AS delivery_status,
  d.tracking_number,
  o.created_at
FROM orders o
JOIN customers c ON o.customer_id = c.id
LEFT JOIN payments p ON p.order_id = o.id
LEFT JOIN deliveries d ON d.order_id = o.id
ORDER BY o.created_at DESC;
```

### Query 3: Aggregates — Revenue & Metrics
```sql
SELECT 
  COUNT(o.id) AS total_successful_orders,
  SUM(p.amount) AS total_settled_revenue,
  ROUND(AVG(p.amount), 2) AS average_order_value,
  MIN(p.amount) AS min_order_value,
  MAX(p.amount) AS max_order_value
FROM orders o
INNER JOIN payments p ON o.id = p.order_id
WHERE p.status = 'SUCCESS';
```

### Query 4: GROUP BY & HAVING — Top-Selling Products
```sql
SELECT 
  p.id,
  p.name AS product_name,
  SUM(oi.quantity) AS total_units_sold,
  SUM(oi.total) AS total_gross_revenue
FROM order_items oi
INNER JOIN products p ON oi.product_id = p.id
INNER JOIN orders o ON oi.order_id = o.id
WHERE o.status != 'CANCELLED'
GROUP BY p.id, p.name
HAVING SUM(oi.quantity) > 0
ORDER BY total_gross_revenue DESC
LIMIT 10;
```

### Query 5: GROUP BY — Sales by Category
```sql
SELECT 
  c.id,
  c.name AS category_name,
  COUNT(DISTINCT p.id) AS active_products_count,
  COALESCE(SUM(oi.quantity), 0) AS total_items_sold,
  COALESCE(SUM(oi.total), 0) AS category_revenue
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
LEFT JOIN order_items oi ON oi.product_id = p.id
LEFT JOIN orders o ON oi.order_id = o.id AND o.status != 'CANCELLED'
GROUP BY c.id, c.name
ORDER BY category_revenue DESC;
```

### Query 6: Subquery — High-Value Customers Above Average Spend
```sql
SELECT 
  c.id,
  c.first_name,
  c.last_name,
  c.email,
  customer_totals.total_spent
FROM customers c
INNER JOIN (
  SELECT customer_id, SUM(total) AS total_spent
  FROM orders
  WHERE status != 'CANCELLED'
  GROUP BY customer_id
) customer_totals ON c.id = customer_totals.customer_id
WHERE customer_totals.total_spent > (
  SELECT AVG(customer_sum)
  FROM (
    SELECT SUM(total) AS customer_sum
    FROM orders
    WHERE status != 'CANCELLED'
    GROUP BY customer_id
  ) AS avg_calc
)
ORDER BY customer_totals.total_spent DESC;
```

### Query 7: ACID Transaction Checkout Workflow
```sql
BEGIN TRANSACTION;

-- 1. Deduct Stock safely
UPDATE products 
SET stock = stock - 2 
WHERE id = 'prod_123' AND stock >= 2;

-- 2. Create Order
INSERT INTO orders (id, order_number, customer_id, address_id, status, subtotal, tax, shipping, total)
VALUES ('ord_456', 'ORD-2026-X1', 'cust_01', 'addr_01', 'PENDING', 2498.00, 449.64, 0.00, 2947.64);

-- 3. Insert Order Items (Freeze purchase price)
INSERT INTO order_items (id, order_id, product_id, quantity, price, total)
VALUES ('item_789', 'ord_456', 'prod_123', 2, 1249.00, 2498.00);

-- 4. Record Payment
INSERT INTO payments (id, order_id, method, amount, status)
VALUES ('pay_101', 'ord_456', 'UPI', 2947.64, 'PENDING');

-- 5. Initialize Delivery Record
INSERT INTO deliveries (id, order_id, status)
VALUES ('del_202', 'ord_456', 'PENDING');

-- 6. Clear Shopping Cart
DELETE FROM cart_items WHERE cart_id = 'cart_01';

COMMIT;
```

