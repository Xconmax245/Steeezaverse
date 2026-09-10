"use server";

import { getFilteredProducts, ShopFilterParams } from "@/lib/products";

export async function loadMoreProducts(params: ShopFilterParams) {
  try {
    const products = await getFilteredProducts(params);
    return { products, error: null };
  } catch (err: any) {
    console.error("Failed to load more products:", err);
    return { products: [], error: err.message };
  }
}
