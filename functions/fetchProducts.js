import { apiAuth } from './apiAuth.js';

export async function fetchProducts(page = 1, limit = 50) {
  const credentials = await apiAuth();
  const shopName = 'matter-design-dev-test';
  const url = `https://${shopName}.myshopify.com/admin/api/2023-01/products.json?page=${page}&limit=${limit}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Basic ${credentials.authToken}`
    },
  });

  if (response.ok) {
    const data = await response.json();
    return data.products;
  } else {
    throw new Error(`Shopify error: ${response.statusText}`);
  }
}
