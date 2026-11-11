"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { checkoutSchema } from "@/lib/validators";
import { generateOrderNumber } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { Decimal } from "@prisma/client/runtime/library";

export async function createOrder(formData: FormData) {
  try {
    const user = await requireAuth();

    const raw = {
      addressId: formData.get("addressId") as string,
      paymentMethod: formData.get("paymentMethod") as string,
      notes: (formData.get("notes") as string) || undefined,
    };

    const validated = checkoutSchema.safeParse(raw);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message };
    }

    const { addressId, paymentMethod, notes } = validated.data;

    // Verify address belongs to user
    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address || address.customerId !== user.userId) {
      return { success: false, error: "Invalid delivery address" };
    }

    // Get cart with items
    const cart = await prisma.cart.findUnique({
      where: { customerId: user.userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return { success: false, error: "Your cart is empty" };
    }

    // Validate stock for all items
    for (const item of cart.items) {
      if (!item.product.isActive) {
        return {
          success: false,
          error: `"${item.product.name}" is no longer available`,
        };
      }
      if (item.quantity > item.product.stock) {
        return {
          success: false,
          error: `Insufficient stock for "${item.product.name}". Only ${item.product.stock} available.`,
        };
      }
    }

    // Calculate totals from database prices (never trust frontend)
    let subtotal = new Decimal(0);
    for (const item of cart.items) {
      const itemTotal = item.product.price.mul(item.quantity);
      subtotal = subtotal.add(itemTotal);
    }

    const tax = subtotal.mul(new Decimal("0.18")); // 18% GST
    const shipping = subtotal.gte(500) ? new Decimal(0) : new Decimal(50); // Free shipping above ₹500
    const total = subtotal.add(tax).add(shipping);

    // Create order in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // 1. Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          customerId: user.userId,
          addressId,
          status: "PENDING",
          subtotal,
          tax,
          shipping,
          total,
          notes: notes || null,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
              total: item.product.price.mul(item.quantity),
            })),
          },
        },
        include: {
          items: {
            include: { product: true },
          },
        },
      });

      // 2. Reduce product stock
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }

      // 3. Create payment record
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          method: paymentMethod as
            | "CREDIT_CARD"
            | "DEBIT_CARD"
            | "UPI"
            | "NET_BANKING"
            | "CASH_ON_DELIVERY",
          amount: total,
          status: "PENDING",
        },
      });

      // 4. Create delivery record
      await tx.delivery.create({
        data: {
          orderId: newOrder.id,
          status: "PENDING",
        },
      });

      // 5. Clear the cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    revalidatePath("/cart");
    revalidatePath("/orders");
    revalidatePath("/account/orders");
    revalidatePath("/", "layout");

    return { success: true, data: order };
  } catch (error) {
    console.error("Create order error:", error);
    return { success: false, error: "Failed to create order. Please try again." };
  }
}

export async function getMyOrders() {
  try {
    const user = await requireAuth();

    const orders = await prisma.order.findMany({
      where: { customerId: user.userId },
      include: {
        items: {
          include: { product: true },
        },
        payment: true,
        delivery: true,
        address: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: orders };
  } catch (error) {
    console.error("Get my orders error:", error);
    return { success: false, error: "Failed to fetch orders" };
  }
}

export async function getOrderDetails(orderId: string) {
  try {
    const user = await requireAuth();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: true },
        },
        payment: true,
        delivery: true,
        address: true,
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    // Verify ownership (unless admin)
    if (order.customerId !== user.userId && user.role !== "ADMIN") {
      return { success: false, error: "Order not found" };
    }

    return { success: true, data: order };
  } catch (error) {
    console.error("Get order details error:", error);
    return { success: false, error: "Failed to fetch order details" };
  }
}
