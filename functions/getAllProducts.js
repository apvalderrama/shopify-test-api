import { fetchProducts } from './fetchProducts.js';

function createTableRows(products) {
  let rows = '';

  products.forEach(product => {
    rows += `
      <tr class="bg-gray-100 border-b">
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${product.id}</td>
        <td class="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">${product.title}</td>
        <td class="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">${product.product_type}</td>
        <td class="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">${product.handle}</td>
      </tr>`;
  });

  return rows;
}

export async function getAllProducts(page = 1, limit = 50) {
  let allProducts = [];
  let currentPage = page;
  let hasNextPage = true;

  while (hasNextPage) {
    try {
      const products = await fetchProducts(currentPage, limit);
      allProducts.push(...products);
      currentPage++;
      hasNextPage = products.length > 0;
    } catch (error) {
      console.error('Error:', error);
      hasNextPage = false;
    }
  }

  const tableRows = createTableRows(allProducts);
  document.querySelector('tbody').innerHTML = tableRows;
}
