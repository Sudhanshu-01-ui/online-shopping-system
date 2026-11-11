"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { productSchema, categorySchema, updateOrderStatusSchema, updateDeliverySchema, updatePaymentStatusSchema } from "@/lib/validators";
import { slugify, generateTrackingNumber } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import {
  DEMO_PRODUCTS,
  DEMO_CATEGORIES,
  DEMO_CUSTOMERS,
  DEMO_ORDERS,
  DEMO_PAYMENTS,
  DEMO_DELIVERIES,
} from "@/lib/demo-data";

// ─── DASHBOARD ──────────────────────────────────────────

export async function getDashboardStats() {
  await requireAdmin();

  try {
    const [
      totalCustomers,
      totalProducts,
      totalOrders,
      revenueResult,
      recentOrders,
      lowStockProducts,
      orderStatusCounts,
    ] = await Promise.all([
      prisma.customer.count({ where: { role: "CUSTOMER" } }),
      prisma.product.count(),
      prisma.order.count(),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: "SUCCESS" },
      }),
      prisma.order.findMany({
        include: {
          customer: { select: { firstName: true, lastName: true, email: true } },
          payment: { select: { status: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.product.findMany({
        where: { stock: { lte: 10 }, isActive: true },
        include: { category: true },
        orderBy: { stock: "asc" },
        take: 10,
      }),
      prisma.order.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
    ]);

    return {
      totalCustomers,
      totalProducts,
      totalOrders,
      totalRevenue: revenueResult._sum.amount ? Number(revenueResult._sum.amount) : 0,
      recentOrders: recentOrders.map((o) => ({
        ...o,
        subtotal: Number(o.subtotal),
        tax: Number(o.tax),
        shipping: Number(o.shipping),
        total: Number(o.total),
      })),
      lowStockProducts: lowStockProducts.map((p) => ({
        ...p,
        price: Number(p.price),
        comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
        rating: Number(p.rating),
      })),
      orderStatusCounts: orderStatusCounts.map((s) => ({
        status: s.status,
        count: s._count.status,
      })),
    };
  } catch (error) {
    // Database offline fallback
    return {
      totalCustomers: 10,
      totalProducts: DEMO_PRODUCTS.length,
      totalOrders: 12,
      totalRevenue: 48950,
      recentOrders: [
        {
          id: "ord_1",
          orderNumber: "ORD-2026-1001",
          createdAt: new Date("2026-11-06"),
          total: 7348,
          status: "DELIVERED" as const,
          subtotal: 6227,
          tax: 1121,
          shipping: 0,
          customer: { firstName: "Rahul", lastName: "Sharma", email: "rahul.sharma@example.com" },
        },
        {
          id: "ord_2",
          orderNumber: "ORD-2026-1002",
          createdAt: new Date("2026-11-05"),
          total: 6898,
          status: "SHIPPED" as const,
          subtotal: 5845,
          tax: 1053,
          shipping: 0,
          customer: { firstName: "Priya", lastName: "Patel", email: "priya.patel@example.com" },
        },
        {
          id: "ord_3",
          orderNumber: "ORD-2026-1003",
          createdAt: new Date("2026-11-05"),
          total: 3499,
          status: "PROCESSING" as const,
          subtotal: 2965,
          tax: 534,
          shipping: 0,
          customer: { firstName: "Amit", lastName: "Verma", email: "amit.verma@example.com" },
        },
        {
          id: "ord_4",
          orderNumber: "ORD-2026-1004",
          createdAt: new Date("2026-11-04"),
          total: 8258,
          status: "CONFIRMED" as const,
          subtotal: 6998,
          tax: 1260,
          shipping: 0,
          customer: { firstName: "Sneha", lastName: "Reddy", email: "sneha.reddy@example.com" },
        },
      ],
      lowStockProducts: DEMO_PRODUCTS.filter((p) => p.stock <= 10),
      orderStatusCounts: [
        { status: "DELIVERED" as const, count: 4 },
        { status: "SHIPPED" as const, count: 2 },
        { status: "PROCESSING" as const, count: 2 },
        { status: "CONFIRMED" as const, count: 2 },
        { status: "PENDING" as const, count: 1 },
        { status: "CANCELLED" as const, count: 1 },
      ],
    };
  }
}

// ─── PRODUCTS ───────────────────────────────────────────

export async function adminGetProducts(params: {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
} = {}) {
  await requireAdmin();
  const { search, category, page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }
  if (category) {
    where.categoryId = category;
  }

  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products: products.map((p) => ({
        ...p,
        price: Number(p.price),
        comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
        rating: Number(p.rating),
      })),
      total,
      pages: Math.ceil(total / limit),
      page,
    };
  } catch {
    let list = [...DEMO_PRODUCTS];
    if (search) {
      list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    }
    if (category) {
      list = list.filter((p) => p.categoryId === category);
    }
    return {
      products: list.slice(skip, skip + limit),
      total: list.length,
      pages: Math.ceil(list.length / limit) || 1,
      page,
    };
  }
}

