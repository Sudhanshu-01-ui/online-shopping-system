import { adminGetCategories } from "@/lib/actions/admin";
import { ProductForm } from "../product-form";

export default async function NewProductPage() {
  const categories = await adminGetCategories();
  return <ProductForm categories={categories} />;
}

