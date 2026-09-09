// Shared revalidation tags for the public cached routes. Route handlers may
// only export handlers/config, so these live here for both sides of the
// revalidation contract.
export const MINI_SHOP_TAG = 'mini-shop';
export const LOOKBOOK_TAG = 'lookbook';
export const PRODUCTS_TAG = 'products';

export const ALLOWED_CACHE_TAGS = new Set([MINI_SHOP_TAG, LOOKBOOK_TAG, PRODUCTS_TAG]);
