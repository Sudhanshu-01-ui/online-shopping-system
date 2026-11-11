import { z } from "zod";

// ─── AUTH ───────────────────────────────────────────────

export const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ─── ADDRESS ────────────────────────────────────────────

export const addressSchema = z.object({
  label: z.string().min(1, "Label is required"),
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  isDefault: z.boolean().optional(),
});

// ─── PRODUCT ────────────────────────────────────────────

export const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be greater than zero"),
  comparePrice: z.number().positive().optional().nullable(),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  categoryId: z.string().min(1, "Category is required"),
  images: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

// ─── CATEGORY ───────────────────────────────────────────

export const categorySchema = z.object({
  name: z.string().min(2, "Category name is required"),
  description: z.string().optional(),
  image: z.string().optional(),
});

// ─── CART ───────────────────────────────────────────────

export const addToCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().positive("Quantity must be greater than zero"),
});

export const updateCartSchema = z.object({
  cartItemId: z.string().min(1, "Cart item ID is required"),
  quantity: z.number().int().positive("Quantity must be greater than zero"),
});

// ─── ORDER ──────────────────────────────────────────────

export const checkoutSchema = z.object({
  addressId: z.string().min(1, "Delivery address is required"),
  paymentMethod: z.enum(["CREDIT_CARD", "DEBIT_CARD", "UPI", "NET_BANKING", "CASH_ON_DELIVERY"]),
  notes: z.string().optional(),
});

// ─── ADMIN ──────────────────────────────────────────────

export const updateOrderStatusSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

export const updateDeliverySchema = z.object({
  deliveryId: z.string().min(1),
  status: z.enum(["PENDING", "SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "RETURNED"]),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
});

export const updatePaymentStatusSchema = z.object({
  paymentId: z.string().min(1),
  status: z.enum(["PENDING", "SUCCESS", "FAILED"]),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartInput = z.infer<typeof updateCartSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;

