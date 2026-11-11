import { prisma } from "@/lib/db";
import { adminGetCategories } from "@/lib/actions/admin";
import { notFound } from "next/navigation";
import { ProductForm } from "../product-form";
import { DEMO_PRODUCTS } from "@/lib/demo-data";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let product: any = null;
  let categories: any[] = [];

  try {
    const [dbProduct, dbCategories] = await Promise.all([
      prisma.product.findUnique({
        where: { id },
      }),
      adminGetCategories(),
    ]);
    product = dbProduct;
    categories = dbCategories;
  } catch (error) {
    // Fall through to fallback
  }

  if (!categories || categories.length === 0) {
    categories = await adminGetCategories();
  }

  if (!product) {
    const demo = DEMO_PRODUCTS.find((p) => p.id === id || p.slug === id);
    if (demo) {
      product = {
        ...demo,
        price: demo.price,
      };
    }
  }

  if (!product) {
    notFound();
  }

  return (
    <ProductForm
      categories={categories}
      initialData={{
        id: product.id,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
        stock: product.stock,
        categoryId: product.categoryId,
        images: product.images,
        featured: product.featured,
        isActive: product.isActive,
      }}
    />
  );
}

