import { Database, Table, Key, Link2, GitBranch, Terminal, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function DatabaseDocsPage() {
  const tables = [
    {
      name: "customers",
      desc: "Stores user credentials, contact information, and role-based permissions (CUSTOMER vs ADMIN).",
      pk: "id (CUID / VARCHAR)",
      fk: "None",
      indexes: "email (UNIQUE, B-Tree)",
      columns: [
        { name: "id", type: "VARCHAR (CUID)", constraints: "PRIMARY KEY" },
        { name: "email", type: "VARCHAR(255)", constraints: "UNIQUE, NOT NULL" },
        { name: "password", type: "VARCHAR(255)", constraints: "NOT NULL (Bcrypt Hash)" },
        { name: "first_name", type: "VARCHAR(100)", constraints: "NOT NULL" },
        { name: "last_name", type: "VARCHAR(100)", constraints: "NOT NULL" },
        { name: "phone", type: "VARCHAR(20)", constraints: "NULLABLE" },
        { name: "role", type: "ENUM ('CUSTOMER', 'ADMIN')", constraints: "DEFAULT 'CUSTOMER'" },
        { name: "created_at", type: "TIMESTAMP", constraints: "DEFAULT CURRENT_TIMESTAMP" },
      ],
    },
    {
      name: "addresses",
      desc: "Normalized delivery addresses supporting 1-to-N relationship with customers.",
      pk: "id (CUID / VARCHAR)",
      fk: "customer_id → customers(id) ON DELETE CASCADE",
      indexes: "customer_id",
      columns: [
        { name: "id", type: "VARCHAR (CUID)", constraints: "PRIMARY KEY" },
        { name: "customer_id", type: "VARCHAR", constraints: "FOREIGN KEY, NOT NULL" },
        { name: "label", type: "VARCHAR(50)", constraints: "DEFAULT 'Home'" },
        { name: "full_name", type: "VARCHAR(150)", constraints: "NOT NULL" },
        { name: "phone", type: "VARCHAR(20)", constraints: "NOT NULL" },
        { name: "address_line_1", type: "VARCHAR(255)", constraints: "NOT NULL" },
        { name: "address_line_2", type: "VARCHAR(255)", constraints: "NULLABLE" },
        { name: "city", type: "VARCHAR(100)", constraints: "NOT NULL" },
        { name: "state", type: "VARCHAR(100)", constraints: "NOT NULL" },
        { name: "pincode", type: "VARCHAR(10)", constraints: "NOT NULL (6-digit format)" },
        { name: "is_default", type: "BOOLEAN", constraints: "DEFAULT FALSE" },
      ],
    },
    {
      name: "categories",
      desc: "Hierarchical product categorization with unique slugs for SEO routing.",
      pk: "id (CUID / VARCHAR)",
      fk: "None",
      indexes: "name (UNIQUE), slug (UNIQUE)",
      columns: [
        { name: "id", type: "VARCHAR (CUID)", constraints: "PRIMARY KEY" },
        { name: "name", type: "VARCHAR(100)", constraints: "UNIQUE, NOT NULL" },
        { name: "slug", type: "VARCHAR(100)", constraints: "UNIQUE, NOT NULL" },
        { name: "description", type: "TEXT", constraints: "NULLABLE" },
        { name: "image", type: "VARCHAR(500)", constraints: "NULLABLE" },
      ],
    },
    {
      name: "products",
      desc: "Catalog items with price, stock inventory constraints, category references, and ratings.",
      pk: "id (CUID / VARCHAR)",
      fk: "category_id → categories(id) ON DELETE RESTRICT",
      indexes: "slug (UNIQUE), category_id, price",
      columns: [
        { name: "id", type: "VARCHAR (CUID)", constraints: "PRIMARY KEY" },
        { name: "name", type: "VARCHAR(255)", constraints: "NOT NULL" },
        { name: "slug", type: "VARCHAR(255)", constraints: "UNIQUE, NOT NULL" },
        { name: "description", type: "TEXT", constraints: "NOT NULL" },
        { name: "price", type: "DECIMAL(10,2)", constraints: "CHECK (price > 0), NOT NULL" },
        { name: "compare_price", type: "DECIMAL(10,2)", constraints: "NULLABLE" },
        { name: "stock", type: "INTEGER", constraints: "CHECK (stock >= 0), DEFAULT 0" },
        { name: "category_id", type: "VARCHAR", constraints: "FOREIGN KEY, NOT NULL" },
        { name: "featured", type: "BOOLEAN", constraints: "DEFAULT FALSE" },
        { name: "is_active", type: "BOOLEAN", constraints: "DEFAULT TRUE" },
        { name: "rating", type: "DECIMAL(2,1)", constraints: "DEFAULT 0.0" },
      ],
    },
    {
      name: "carts",
      desc: "Persistent 1-to-1 shopping cart session container per customer.",
      pk: "id (CUID / VARCHAR)",
      fk: "customer_id → customers(id) ON DELETE CASCADE",
      indexes: "customer_id (UNIQUE)",
      columns: [
        { name: "id", type: "VARCHAR (CUID)", constraints: "PRIMARY KEY" },
        { name: "customer_id", type: "VARCHAR", constraints: "UNIQUE, FOREIGN KEY" },
        { name: "created_at", type: "TIMESTAMP", constraints: "DEFAULT CURRENT_TIMESTAMP" },
      ],
    },
    {
      name: "cart_items",
      desc: "Composite relationship connecting active carts to products with item quantities.",
      pk: "id (CUID / VARCHAR)",
      fk: "cart_id → carts(id), product_id → products(id) ON DELETE CASCADE",
      indexes: "UNIQUE(cart_id, product_id)",
      columns: [
        { name: "id", type: "VARCHAR (CUID)", constraints: "PRIMARY KEY" },
        { name: "cart_id", type: "VARCHAR", constraints: "FOREIGN KEY, NOT NULL" },
        { name: "product_id", type: "VARCHAR", constraints: "FOREIGN KEY, NOT NULL" },
        { name: "quantity", type: "INTEGER", constraints: "CHECK (quantity > 0), DEFAULT 1" },
      ],
    },
    {
      name: "orders",
      desc: "Central transaction entity tracking customer orders, calculated totals, and lifecycle status.",
      pk: "id (CUID / VARCHAR)",
      fk: "customer_id → customers(id) RESTRICT, address_id → addresses(id) RESTRICT",
      indexes: "order_number (UNIQUE), customer_id, status, created_at",
      columns: [
        { name: "id", type: "VARCHAR (CUID)", constraints: "PRIMARY KEY" },
        { name: "order_number", type: "VARCHAR(50)", constraints: "UNIQUE, NOT NULL" },
        { name: "customer_id", type: "VARCHAR", constraints: "FOREIGN KEY, NOT NULL" },
        { name: "address_id", type: "VARCHAR", constraints: "FOREIGN KEY, NOT NULL" },
        { name: "status", type: "ENUM ('PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED')", constraints: "DEFAULT 'PENDING'" },
        { name: "subtotal", type: "DECIMAL(10,2)", constraints: "NOT NULL" },
        { name: "tax", type: "DECIMAL(10,2)", constraints: "NOT NULL (18% GST)" },
        { name: "shipping", type: "DECIMAL(10,2)", constraints: "NOT NULL" },
        { name: "total", type: "DECIMAL(10,2)", constraints: "NOT NULL" },
      ],
    },
    {
      name: "order_items",
      desc: "Historical purchase snapshots preserving exact unit price at time of order creation.",
      pk: "id (CUID / VARCHAR)",
      fk: "order_id → orders(id) CASCADE, product_id → products(id) RESTRICT",
      indexes: "order_id, product_id",
      columns: [
        { name: "id", type: "VARCHAR (CUID)", constraints: "PRIMARY KEY" },
        { name: "order_id", type: "VARCHAR", constraints: "FOREIGN KEY, NOT NULL" },
        { name: "product_id", type: "VARCHAR", constraints: "FOREIGN KEY, NOT NULL" },
        { name: "quantity", type: "INTEGER", constraints: "CHECK (quantity > 0)" },
        { name: "price", type: "DECIMAL(10,2)", constraints: "Historical purchase unit price" },
        { name: "total", type: "DECIMAL(10,2)", constraints: "quantity * price" },
      ],
    },
    {
      name: "payments",
      desc: "Audit trail for demo payment transactions linked 1-to-1 with orders.",
      pk: "id (CUID / VARCHAR)",
      fk: "order_id → orders(id) ON DELETE CASCADE",
      indexes: "order_id (UNIQUE), status",
      columns: [
        { name: "id", type: "VARCHAR (CUID)", constraints: "PRIMARY KEY" },
        { name: "order_id", type: "VARCHAR", constraints: "UNIQUE, FOREIGN KEY" },
        { name: "method", type: "ENUM ('CREDIT_CARD','DEBIT_CARD','UPI','NET_BANKING','CASH_ON_DELIVERY')", constraints: "NOT NULL" },
        { name: "amount", type: "DECIMAL(10,2)", constraints: "NOT NULL" },
        { name: "status", type: "ENUM ('PENDING','SUCCESS','FAILED')", constraints: "DEFAULT 'PENDING'" },
        { name: "transaction_id", type: "VARCHAR(100)", constraints: "NULLABLE" },
        { name: "paid_at", type: "TIMESTAMP", constraints: "NULLABLE" },
      ],
    },
    {
      name: "deliveries",
      desc: "Logistics tracking record linked 1-to-1 with orders, managing tracking numbers and carriers.",
      pk: "id (CUID / VARCHAR)",
      fk: "order_id → orders(id) ON DELETE CASCADE",
      indexes: "order_id (UNIQUE), tracking_number",
      columns: [
        { name: "id", type: "VARCHAR (CUID)", constraints: "PRIMARY KEY" },
        { name: "order_id", type: "VARCHAR", constraints: "UNIQUE, FOREIGN KEY" },
        { name: "status", type: "ENUM ('PENDING','SHIPPED','IN_TRANSIT','OUT_FOR_DELIVERY','DELIVERED','RETURNED')", constraints: "DEFAULT 'PENDING'" },
        { name: "tracking_number", type: "VARCHAR(100)", constraints: "NULLABLE" },
        { name: "carrier", type: "VARCHAR(100)", constraints: "NULLABLE" },
        { name: "shipped_at", type: "TIMESTAMP", constraints: "NULLABLE" },
        { name: "delivered_at", type: "TIMESTAMP", constraints: "NULLABLE" },
      ],
    },
  ];

  const queries = [
    {
      title: "1. INNER JOIN — Products with Categories",
      desc: "Combines catalog products with their parent category details, sorted by category name.",
      sql: `SELECT 
  p.id AS product_id,
  p.name AS product_name,
  c.name AS category_name,
  p.price,
  p.stock
FROM products p
INNER JOIN categories c ON p.category_id = c.id
WHERE p.is_active = TRUE
ORDER BY c.name ASC, p.price DESC;`,
    },
    {
      title: "2. MULTI-TABLE JOIN — Complete Customer Order Summary",
      desc: "Retrieves complete order history joining customers, orders, deliveries, and payment status.",
      sql: `SELECT 
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
ORDER BY o.created_at DESC;`,
    },
    {
      title: "3. AGGREGATE QUERY — Total Settled Revenue & Average Order Value",
      desc: "Calculates total sales volume and average ticket size from successful payments.",
      sql: `SELECT 
  COUNT(o.id) AS total_successful_orders,
  SUM(p.amount) AS total_settled_revenue,
  ROUND(AVG(p.amount), 2) AS average_order_value,
  MIN(p.amount) AS min_order_value,
  MAX(p.amount) AS max_order_value
FROM orders o
INNER JOIN payments p ON o.id = p.order_id
WHERE p.status = 'SUCCESS';`,
    },
    {
      title: "4. GROUP BY & HAVING — Top-Selling Products by Revenue",
      desc: "Aggregates total units sold and total revenue per product, filtering out low-volume items.",
      sql: `SELECT 
  p.id,
  p.name AS product_name,
  SUM(oi.quantity) AS total_units_sold,
  SUM(oi.total) AS total_gross_revenue,
  COUNT(DISTINCT oi.order_id) AS distinct_orders_count
FROM order_items oi
INNER JOIN products p ON oi.product_id = p.id
INNER JOIN orders o ON oi.order_id = o.id
WHERE o.status != 'CANCELLED'
GROUP BY p.id, p.name
HAVING SUM(oi.quantity) > 0
ORDER BY total_gross_revenue DESC
LIMIT 10;`,
    },
    {
      title: "5. GROUP BY — Total Sales Revenue by Category",
      desc: "Calculates sales volume across each category to analyze department performance.",
      sql: `SELECT 
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
ORDER BY category_revenue DESC;`,
    },
    {
      title: "6. SUBQUERY — High-Value Customers (Spending Above Average)",
      desc: "Finds all customers whose cumulative order spending exceeds the store's average customer lifetime value.",
      sql: `SELECT 
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
ORDER BY customer_totals.total_spent DESC;`,
    },
    {
      title: "7. SUBQUERY & FILTER — Low Stock Alert Query",
      desc: "Identifies products with stock below threshold or marked out of stock for inventory replenishment.",
      sql: `SELECT 
  p.id,
  p.name,
  c.name AS category_name,
  p.stock,
  p.price
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE p.stock <= 10 AND p.is_active = TRUE
ORDER BY p.stock ASC;`,
    },
    {
      title: "8. TRANSACTION — Atomic Order Checkout with Stock Decrement",
      desc: "ACID transaction ensuring consistent stock deduction, order line items, payment, and delivery creation with automatic rollback on error.",
      sql: `BEGIN TRANSACTION;

-- 1. Verify and lock product stock
SELECT id, stock, price FROM products 
WHERE id = 'prod_123' FOR UPDATE;

-- 2. Deduct inventory safely
UPDATE products 
SET stock = stock - 2 
WHERE id = 'prod_123' AND stock >= 2;

-- 3. Create Order
INSERT INTO orders (id, order_number, customer_id, address_id, status, subtotal, tax, shipping, total)
VALUES ('ord_456', 'ORD-2026-X1', 'cust_01', 'addr_01', 'PENDING', 2498.00, 449.64, 0.00, 2947.64);

-- 4. Insert Order Items (Freeze purchase price)
INSERT INTO order_items (id, order_id, product_id, quantity, price, total)
VALUES ('item_789', 'ord_456', 'prod_123', 2, 1249.00, 2498.00);

-- 5. Record Payment
INSERT INTO payments (id, order_id, method, amount, status)
VALUES ('pay_101', 'ord_456', 'UPI', 2947.64, 'PENDING');

-- 6. Initialize Delivery Record
INSERT INTO deliveries (id, order_id, status)
VALUES ('del_202', 'ord_456', 'PENDING');

-- 7. Clear Shopping Cart
DELETE FROM cart_items WHERE cart_id = 'cart_01';

COMMIT; -- All operations persist atomically, or ROLLBACK on any failure`,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="border-b border-slate-200 pb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-lg bg-indigo-600 p-2 text-white">
            <Database className="h-6 w-6" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded">
            College DBMS Academic Project
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          Database Architecture & Relational Design Documentation
        </h1>
        <p className="mt-3 text-base text-slate-600 max-w-3xl leading-relaxed">
          This system is backed by a fully normalized <strong>PostgreSQL</strong> relational database 
          managed via <strong>Prisma ORM</strong>. Below is the comprehensive architectural documentation 
          covering the Entity-Relationship (ER) model, normalization theory, referential integrity rules, 
          and production SQL query benchmarks.
        </p>
      </div>

      {/* ER Diagram Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-900">1. Entity-Relationship (ER) Architecture</h2>
        </div>
        <p className="text-sm text-slate-600">
          The database consists of 10 strongly-typed entities with well-defined relational cardinalities:
        </p>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm overflow-x-auto">
          <div className="font-mono text-xs text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-200 leading-relaxed whitespace-pre">
{`+----------------+          1 : N          +-----------------+
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
                     +-----------------+                         +-----------------+`}
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="rounded-lg border border-slate-100 p-3 bg-slate-50">
              <span className="font-bold text-slate-900">Customers → Addresses</span>
              <p className="text-slate-500 mt-1">1 to Many (1:N) with CASCADE deletion.</p>
            </div>
            <div className="rounded-lg border border-slate-100 p-3 bg-slate-50">
              <span className="font-bold text-slate-900">Categories → Products</span>
              <p className="text-slate-500 mt-1">1 to Many (1:N) with RESTRICT deletion.</p>
            </div>
            <div className="rounded-lg border border-slate-100 p-3 bg-slate-50">
              <span className="font-bold text-slate-900">Orders → OrderItems</span>
              <p className="text-slate-500 mt-1">1 to Many (1:N) with historical price snapshot.</p>
            </div>
            <div className="rounded-lg border border-slate-100 p-3 bg-slate-50">
              <span className="font-bold text-slate-900">Orders → Payments/Deliveries</span>
              <p className="text-slate-500 mt-1">1 to 1 (1:1) with CASCADE deletion on order removal.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Normalization Theory */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-900">2. Database Normalization Analysis</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
              <CheckCircle2 className="h-4 w-4" />
              1st Normal Form (1NF)
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Atomicity & Elimination of Repeating Groups</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every attribute holds strictly atomic (indivisible) values. No multi-valued attributes 
              or comma-delimited columns exist in transaction tables. Multiple customer delivery addresses 
              and order line items are normalized into dedicated child tables (<code className="bg-slate-100 px-1 py-0.5 rounded">addresses</code>, <code className="bg-slate-100 px-1 py-0.5 rounded">order_items</code>).
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
              <CheckCircle2 className="h-4 w-4" />
              2nd Normal Form (2NF)
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Elimination of Partial Dependencies</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every non-key attribute is fully functionally dependent on the primary key. In junction/associative 
              entities such as <code className="bg-slate-100 px-1 py-0.5 rounded">cart_items</code> and <code className="bg-slate-100 px-1 py-0.5 rounded">order_items</code>, attributes like quantity and purchase price depend 
              on the complete composite association, not a single foreign key.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
              <CheckCircle2 className="h-4 w-4" />
              3rd Normal Form (3NF)
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Elimination of Transitive Dependencies</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No non-prime attribute depends on another non-prime attribute (X → Y, Y → Z). 
              For instance, Category details (name, slug) are stored in <code className="bg-slate-100 px-1 py-0.5 rounded">categories</code> rather than being duplicated in <code className="bg-slate-100 px-1 py-0.5 rounded">products</code>. Similarly, delivery addresses are detached into <code className="bg-slate-100 px-1 py-0.5 rounded">addresses</code> to avoid transitive dependence through customers.
            </p>
          </div>
        </div>
      </section>

      {/* Relational Schema Tables */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Table className="h-5 w-5 text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-900">3. Relational Schema & Table Definitions</h2>
        </div>

        <div className="space-y-6">
          {tables.map((t) => (
            <div key={t.name} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50/75 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-slate-900">{t.name}</span>
                  <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    TABLE
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex flex-wrap gap-x-4">
                  <span><strong>PK:</strong> {t.pk}</span>
                  <span><strong>FK:</strong> {t.fk}</span>
                  <span><strong>Indexes:</strong> {t.indexes}</span>
                </div>
              </div>

              <div className="p-3 text-xs text-slate-600 bg-white border-b border-slate-100">
                {t.desc}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/40 text-slate-500 font-semibold uppercase tracking-wider">
                      <th className="py-2.5 px-4">Column Name</th>
                      <th className="py-2.5 px-4">Data Type</th>
                      <th className="py-2.5 px-4">Constraints & Rules</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {t.columns.map((col) => (
                      <tr key={col.name} className="hover:bg-slate-50/50">
                        <td className="py-2 px-4 font-semibold text-slate-800">{col.name}</td>
                        <td className="py-2 px-4 text-indigo-600">{col.type}</td>
                        <td className="py-2 px-4 text-slate-600 font-sans">{col.constraints}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SQL Queries Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-900">4. SQL Demonstration & Analytical Queries</h2>
        </div>
        <p className="text-sm text-slate-600">
          The following standard SQL-99 queries demonstrate advanced relational operations (JOINs, aggregates, subqueries, group by, transactions) running directly against the actual database schema:
        </p>

        <div className="space-y-6">
          {queries.map((q, idx) => (
            <div key={idx} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50/75">
                <h3 className="font-semibold text-sm text-slate-900">{q.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{q.desc}</p>
              </div>
              <div className="p-4 bg-slate-900 text-slate-100 overflow-x-auto">
                <pre className="font-mono text-xs leading-relaxed text-indigo-200">
                  {q.sql}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