export async function adminCreateProduct(formData: FormData) {
  await requireAdmin();

  const raw = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    price: Number(formData.get("price")),
    comparePrice: formData.get("comparePrice") ? Number(formData.get("comparePrice")) : null,
    stock: Number(formData.get("stock") || 0),
    categoryId: formData.get("categoryId") as string,
    images: formData.get("images") ? (formData.get("images") as string).split(",").map((s) => s.trim()).filter(Boolean) : [],
    featured: formData.get("featured") === "true",
    isActive: formData.get("isActive") !== "false",
  };

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    let slug = slugify(parsed.data.name);
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    await prisma.product.create({
      data: {
        ...parsed.data,
        slug,
        comparePrice: parsed.data.comparePrice || null,
        images: raw.images,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Create product error:", error);
    return { success: false, error: "Failed to create product" };
  }
}

export async function adminUpdateProduct(id: string, formData: FormData) {
  await requireAdmin();

  const raw = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    price: Number(formData.get("price")),
    comparePrice: formData.get("comparePrice") ? Number(formData.get("comparePrice")) : null,
    stock: Number(formData.get("stock") || 0),
    categoryId: formData.get("categoryId") as string,
    images: formData.get("images") ? (formData.get("images") as string).split(",").map((s) => s.trim()).filter(Boolean) : [],
    featured: formData.get("featured") === "true",
    isActive: formData.get("isActive") !== "false",
  };

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    await prisma.product.update({
      where: { id },
      data: {
        ...parsed.data,
        comparePrice: parsed.data.comparePrice || null,
        images: raw.images,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Update product error:", error);
    return { success: false, error: "Failed to update product" };
  }
}

export async function adminDeleteProduct(id: string) {
  await requireAdmin();

  try {
    const orderItems = await prisma.orderItem.count({ where: { productId: id } });
    if (orderItems > 0) {
      return { success: false, error: "Cannot delete product with existing orders. Deactivate it instead." };
    }

    await prisma.cartItem.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    console.error("Delete product error:", error);
    return { success: false, error: "Failed to delete product" };
  }
}

// ─── CATEGORIES ─────────────────────────────────────────

export async function adminGetCategories() {
  await requireAdmin();

  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    });

    return categories;
  } catch {
    return DEMO_CATEGORIES;
  }
}

export async function adminCreateCategory(formData: FormData) {
  await requireAdmin();

  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    image: (formData.get("image") as string) || undefined,
  };

  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    const slug = slugify(parsed.data.name);
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return { success: false, error: "A category with this name already exists" };
    }

    await prisma.category.create({
      data: { ...parsed.data, slug },
    });

    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("Create category error:", error);
    return { success: false, error: "Failed to create category" };
  }
}

export async function adminUpdateCategory(id: string, formData: FormData) {
  await requireAdmin();

  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    image: (formData.get("image") as string) || undefined,
  };

  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    await prisma.category.update({
      where: { id },
      data: parsed.data,
    });

    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("Update category error:", error);
    return { success: false, error: "Failed to update category" };
  }
}

export async function adminDeleteCategory(id: string) {
  await requireAdmin();

  try {
    const productCount = await prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      return { success: false, error: `Cannot delete category with ${productCount} products` };
    }

    await prisma.category.delete({ where: { id } });
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("Delete category error:", error);
    return { success: false, error: "Failed to delete category" };
  }
}

// ─── CUSTOMERS ──────────────────────────────────────────

export async function adminGetCustomers(params: { search?: string; page?: number; limit?: number } = {}) {
  await requireAdmin();
  const { search, page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;

  try {
    const where: Prisma.CustomerWhereInput = { role: "CUSTOMER" };
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.customer.count({ where }),
    ]);

    return { customers, total, pages: Math.ceil(total / limit) || 1, page };
  } catch (error) {
    let list = [...DEMO_CUSTOMERS];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.firstName.toLowerCase().includes(q) ||
          c.lastName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
      );
    }
    const total = list.length;
    return {
      customers: list.slice(skip, skip + limit),
      total,
      pages: Math.ceil(total / limit) || 1,
      page,
    };
  }
}

