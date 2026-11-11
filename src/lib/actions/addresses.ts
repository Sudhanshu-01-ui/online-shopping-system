"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { addressSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function getAddresses() {
  try {
    const user = await requireAuth();

    const addresses = await prisma.address.findMany({
      where: { customerId: user.userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return { success: true, data: addresses };
  } catch (error) {
    console.error("Get addresses error:", error);
    return { success: false, error: "Failed to fetch addresses" };
  }
}

export async function addAddress(formData: FormData) {
  try {
    const user = await requireAuth();

    const raw = {
      label: formData.get("label") as string,
      fullName: formData.get("fullName") as string,
      phone: formData.get("phone") as string,
      addressLine1: formData.get("addressLine1") as string,
      addressLine2: (formData.get("addressLine2") as string) || undefined,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      pincode: formData.get("pincode") as string,
      isDefault: formData.get("isDefault") === "true",
    };

    const validated = addressSchema.safeParse(raw);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message };
    }

    const data = validated.data;

    // If setting as default, unset other defaults
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { customerId: user.userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // If this is the first address, make it default
    const existingCount = await prisma.address.count({
      where: { customerId: user.userId },
    });

    const address = await prisma.address.create({
      data: {
        customerId: user.userId,
        label: data.label,
        fullName: data.fullName,
        phone: data.phone,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 || null,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        isDefault: data.isDefault || existingCount === 0,
      },
    });

    revalidatePath("/account/addresses");
    revalidatePath("/checkout");

    return { success: true, data: address };
  } catch (error) {
    console.error("Add address error:", error);
    return { success: false, error: "Failed to add address" };
  }
}

export async function updateAddress(id: string, formData: FormData) {
  try {
    const user = await requireAuth();

    // Verify ownership
    const existing = await prisma.address.findUnique({
      where: { id },
    });

    if (!existing || existing.customerId !== user.userId) {
      return { success: false, error: "Address not found" };
    }

    const raw = {
      label: formData.get("label") as string,
      fullName: formData.get("fullName") as string,
      phone: formData.get("phone") as string,
      addressLine1: formData.get("addressLine1") as string,
      addressLine2: (formData.get("addressLine2") as string) || undefined,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      pincode: formData.get("pincode") as string,
      isDefault: formData.get("isDefault") === "true",
    };

    const validated = addressSchema.safeParse(raw);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message };
    }

    const data = validated.data;

    // If setting as default, unset other defaults
    if (data.isDefault && !existing.isDefault) {
      await prisma.address.updateMany({
        where: { customerId: user.userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id },
      data: {
        label: data.label,
        fullName: data.fullName,
        phone: data.phone,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 || null,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        isDefault: data.isDefault ?? existing.isDefault,
      },
    });

    revalidatePath("/account/addresses");
    revalidatePath("/checkout");

    return { success: true, data: address };
  } catch (error) {
    console.error("Update address error:", error);
    return { success: false, error: "Failed to update address" };
  }
}

export async function deleteAddress(id: string) {
  try {
    const user = await requireAuth();

    // Verify ownership
    const address = await prisma.address.findUnique({
      where: { id },
    });

    if (!address || address.customerId !== user.userId) {
      return { success: false, error: "Address not found" };
    }

    // Check if address is used in any orders
    const orderCount = await prisma.order.count({
      where: { addressId: id },
    });

    if (orderCount > 0) {
      return {
        success: false,
        error: "Cannot delete this address because it is associated with existing orders",
      };
    }

    await prisma.address.delete({
      where: { id },
    });

    // If deleted address was default, set another as default
    if (address.isDefault) {
      const nextDefault = await prisma.address.findFirst({
        where: { customerId: user.userId },
        orderBy: { createdAt: "desc" },
      });

      if (nextDefault) {
        await prisma.address.update({
          where: { id: nextDefault.id },
          data: { isDefault: true },
        });
      }
    }

    revalidatePath("/account/addresses");
    revalidatePath("/checkout");

    return { success: true, data: { message: "Address deleted" } };
  } catch (error) {
    console.error("Delete address error:", error);
    return { success: false, error: "Failed to delete address" };
  }
}

export async function setDefaultAddress(id: string) {
  try {
    const user = await requireAuth();

    // Verify ownership
    const address = await prisma.address.findUnique({
      where: { id },
    });

    if (!address || address.customerId !== user.userId) {
      return { success: false, error: "Address not found" };
    }

    // Unset all defaults for this user
    await prisma.address.updateMany({
      where: { customerId: user.userId, isDefault: true },
      data: { isDefault: false },
    });

    // Set new default
    await prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });

    revalidatePath("/account/addresses");
    revalidatePath("/checkout");

    return { success: true, data: { message: "Default address updated" } };
  } catch (error) {
    console.error("Set default address error:", error);
    return { success: false, error: "Failed to set default address" };
  }
}
