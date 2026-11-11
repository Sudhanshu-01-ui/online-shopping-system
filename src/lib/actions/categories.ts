"use server";

import { prisma } from "@/lib/db";
import { DEMO_CATEGORIES } from "@/lib/demo-data";

export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return categories;
  } catch (error) {
    return DEMO_CATEGORIES;
  }
}

export async function getCategoryBySlug(slug: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return category;
  } catch (error) {
    const demo = DEMO_CATEGORIES.find((c) => c.slug === slug);
    return demo || null;
  }
}