export async function adminGetCustomerDetails(id: string) {
  await requireAdmin();

  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        createdAt: true,
        addresses: true,
        orders: {
          include: {
            items: { include: { product: true } },
            payment: true,
            delivery: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (customer) return customer;
  } catch (error) {
    // Database offline fallback
  }

  const demoCust = DEMO_CUSTOMERS.find((c) => c.id === id);
  if (!demoCust) return null;

  const demoOrders = DEMO_ORDERS.filter((o) => o.customerId === id);
  return {
    ...demoCust,
    orders: demoOrders,
  };
}

// ─── ORDERS ─────────────────────────────────────────────

export async function adminGetOrders(params: { search?: string; status?: string; page?: number; limit?: number } = {}) {
  await requireAdmin();
  const { search, status, page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;

  try {
    const where: Prisma.OrderWhereInput = {};
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { customer: { firstName: { contains: search, mode: "insensitive" } } },
        { customer: { lastName: { contains: search, mode: "insensitive" } } },
        { customer: { email: { contains: search, mode: "insensitive" } } },
      ];
    }
    if (status && status !== "ALL") {
      where.status = status as Prisma.EnumOrderStatusFilter;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: { select: { firstName: true, lastName: true, email: true } },
          items: { select: { id: true } },
          payment: { select: { status: true, method: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders: orders.map((o) => ({
        ...o,
        subtotal: Number(o.subtotal),
        tax: Number(o.tax),
        shipping: Number(o.shipping),
        total: Number(o.total),
      })),
      total,
      pages: Math.ceil(total / limit) || 1,
      page,
    };
  } catch (error) {
    let list = [...DEMO_ORDERS];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customer.firstName.toLowerCase().includes(q) ||
          o.customer.lastName.toLowerCase().includes(q) ||
          o.customer.email.toLowerCase().includes(q)
      );
    }
    if (status && status !== "ALL") {
      list = list.filter((o) => o.status === status);
    }
    const total = list.length;
    return {
      orders: list.slice(skip, skip + limit),
      total,
      pages: Math.ceil(total / limit) || 1,
      page,
    };
  }
}

export async function adminGetOrderDetails(id: string) {
  await requireAdmin();

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        address: true,
        items: { include: { product: true } },
        payment: true,
        delivery: true,
      },
    });

    if (order) {
      return {
        ...order,
        subtotal: Number(order.subtotal),
        tax: Number(order.tax),
        shipping: Number(order.shipping),
        total: Number(order.total),
        items: order.items.map((i) => ({
          ...i,
          price: Number(i.price),
          total: Number(i.total),
          product: {
            ...i.product,
            price: Number(i.product.price),
            comparePrice: i.product.comparePrice ? Number(i.product.comparePrice) : null,
            rating: Number(i.product.rating),
          },
        })),
        payment: order.payment ? { ...order.payment, amount: Number(order.payment.amount) } : null,
      };
    }
  } catch (error) {
    // Database offline fallback
  }

  const demoOrder = DEMO_ORDERS.find((o) => o.id === id || o.orderNumber === id);
  return demoOrder || null;
}

