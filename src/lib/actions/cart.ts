"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { addToCartSchema, updateCartSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function getCart() {
  try {
    const user = await requireAuth();

    const cart = await prisma.cart.findUnique({
      where: { customerId: user.userId },
      include: {
        items: {
          include: {
            product: {
              include: { category: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!cart) {
      return { success: true, data: { id: null, items: [] } };
    }

    return { success: true, data: cart };
  } catch (error) {
    console.error("Get cart error:", error);
    return { success: false, error: "Failed to fetch cart" };
  }
}

export async function addToCart(formData: FormData) {
  try {
    const user = await requireAuth();

    const raw = {
      productId: formData.get("productId") as string,
      quantity: Number(formData.get("quantity") || 1),
    };

    const validated = addToCartSchema.safeParse(raw);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message };
    }

    const { productId, quantity } = validated.data;

    // Verify product exists and has sufficient stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    if (!product.isActive) {
      return { success: false, error: "This product is no longer available" };
    }

    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { customerId: user.userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { customerId: user.userId },
      });
    }

    // Check if product already in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    const newQuantity = existingItem
      ? existingItem.quantity + quantity
      : quantity;

    if (newQuantity > product.stock) {
      return {
        success: false,
        error: `Only ${product.stock} items available in stock`,
      };
    }

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    revalidatePath("/cart");
    revalidatePath("/", "layout");

    return { success: true, data: { message: "Item added to cart" } };
  } catch (error) {
    console.error("Add to cart error:", error);
    return { success: false, error: "Failed to add item to cart" };
  }
}

export async function updateCartItem(formData: FormData) {
  try {
    const user = await requireAuth();

    const raw = {
      cartItemId: formData.get("cartItemId") as string,
      quantity: Number(formData.get("quantity")),
    };

    const validated = updateCartSchema.safeParse(raw);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message };
    }

    const { cartItemId, quantity } = validated.data;

    // Verify the cart item belongs to the user
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        cart: true,
        product: true,
      },
    });

    if (!cartItem || cartItem.cart.customerId !== user.userId) {
      return { success: false, error: "Cart item not found" };
    }

    if (quantity > cartItem.product.stock) {
      return {
        success: false,
        error: `Only ${cartItem.product.stock} items available in stock`,
      };
    }

    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });

    revalidatePath("/cart");
    revalidatePath("/", "layout");

    return { success: true, data: { message: "Cart updated" } };
  } catch (error) {
    console.error("Update cart item error:", error);
    return { success: false, error: "Failed to update cart item" };
  }
}

export async function removeCartItem(cartItemId: string) {
  try {
    const user = await requireAuth();

    // Verify the cart item belongs to the user
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.customerId !== user.userId) {
      return { success: false, error: "Cart item not found" };
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    revalidatePath("/cart");
    revalidatePath("/", "layout");

    return { success: true, data: { message: "Item removed from cart" } };
  } catch (error) {
    console.error("Remove cart item error:", error);
    return { success: false, error: "Failed to remove item from cart" };
  }
}

export async function clearCart() {
  try {
    const user = await requireAuth();

    const cart = await prisma.cart.findUnique({
      where: { customerId: user.userId },
    });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    revalidatePath("/cart");
    revalidatePath("/", "layout");

    return { success: true, data: { message: "Cart cleared" } };
  } catch (error) {
    console.error("Clear cart error:", error);
    return { success: false, error: "Failed to clear cart" };
  }
}

export async function getCartCount() {
  try {
    const user = await requireAuth();

    const cart = await prisma.cart.findUnique({
      where: { customerId: user.userId },
      include: {
        items: {
          select: { quantity: true },
        },
      },
    });

    if (!cart) {
      return { success: true, data: 0 };
    }

    const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    return { success: true, data: count };
  } catch (error) {
    console.error("Get cart count error:", error);
    return { success: false, error: "Failed to get cart count" };
  }
}
