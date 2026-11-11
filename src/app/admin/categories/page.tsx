import { adminGetCategories } from "@/lib/actions/admin";
import { CategoryManager } from "./category-manager";

export default async function AdminCategoriesPage() {
  const categories = await adminGetCategories();
  return <CategoryManager initialCategories={categories} />;
}