export async function adminUpdateOrderStatus(formData: FormData) {
  await requireAdmin();

  const raw = {
    orderId: formData.get("orderId") as string,
    status: formData.get("status") as string,
  };

  const parsed = updateOrderStatusSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: parsed.data.orderId },
      include: { items: true },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    // If cancelling, restore stock
    if (parsed.data.status === "CANCELLED" && order.status !== "CANCELLED") {
      await prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
        await tx.order.update({
          where: { id: parsed.data.orderId },
          data: { status: parsed.data.status },
        });
        // Update payment to FAILED if cancelling
        await tx.payment.updateMany({
          where: { orderId: parsed.data.orderId },
          data: { status: "FAILED" },
        });
      });
    } else {
      await prisma.order.update({
        where: { id: parsed.data.orderId },
        data: { status: parsed.data.status },
      });
    }

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${parsed.data.orderId}`);
    return { success: true };
  } catch (error) {
    console.error("Update order status error:", error);
    return { success: false, error: "Failed to update order status" };
  }
}

// ─── PAYMENTS ───────────────────────────────────────────

export async function adminGetPayments(params: { status?: string; page?: number; limit?: number } = {}) {
  await requireAdmin();
  const { status, page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;

  try {
    const where: Prisma.PaymentWhereInput = {};
    if (status && status !== "ALL") {
      where.status = status as Prisma.EnumPaymentStatusFilter;
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          order: {
            select: { orderNumber: true, customer: { select: { firstName: true, lastName: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ]);

    return {
      payments: payments.map((p) => ({ ...p, amount: Number(p.amount) })),
      total,
      pages: Math.ceil(total / limit) || 1,
      page,
    };
  } catch (error) {
    let list = [...DEMO_PAYMENTS];
    if (status && status !== "ALL") {
      list = list.filter((p) => p.status === status);
    }
    const total = list.length;
    return {
      payments: list.slice(skip, skip + limit),
      total,
      pages: Math.ceil(total / limit) || 1,
      page,
    };
  }
}

export async function adminUpdatePaymentStatus(formData: FormData) {
  await requireAdmin();

  const raw = {
    paymentId: formData.get("paymentId") as string,
    status: formData.get("status") as string,
  };

  const parsed = updatePaymentStatusSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    const updateData: Prisma.PaymentUpdateInput = { status: parsed.data.status };
    if (parsed.data.status === "SUCCESS") {
      updateData.paidAt = new Date();
      updateData.transactionId = `TXN${Date.now().toString(36).toUpperCase()}`;
    }

    await prisma.payment.update({
      where: { id: parsed.data.paymentId },
      data: updateData,
    });

    revalidatePath("/admin/payments");
    return { success: true };
  } catch (error) {
    console.error("Update payment status error:", error);
    return { success: false, error: "Failed to update payment status" };
  }
}

// ─── DELIVERIES ─────────────────────────────────────────

export async function adminGetDeliveries(params: { status?: string; page?: number; limit?: number } = {}) {
  await requireAdmin();
  const { status, page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;

  try {
    const where: Prisma.DeliveryWhereInput = {};
    if (status && status !== "ALL") {
      where.status = status as Prisma.EnumDeliveryStatusFilter;
    }

    const [deliveries, total] = await Promise.all([
      prisma.delivery.findMany({
        where,
        include: {
          order: {
            select: {
              orderNumber: true,
              customer: { select: { firstName: true, lastName: true } },
              address: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.delivery.count({ where }),
    ]);

    return { deliveries, total, pages: Math.ceil(total / limit) || 1, page };
  } catch (error) {
    let list = [...DEMO_DELIVERIES];
    if (status && status !== "ALL") {
      list = list.filter((d) => d.status === status);
    }
    const total = list.length;
    return {
      deliveries: list.slice(skip, skip + limit),
      total,
      pages: Math.ceil(total / limit) || 1,
      page,
    };
  }
}

export async function adminUpdateDelivery(formData: FormData) {
  await requireAdmin();

  const raw = {
    deliveryId: formData.get("deliveryId") as string,
    status: formData.get("status") as string,
    trackingNumber: (formData.get("trackingNumber") as string) || undefined,
    carrier: (formData.get("carrier") as string) || undefined,
  };

  const parsed = updateDeliverySchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    const updateData: Prisma.DeliveryUpdateInput = {
      status: parsed.data.status,
    };

    if (parsed.data.trackingNumber) updateData.trackingNumber = parsed.data.trackingNumber;
    if (parsed.data.carrier) updateData.carrier = parsed.data.carrier;

    if (parsed.data.status === "SHIPPED" || parsed.data.status === "IN_TRANSIT") {
      updateData.shippedAt = new Date();
      if (!parsed.data.trackingNumber) {
        updateData.trackingNumber = generateTrackingNumber();
      }
      const est = new Date();
      est.setDate(est.getDate() + 5);
      updateData.estimatedDate = est;
    }

    if (parsed.data.status === "DELIVERED") {
      updateData.deliveredAt = new Date();
    }

    await prisma.delivery.update({
      where: { id: parsed.data.deliveryId },
      data: updateData,
    });

    // Also update order status if delivery status changes
    const delivery = await prisma.delivery.findUnique({
      where: { id: parsed.data.deliveryId },
    });
    if (delivery) {
      let orderStatus: string | undefined;
      if (parsed.data.status === "SHIPPED" || parsed.data.status === "IN_TRANSIT") {
        orderStatus = "SHIPPED";
      } else if (parsed.data.status === "DELIVERED") {
        orderStatus = "DELIVERED";
      }
      if (orderStatus) {
        await prisma.order.update({
          where: { id: delivery.orderId },
          data: { status: orderStatus as "SHIPPED" | "DELIVERED" },
        });
      }
    }

    revalidatePath("/admin/deliveries");
    return { success: true };
  } catch (error) {
    console.error("Update delivery error:", error);
    return { success: false, error: "Failed to update delivery" };
  }
}

