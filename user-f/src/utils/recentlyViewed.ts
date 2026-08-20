import { Product } from "@/data/products";

const RECENTLY_VIEWED_KEY = "recently_viewed_products";
const MAX_ITEMS = 12;

export const getRecentlyViewed = (): Product[] => {
  try {
    const data = localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to read recently viewed products:", error);
    return [];
  }
};

export const addRecentlyViewed = (product: Product): void => {
  if (!product || (!product.id && !(product as any)._id)) return;

  try {
    const id = product.id || (product as any)._id;
    const list = getRecentlyViewed();

    // Filter out duplicate if already in list
    const filtered = list.filter((p) => (p.id || (p as any)._id) !== id);

    // Unshift new product to front
    const updated = [product, ...filtered].slice(0, MAX_ITEMS);

    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save recently viewed product:", error);
  }
};

export const clearRecentlyViewed = (): void => {
  try {
    localStorage.removeItem(RECENTLY_VIEWED_KEY);
  } catch (error) {
    console.error("Failed to clear recently viewed products:", error);
  }
};
