import { PrismaClient, Role, OrderStatus, PaymentStatus, PaymentMethod, DeliveryStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

// ─── HELPERS ────────────────────────────────────────────

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomRating(): string {
  const ratings = ["3.0", "3.2", "3.5", "3.8", "4.0", "4.1", "4.2", "4.3", "4.4", "4.5", "4.6", "4.7", "4.8", "4.9", "5.0"];
  return ratings[Math.floor(Math.random() * ratings.length)];
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function generateTrackingNumber(): string {
  const prefix = ["SE", "DL", "BW"][Math.floor(Math.random() * 3)];
  const num = Math.floor(Math.random() * 9000000000 + 1000000000);
  return `${prefix}${num}`;
}

// ─── SEED DATA ──────────────────────────────────────────

const customerData = [
  { firstName: "Aarav", lastName: "Sharma", email: "aarav.sharma@email.com", phone: "+91-9876543210" },
  { firstName: "Priya", lastName: "Patel", email: "priya.patel@email.com", phone: "+91-9876543211" },
  { firstName: "Rohan", lastName: "Gupta", email: "rohan.gupta@email.com", phone: "+91-9876543212" },
  { firstName: "Ananya", lastName: "Singh", email: "ananya.singh@email.com", phone: "+91-9876543213" },
  { firstName: "Vikram", lastName: "Mehta", email: "vikram.mehta@email.com", phone: "+91-9876543214" },
  { firstName: "Sneha", lastName: "Reddy", email: "sneha.reddy@email.com", phone: "+91-9876543215" },
  { firstName: "Arjun", lastName: "Nair", email: "arjun.nair@email.com", phone: "+91-9876543216" },
  { firstName: "Kavya", lastName: "Iyer", email: "kavya.iyer@email.com", phone: "+91-9876543217" },
  { firstName: "Rahul", lastName: "Joshi", email: "rahul.joshi@email.com", phone: "+91-9876543218" },
  { firstName: "Meera", lastName: "Desai", email: "meera.desai@email.com", phone: "+91-9876543219" },
];

const categoryData = [
  { name: "Electronics", slug: "electronics", description: "Gadgets, devices, and tech accessories for everyday use", image: "" },
  { name: "Fashion", slug: "fashion", description: "Clothing, footwear, and fashion accessories for men and women", image: "" },
  { name: "Home & Kitchen", slug: "home-kitchen", description: "Essentials for your home, kitchen, and living spaces", image: "" },
  { name: "Books", slug: "books", description: "Bestselling books across fiction, non-fiction, and self-help genres", image: "" },
  { name: "Accessories", slug: "accessories", description: "Tech accessories, bags, and everyday carry essentials", image: "" },
  { name: "Sports", slug: "sports", description: "Sports equipment, fitness gear, and outdoor accessories", image: "" },
];

interface ProductSeed {
  name: string;
  description: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  featured: boolean;
  categorySlug: string;
  rating: string;
  reviewCount: number;
}

const productData: ProductSeed[] = [
  // ── Electronics ──
  {
    name: "Wireless Earbuds Pro",
    description: "Premium wireless earbuds with active noise cancellation, 30-hour battery life, and IPX5 water resistance. Crystal clear audio with deep bass and seamless Bluetooth 5.3 connectivity.",
    price: 2999,
    comparePrice: 4999,
    stock: 150,
    featured: true,
    categorySlug: "electronics",
    rating: "4.5",
    reviewCount: 342,
  },
  {
    name: "Smart Watch Ultra",
    description: "Feature-packed smartwatch with AMOLED display, heart rate monitoring, SpO2 tracking, GPS, and 14-day battery life. Compatible with Android and iOS devices.",
    price: 6999,
    comparePrice: 9999,
    stock: 85,
    featured: true,
    categorySlug: "electronics",
    rating: "4.3",
    reviewCount: 218,
  },
  {
    name: "Bluetooth Speaker 360",
    description: "Portable Bluetooth speaker with 360-degree immersive sound, 20W output, IPX7 waterproof rating, and 12-hour playtime. Perfect for outdoor adventures and gatherings.",
    price: 3499,
    comparePrice: 5499,
    stock: 120,
    featured: false,
    categorySlug: "electronics",
    rating: "4.4",
    reviewCount: 187,
  },
  {
    name: "Power Bank 20000mAh",
    description: "High-capacity 20000mAh power bank with 22.5W fast charging, dual USB-C ports, and LED battery indicator. Charge up to 3 devices simultaneously.",
    price: 1499,
    comparePrice: 2499,
    stock: 200,
    featured: false,
    categorySlug: "electronics",
    rating: "4.6",
    reviewCount: 521,
  },
  {
    name: "USB-C Hub 7-in-1",
    description: "Multi-port USB-C hub with HDMI 4K output, 3x USB 3.0 ports, SD/TF card reader, and 100W PD pass-through charging. Essential for modern laptops.",
    price: 1999,
    comparePrice: 2999,
    stock: 90,
    featured: false,
    categorySlug: "electronics",
    rating: "4.2",
    reviewCount: 156,
  },
  {
    name: "Adjustable Laptop Stand",
    description: "Ergonomic aluminium laptop stand with 6 height adjustments, ventilated design for cooling, and anti-slip silicone pads. Supports laptops up to 17 inches.",
    price: 1299,
    comparePrice: 1999,
    stock: 110,
    featured: false,
    categorySlug: "electronics",
    rating: "4.7",
    reviewCount: 298,
  },
  {
    name: "Mechanical Keyboard RGB",
    description: "Full-size mechanical keyboard with hot-swappable switches, per-key RGB backlighting, N-key rollover, and detachable USB-C cable. Tactile typing experience.",
    price: 3999,
    comparePrice: 5999,
    stock: 65,
    featured: true,
    categorySlug: "electronics",
    rating: "4.5",
    reviewCount: 176,
  },
  {
    name: "HD Webcam 1080p",
    description: "Full HD 1080p webcam with auto-focus, dual stereo microphones, wide-angle lens, and built-in privacy cover. Ideal for video calls and streaming.",
    price: 2499,
    comparePrice: 3999,
    stock: 75,
    featured: false,
    categorySlug: "electronics",
    rating: "4.1",
    reviewCount: 132,
  },

  // ── Fashion ──
  {
    name: "Premium Cotton T-Shirt",
    description: "Ultra-soft 100% organic cotton t-shirt with a relaxed fit. Pre-shrunk fabric, reinforced stitching, and available in multiple colors. Perfect for everyday wear.",
    price: 799,
    comparePrice: 1299,
    stock: 300,
    featured: false,
    categorySlug: "fashion",
    rating: "4.3",
    reviewCount: 456,
  },
  {
    name: "Classic Denim Jacket",
    description: "Timeless denim jacket crafted from premium washed cotton denim. Features button closure, chest pockets, and adjustable waist tabs. A wardrobe essential.",
    price: 2499,
    comparePrice: 3999,
    stock: 80,
    featured: true,
    categorySlug: "fashion",
    rating: "4.6",
    reviewCount: 203,
  },
  {
    name: "Lightweight Running Shoes",
    description: "Breathable mesh running shoes with responsive cushioning, non-slip rubber outsole, and reflective accents. Engineered for comfort during long runs.",
    price: 3499,
    comparePrice: 4999,
    stock: 95,
    featured: true,
    categorySlug: "fashion",
    rating: "4.4",
    reviewCount: 312,
  },
  {
    name: "Genuine Leather Belt",
    description: "Handcrafted genuine leather belt with a brushed nickel buckle. 35mm width, stitched edges, and adjustable sizing. Suitable for formal and casual wear.",
    price: 899,
    comparePrice: 1499,
    stock: 180,
    featured: false,
    categorySlug: "fashion",
    rating: "4.2",
    reviewCount: 89,
  },
  {
    name: "Polarized Sunglasses",
    description: "UV400 polarized sunglasses with lightweight metal frame, anti-glare coating, and scratch-resistant lenses. Classic aviator design with spring hinges.",
    price: 1499,
    comparePrice: 2499,
    stock: 140,
    featured: false,
    categorySlug: "fashion",
    rating: "4.0",
    reviewCount: 167,
  },
  {
    name: "Slim Fit Formal Shirt",
    description: "Crisp cotton-blend formal shirt with a slim fit cut. Features a spread collar, French cuffs, and wrinkle-resistant fabric. Perfect for office and occasions.",
    price: 1299,
    comparePrice: 1999,
    stock: 160,
    featured: false,
    categorySlug: "fashion",
    rating: "4.5",
    reviewCount: 234,
  },

  // ── Home & Kitchen ──
  {
    name: "Stainless Steel Water Bottle",
    description: "Double-walled vacuum insulated stainless steel water bottle. Keeps drinks cold for 24 hours and hot for 12 hours. BPA-free, 750ml capacity with leak-proof lid.",
    price: 699,
    comparePrice: 999,
    stock: 250,
    featured: false,
    categorySlug: "home-kitchen",
    rating: "4.7",
    reviewCount: 612,
  },
  {
    name: "Non-Stick Pan Set (3-Piece)",
    description: "Premium 3-piece non-stick cookware set including fry pan, saucepan, and kadai. PFOA-free coating, cool-touch handles, and induction-compatible base.",
    price: 2499,
    comparePrice: 3999,
    stock: 70,
    featured: true,
    categorySlug: "home-kitchen",
    rating: "4.4",
    reviewCount: 278,
  },
  {
    name: "LED Desk Lamp with Wireless Charger",
    description: "Modern LED desk lamp with 5 brightness levels, 3 color temperatures, and built-in 15W wireless charging pad. Touch controls and 60-minute auto-off timer.",
    price: 1999,
    comparePrice: 2999,
    stock: 90,
    featured: false,
    categorySlug: "home-kitchen",
    rating: "4.3",
    reviewCount: 145,
  },
  {
    name: "Cotton Bedsheet Set (King Size)",
    description: "Luxurious 300-thread-count cotton bedsheet set with 1 flat sheet, 1 fitted sheet, and 2 pillow covers. Machine washable, fade-resistant, and wrinkle-free finish.",
    price: 1799,
    comparePrice: 2999,
    stock: 100,
    featured: false,
    categorySlug: "home-kitchen",
    rating: "4.6",
    reviewCount: 389,
  },
  {
    name: "Professional Knife Set (5-Piece)",
    description: "High-carbon stainless steel knife set with ergonomic pakka wood handles. Includes chef knife, santoku, bread knife, utility knife, and paring knife with wooden block.",
    price: 3499,
    comparePrice: 5499,
    stock: 55,
    featured: false,
    categorySlug: "home-kitchen",
    rating: "4.5",
    reviewCount: 198,
  },

  // ── Books ──
  {
    name: "The Psychology of Money",
    description: "Morgan Housel's bestselling exploration of how people think about money. Timeless lessons on wealth, greed, and happiness through 19 short stories. A must-read for everyone.",
    price: 349,
    comparePrice: 499,
    stock: 200,
    featured: true,
    categorySlug: "books",
    rating: "4.8",
    reviewCount: 1247,
  },
  {
    name: "Atomic Habits",
    description: "James Clear's proven framework for building good habits and breaking bad ones. Practical strategies grounded in biology, psychology, and neuroscience.",
    price: 399,
    comparePrice: 599,
    stock: 180,
    featured: true,
    categorySlug: "books",
    rating: "4.9",
    reviewCount: 2156,
  },
  {
    name: "Sapiens: A Brief History of Humankind",
    description: "Yuval Noah Harari's groundbreaking narrative of humanity's creation and evolution. Explores biology, history, and the future of Homo sapiens.",
    price: 449,
    comparePrice: 699,
    stock: 150,
    featured: false,
    categorySlug: "books",
    rating: "4.7",
    reviewCount: 987,
  },
  {
    name: "India After Gandhi",
    description: "Ramachandra Guha's definitive history of the world's largest democracy. A sweeping chronicle of India's journey from independence to the modern era.",
    price: 599,
    comparePrice: 899,
    stock: 90,
    featured: false,
    categorySlug: "books",
    rating: "4.6",
    reviewCount: 456,
  },
  {
    name: "The Alchemist",
    description: "Paulo Coelho's enchanting novel about Santiago, a shepherd boy who travels from Spain to Egypt in search of treasure and discovers the true meaning of life.",
    price: 299,
    comparePrice: 450,
    stock: 220,
    featured: false,
    categorySlug: "books",
    rating: "4.5",
    reviewCount: 3421,
  },

  // ── Accessories ──
  {
    name: "Laptop Backpack (35L)",
    description: "Water-resistant laptop backpack with padded 15.6-inch laptop compartment, anti-theft hidden pocket, USB charging port, and breathable back padding.",
    price: 1799,
    comparePrice: 2999,
    stock: 130,
    featured: false,
    categorySlug: "accessories",
    rating: "4.4",
    reviewCount: 567,
  },
  {
    name: "Premium Phone Case (Shockproof)",
    description: "Military-grade shockproof phone case with raised camera protection, anti-slip texture, and slim profile. Available for all major phone models.",
    price: 599,
    comparePrice: 999,
    stock: 350,
    featured: false,
    categorySlug: "accessories",
    rating: "4.2",
    reviewCount: 789,
  },
  {
    name: "Ergonomic Wireless Mouse",
    description: "Silent-click wireless mouse with ergonomic vertical design, 6 DPI settings (800-4000), rechargeable battery, and dual Bluetooth/2.4GHz connectivity.",
    price: 999,
    comparePrice: 1499,
    stock: 170,
    featured: false,
    categorySlug: "accessories",
    rating: "4.3",
    reviewCount: 234,
  },
  {
    name: "Classic Analog Wrist Watch",
    description: "Elegant analog wrist watch with stainless steel case, genuine leather strap, Japanese quartz movement, and 3 ATM water resistance. Minimalist dial design.",
    price: 2999,
    comparePrice: 4999,
    stock: 60,
    featured: true,
    categorySlug: "accessories",
    rating: "4.6",
    reviewCount: 145,
  },

  // ── Sports ──
  {
    name: "Premium Yoga Mat (6mm)",
    description: "Extra-thick 6mm yoga mat with non-slip textured surface, alignment markings, and carrying strap. Made from eco-friendly TPE material. 183cm x 66cm.",
    price: 1299,
    comparePrice: 1999,
    stock: 140,
    featured: false,
    categorySlug: "sports",
    rating: "4.5",
    reviewCount: 345,
  },
  {
    name: "Resistance Bands Set (5-Pack)",
    description: "Set of 5 latex resistance bands with varying resistance levels (5-50 lbs). Includes door anchor, ankle straps, and carrying bag. Perfect for home workouts.",
    price: 799,
    comparePrice: 1299,
    stock: 190,
    featured: false,
    categorySlug: "sports",
    rating: "4.3",
    reviewCount: 278,
  },
  {
    name: "Speed Skipping Rope",
    description: "Adjustable speed skipping rope with ball bearings, comfortable foam handles, and tangle-free steel wire cable. Suitable for cardio, boxing, and CrossFit training.",
    price: 499,
    comparePrice: 799,
    stock: 220,
    featured: false,
    categorySlug: "sports",
    rating: "4.4",
    reviewCount: 412,
  },
  {
    name: "Kashmir Willow Cricket Bat",
    description: "Premium Kashmir willow cricket bat with traditional handle grip, full-size blade, and oil finish. Ideal for tennis ball and leather ball cricket. Weight: 1.1-1.2 kg.",
    price: 1999,
    comparePrice: 2999,
    stock: 75,
    featured: false,
    categorySlug: "sports",
    rating: "4.1",
    reviewCount: 156,
  },
  {
    name: "Professional Badminton Racket",
    description: "Lightweight carbon fiber badminton racket with high-tension string, isometric frame, and cushioned grip. Weight: 85g. Comes with full racket cover.",
    price: 1499,
    comparePrice: 2499,
    stock: 85,
    featured: false,
    categorySlug: "sports",
    rating: "4.2",
    reviewCount: 198,
  },
];

const addressData = [
  { label: "Home", addressLine1: "42, Lotus Apartments", addressLine2: "MG Road", city: "Mumbai", state: "Maharashtra", pincode: "400001" },
  { label: "Home", addressLine1: "15, Shanti Nagar", addressLine2: "Nehru Street", city: "Pune", state: "Maharashtra", pincode: "411001" },
  { label: "Work", addressLine1: "Block B, Prestige Tower", addressLine2: "Outer Ring Road", city: "Bengaluru", state: "Karnataka", pincode: "560001" },
  { label: "Home", addressLine1: "78, Green Park Extension", addressLine2: "Near Metro Station", city: "New Delhi", state: "Delhi", pincode: "110016" },
  { label: "Home", addressLine1: "12/A, Navrangpura", addressLine2: "CG Road", city: "Ahmedabad", state: "Gujarat", pincode: "380009" },
  { label: "Work", addressLine1: "5th Floor, Hitech City", addressLine2: "Madhapur", city: "Hyderabad", state: "Telangana", pincode: "500081" },
  { label: "Home", addressLine1: "22, Anna Nagar East", addressLine2: "2nd Avenue", city: "Chennai", state: "Tamil Nadu", pincode: "600040" },
  { label: "Home", addressLine1: "88, Salt Lake Sector V", addressLine2: "Near City Centre", city: "Kolkata", state: "West Bengal", pincode: "700091" },
  { label: "Work", addressLine1: "301, Vijay Nagar", addressLine2: "AB Road", city: "Indore", state: "Madhya Pradesh", pincode: "452010" },
  { label: "Home", addressLine1: "7, Aundh Road", addressLine2: "Near University", city: "Jaipur", state: "Rajasthan", pincode: "302001" },
];

// ─── MAIN SEED FUNCTION ────────────────────────────────

async function main() {
  console.log("🌱 Starting database seed...\n");

  // ── Step 1: Clear existing data (respect FK order) ──
  console.log("🗑️  Clearing existing data...");
  await prisma.delivery.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.address.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.customer.deleteMany();
  console.log("   ✅ All data cleared\n");

  // ── Step 2: Hash passwords ──
  console.log("🔐 Hashing passwords...");
  const adminPasswordHash = await bcrypt.hash("admin123", 12);
  const customerPasswordHash = await bcrypt.hash("password123", 12);
  console.log("   ✅ Passwords hashed\n");

  // ── Step 3: Create admin user ──
  console.log("👑 Creating admin user...");
  const admin = await prisma.customer.create({
    data: {
      email: "admin@shopease.com",
      password: adminPasswordHash,
      firstName: "Admin",
      lastName: "ShopEase",
      phone: "+91-9000000000",
      role: Role.ADMIN,
      createdAt: daysAgo(90),
    },
  });
  console.log(`   ✅ Admin created: ${admin.email}\n`);

  // ── Step 4: Create customer accounts ──
  console.log("👥 Creating customer accounts...");
  const customers = [];
  for (let i = 0; i < customerData.length; i++) {
    const c = customerData[i];
    const customer = await prisma.customer.create({
      data: {
        email: c.email,
        password: customerPasswordHash,
        firstName: c.firstName,
        lastName: c.lastName,
        phone: c.phone,
        role: Role.CUSTOMER,
        createdAt: daysAgo(randomBetween(30, 80)),
      },
    });
    customers.push(customer);
    console.log(`   ✅ Customer: ${customer.firstName} ${customer.lastName} (${customer.email})`);
  }
  console.log("");

  // ── Step 5: Create categories ──
  console.log("📂 Creating categories...");
  const categories: Record<string, string> = {};
  for (const cat of categoryData) {
    const category = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        createdAt: daysAgo(90),
      },
    });
    categories[cat.slug] = category.id;
    console.log(`   ✅ Category: ${category.name}`);
  }
  console.log("");

  // ── Step 6: Create products ──
  console.log("📦 Creating products...");
  const products = [];
  for (const p of productData) {
    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug: slugify(p.name),
        description: p.description,
        price: new Decimal(p.price),
        comparePrice: p.comparePrice ? new Decimal(p.comparePrice) : null,
        stock: p.stock,
        images: [],
        featured: p.featured,
        isActive: true,
        categoryId: categories[p.categorySlug],
        rating: new Decimal(p.rating),
        reviewCount: p.reviewCount,
        createdAt: daysAgo(randomBetween(10, 60)),
      },
    });
    products.push(product);
    console.log(`   ✅ Product: ${product.name} — ₹${product.price}`);
  }
  console.log("");

  // ── Step 7: Create addresses for customers ──
  console.log("🏠 Creating addresses...");
  const addresses = [];
  for (let i = 0; i < customers.length; i++) {
    const customer = customers[i];
    const addr = addressData[i];
    const address = await prisma.address.create({
      data: {
        customerId: customer.id,
        label: addr.label,
        fullName: `${customer.firstName} ${customer.lastName}`,
        phone: customer.phone ?? "+91-9999999999",
        addressLine1: addr.addressLine1,
        addressLine2: addr.addressLine2,
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
        isDefault: true,
        createdAt: daysAgo(randomBetween(20, 60)),
      },
    });
    addresses.push(address);
    console.log(`   ✅ Address for ${customer.firstName}: ${addr.city}, ${addr.state}`);
  }
  console.log("");

  // ── Step 8: Create carts with items for some customers ──
  console.log("🛒 Creating carts...");
  const cartCustomerIndices = [0, 2, 4, 6, 8]; // 5 customers get carts
  for (const idx of cartCustomerIndices) {
    const customer = customers[idx];
    const cart = await prisma.cart.create({
      data: {
        customerId: customer.id,
      },
    });

    // Add 1-3 random products to each cart
    const numItems = randomBetween(1, 3);
    const usedProductIndices = new Set<number>();
    for (let j = 0; j < numItems; j++) {
      let productIdx: number;
      do {
        productIdx = randomBetween(0, products.length - 1);
      } while (usedProductIndices.has(productIdx));
      usedProductIndices.add(productIdx);

      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: products[productIdx].id,
          quantity: randomBetween(1, 3),
        },
      });
    }
    console.log(`   ✅ Cart for ${customer.firstName}: ${numItems} item(s)`);
  }
  console.log("");

  // ── Step 9: Create orders with items, payments, and deliveries ──
  console.log("📋 Creating orders...");

  interface OrderConfig {
    customerIdx: number;
    productIndices: number[];
    quantities: number[];
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    deliveryStatus: DeliveryStatus;
    daysAgoCreated: number;
    notes?: string;
  }

  const orderConfigs: OrderConfig[] = [
    {
      customerIdx: 0,
      productIndices: [0, 7],
      quantities: [1, 1],
      status: OrderStatus.DELIVERED,
      paymentMethod: PaymentMethod.UPI,
      paymentStatus: PaymentStatus.SUCCESS,
      deliveryStatus: DeliveryStatus.DELIVERED,
      daysAgoCreated: 25,
      notes: "Please deliver before 6 PM",
    },
    {
      customerIdx: 1,
      productIndices: [20, 21],
      quantities: [1, 1],
      status: OrderStatus.DELIVERED,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      paymentStatus: PaymentStatus.SUCCESS,
      deliveryStatus: DeliveryStatus.DELIVERED,
      daysAgoCreated: 20,
    },
    {
      customerIdx: 2,
      productIndices: [6, 4, 5],
      quantities: [1, 1, 2],
      status: OrderStatus.SHIPPED,
      paymentMethod: PaymentMethod.DEBIT_CARD,
      paymentStatus: PaymentStatus.SUCCESS,
      deliveryStatus: DeliveryStatus.IN_TRANSIT,
      daysAgoCreated: 5,
    },
    {
      customerIdx: 3,
      productIndices: [10, 12],
      quantities: [1, 2],
      status: OrderStatus.CONFIRMED,
      paymentMethod: PaymentMethod.UPI,
      paymentStatus: PaymentStatus.SUCCESS,
      deliveryStatus: DeliveryStatus.PENDING,
      daysAgoCreated: 2,
    },
    {
      customerIdx: 4,
      productIndices: [15, 16, 17],
      quantities: [2, 1, 1],
      status: OrderStatus.PROCESSING,
      paymentMethod: PaymentMethod.NET_BANKING,
      paymentStatus: PaymentStatus.SUCCESS,
      deliveryStatus: DeliveryStatus.PENDING,
      daysAgoCreated: 3,
      notes: "Gift wrap please",
    },
    {
      customerIdx: 5,
      productIndices: [1, 25],
      quantities: [1, 1],
      status: OrderStatus.DELIVERED,
      paymentMethod: PaymentMethod.UPI,
      paymentStatus: PaymentStatus.SUCCESS,
      deliveryStatus: DeliveryStatus.DELIVERED,
      daysAgoCreated: 15,
    },
    {
      customerIdx: 6,
      productIndices: [9, 11, 13],
      quantities: [1, 1, 1],
      status: OrderStatus.SHIPPED,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      paymentStatus: PaymentStatus.SUCCESS,
      deliveryStatus: DeliveryStatus.OUT_FOR_DELIVERY,
      daysAgoCreated: 4,
    },
    {
      customerIdx: 7,
      productIndices: [29, 30, 31],
      quantities: [1, 2, 1],
      status: OrderStatus.PENDING,
      paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
      paymentStatus: PaymentStatus.PENDING,
      deliveryStatus: DeliveryStatus.PENDING,
      daysAgoCreated: 1,
    },
    {
      customerIdx: 8,
      productIndices: [3, 26],
      quantities: [1, 1],
      status: OrderStatus.CANCELLED,
      paymentMethod: PaymentMethod.UPI,
      paymentStatus: PaymentStatus.FAILED,
      deliveryStatus: DeliveryStatus.RETURNED,
      daysAgoCreated: 10,
      notes: "Order cancelled by customer",
    },
    {
      customerIdx: 9,
      productIndices: [22, 23, 24],
      quantities: [1, 1, 1],
      status: OrderStatus.DELIVERED,
      paymentMethod: PaymentMethod.DEBIT_CARD,
      paymentStatus: PaymentStatus.SUCCESS,
      deliveryStatus: DeliveryStatus.DELIVERED,
      daysAgoCreated: 18,
    },
    {
      customerIdx: 0,
      productIndices: [14, 18],
      quantities: [1, 1],
      status: OrderStatus.PROCESSING,
      paymentMethod: PaymentMethod.UPI,
      paymentStatus: PaymentStatus.SUCCESS,
      deliveryStatus: DeliveryStatus.PENDING,
      daysAgoCreated: 1,
    },
    {
      customerIdx: 3,
      productIndices: [2, 27],
      quantities: [1, 1],
      status: OrderStatus.SHIPPED,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      paymentStatus: PaymentStatus.SUCCESS,
      deliveryStatus: DeliveryStatus.SHIPPED,
      daysAgoCreated: 6,
    },
  ];

  for (let i = 0; i < orderConfigs.length; i++) {
    const config = orderConfigs[i];
    const customer = customers[config.customerIdx];
    const address = addresses[config.customerIdx];
    const createdAt = daysAgo(config.daysAgoCreated);

    // Calculate order totals
    let subtotal = new Decimal(0);
    const orderItemsData: Array<{ productId: string; quantity: number; price: Decimal; total: Decimal }> = [];

    for (let j = 0; j < config.productIndices.length; j++) {
      const product = products[config.productIndices[j]];
      const quantity = config.quantities[j];
      const itemTotal = product.price.mul(quantity);
      subtotal = subtotal.add(itemTotal);
      orderItemsData.push({
        productId: product.id,
        quantity,
        price: product.price,
        total: itemTotal,
      });
    }

    const tax = subtotal.mul(new Decimal("0.18")).toDecimalPlaces(2); // 18% GST
    const shipping = subtotal.greaterThanOrEqualTo(999) ? new Decimal(0) : new Decimal(99);
    const total = subtotal.add(tax).add(shipping);

    // Use a transaction for each order + payment + delivery
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          customerId: customer.id,
          addressId: address.id,
          status: config.status,
          subtotal,
          tax,
          shipping,
          total,
          notes: config.notes ?? null,
          createdAt,
        },
      });

      // Create order items
      for (const item of orderItemsData) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
          },
        });
      }

      // Create payment
      const paidAt =
        config.paymentStatus === PaymentStatus.SUCCESS
          ? new Date(createdAt.getTime() + 5 * 60 * 1000) // 5 minutes after order
          : null;

      const transactionId =
        config.paymentStatus === PaymentStatus.SUCCESS
          ? `TXN${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`
          : null;

      await tx.payment.create({
        data: {
          orderId: order.id,
          method: config.paymentMethod,
          amount: total,
          status: config.paymentStatus,
          transactionId,
          paidAt,
          createdAt,
        },
      });

      // Create delivery
      const shippedAt =
        config.deliveryStatus !== DeliveryStatus.PENDING
          ? new Date(createdAt.getTime() + 24 * 60 * 60 * 1000) // 1 day after order
          : null;

      const estimatedDate = new Date(createdAt.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days after order

      const deliveredAt =
        config.deliveryStatus === DeliveryStatus.DELIVERED
          ? new Date(createdAt.getTime() + 3 * 24 * 60 * 60 * 1000) // 3 days after order
          : null;

      const trackingNumber =
        config.deliveryStatus !== DeliveryStatus.PENDING ? generateTrackingNumber() : null;

      const carriers = ["BlueDart", "Delhivery", "DTDC", "Ecom Express", "Shadowfax"];
      const carrier =
        config.deliveryStatus !== DeliveryStatus.PENDING
          ? carriers[Math.floor(Math.random() * carriers.length)]
          : null;

      await tx.delivery.create({
        data: {
          orderId: order.id,
          status: config.deliveryStatus,
          trackingNumber,
          carrier,
          shippedAt,
          estimatedDate,
          deliveredAt,
          createdAt,
        },
      });

      console.log(
        `   ✅ Order ${order.orderNumber} — ${customer.firstName} ${customer.lastName} — ₹${total} — ${config.status}`
      );
    });
  }
  console.log("");

  // ── Summary ──
  const counts = await Promise.all([
    prisma.customer.count(),
    prisma.category.count(),
    prisma.product.count(),
    prisma.address.count(),
    prisma.cart.count(),
    prisma.order.count(),
    prisma.payment.count(),
    prisma.delivery.count(),
  ]);

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 Seed Summary:");
  console.log(`   Customers:  ${counts[0]} (1 admin + ${counts[0] - 1} customers)`);
  console.log(`   Categories: ${counts[1]}`);
  console.log(`   Products:   ${counts[2]}`);
  console.log(`   Addresses:  ${counts[3]}`);
  console.log(`   Carts:      ${counts[4]}`);
  console.log(`   Orders:     ${counts[5]}`);
  console.log(`   Payments:   ${counts[6]}`);
  console.log(`   Deliveries: ${counts[7]}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n🎉 Database seeded successfully!\n");
  console.log("   Admin login:    admin@shopease.com / admin123");
  console.log("   Customer login: aarav.sharma@email.com / password123\n");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
