"use server";

import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { DEMO_PRODUCTS } from "@/lib/demo-data";

interface GetProductsParams {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export async function getProducts(params: GetProductsParams = {}) {
  const { search, category, minPrice, maxPrice, sort, page = 1, limit = 12 } = params;
  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = { isActive: true };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (category) {
    where.category = { slug: category };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined && !isNaN(minPrice)) where.price.gte = minPrice;
    if (maxPrice !== undefined && !isNaN(maxPrice)) where.price.lte = maxPrice;
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "price-asc") orderBy = { price: "asc" };
  else if (sort === "price-desc") orderBy = { price: "desc" };
  else if (sort === "name") orderBy = { name: "asc" };
  else if (sort === "newest") orderBy = { createdAt: "desc" };

  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy,
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
      pages: Math.ceil(total / limit) || 1,
      page,
    };
  } catch (error) {
    // Graceful fallback to rich demo catalog if PostgreSQL service is not started
    let filtered = [...DEMO_PRODUCTS];
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
    if (category) {
      filtered = filtered.filter((p) => p.category.slug === category);
    }
    if (minPrice !== undefined && !isNaN(minPrice)) {
      filtered = filtered.filter((p) => p.price >= minPrice);
    }
    if (maxPrice !== undefined && !isNaN(maxPrice)) {
      filtered = filtered.filter((p) => p.price <= maxPrice);
    }
    if (sort === "price-asc") filtered.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") filtered.sort((a, b) => b.price - a.price);
    else if (sort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));

    const total = filtered.length;
    const paged = filtered.slice(skip, skip + limit);

    return {
      products: paged,
      total,
      pages: Math.ceil(total / limit) || 1,
      page,
    };
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { category: true },
    });

    if (!product) return null;

    return {
      ...product,
      price: Number(product.price),
      comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      rating: Number(product.rating),
    };
  } catch (error) {
    const demo = DEMO_PRODUCTS.find((p) => p.slug === slug);
    return demo || null;
  }
}

export async function getFeaturedProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, featured: true },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    });

    return products.map((p) => ({
      ...p,
      price: Number(p.price),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
      rating: Number(p.rating),
    }));
  } catch (error) {
    return DEMO_PRODUCTS.filter((p) => p.featured).slice(0, 8);
  }
}

export async function getNewArrivals() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    });

    return products.map((p) => ({
      ...p,
      price: Number(p.price),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
      rating: Number(p.rating),
    }));
  } catch (error) {
    return DEMO_PRODUCTS.slice(0, 8);
  }
}

export async function getRelatedProducts(categoryId: string, excludeId: string) {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, categoryId, id: { not: excludeId } },
      include: { category: true },
      orderBy: { rating: "desc" },
      take: 4,
    });

    return products.map((p) => ({
      ...p,
      price: Number(p.price),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
      rating: Number(p.rating),
    }));
  } catch (error) {
    return DEMO_PRODUCTS.filter((p) => p.id !== excludeId).slice(0, 4);
  }
}
