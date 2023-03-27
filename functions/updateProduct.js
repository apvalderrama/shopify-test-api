const fetch = require('node-fetch');

const getProductVariantId = async (productId) => {
    const apiKey = process.env.SHOP_API_KEY || '';
    const apiPassword = process.env.SHOP_API_PASSWORD || '';
    const authToken = Buffer.from(`${apiKey}:${apiPassword}`, 'utf8').toString('base64');
    const shopName = 'matter-design-dev-test';
    const url = `https://${shopName}.myshopify.com/admin/api/2023-01/graphql.json`;
  
    const query = `
      query($id: ID!) {
        product(id: $id) {
          variants(first: 1) {
            edges {
              node {
                id
              }
            }
          }
        }
      }
    `;
  
    const response = await fetch(url, {
      method: 'POST',
      headers: { "Content-Type": "application/json", "Authorization": `Basic ${authToken}` },
      body: JSON.stringify({
        query,
        variables: {
          id: `gid://shopify/Product/${productId}`,
        },
      }),
    });
  
    const data = await response.json();
  
    if (response.ok) {
        if (data.data.product && data.data.product.variants.edges.length > 0) {
          const variantId = data.data.product.variants.edges[0].node.id.split('/').pop();
          return variantId;
        } else {
          throw new Error('No product variants found for the given product ID');
        }
      } else {
        const errors = data.errors;
        const errorMessage = errors.map(error => `${error.message}`).join(', ');
        throw new Error(`Shopify error: ${errorMessage}`);
      }
    };

    const getInventoryLevelId = async (variantId) => {
        const apiKey = process.env.SHOP_API_KEY || '';
        const apiPassword = process.env.SHOP_API_PASSWORD || '';
        const authToken = Buffer.from(`${apiKey}:${apiPassword}`, 'utf8').toString('base64');
        const shopName = 'matter-design-dev-test';
        const url = `https://${shopName}.myshopify.com/admin/api/2023-01/graphql.json`;
      
        const query = `
          query($id: ID!) {
            productVariant(id: $id) {
              inventoryItem {
                inventoryLevels(first: 1) {
                  edges {
                    node {
                      id
                    }
                  }
                }
              }
            }
          }
        `;
      
        const response = await fetch(url, {
          method: 'POST',
          headers: { "Content-Type": "application/json", "Authorization": `Basic ${authToken}` },
          body: JSON.stringify({
            query,
            variables: {
              id: `gid://shopify/ProductVariant/${variantId}`,
            },
          }),
        });
      
        const data = await response.json();
      
        if (response.ok) {
          const inventoryLevelId = data.data.productVariant.inventoryItem.inventoryLevels.edges[0].node.id;
          return inventoryLevelId;
        } else {
          const errors = data.errors;
          const errorMessage = errors.map(error => `${error.message}`).join(', ');
          throw new Error(`Shopify error: ${errorMessage}`);
        }
      };

      const updateProductGQL = async (productId, variantId, price, inventory, inventoryLevelId) => {
        const apiKey = process.env.SHOP_API_KEY || '';
        const apiPassword = process.env.SHOP_API_PASSWORD || '';
        const authToken = Buffer.from(`${apiKey}:${apiPassword}`, 'utf8').toString('base64');
        const shopName = 'matter-design-dev-test';
        const url = `https://${shopName}.myshopify.com/admin/api/2023-01/graphql.json`;
      
        const updateVariantMutation = `
          mutation UpdateVariant($variantInput: ProductVariantInput!) {
            productVariantUpdate(input: $variantInput) {
              productVariant {
                id
                price
              }
              userErrors {
                field
                message
              }
            }
          }
        `;
      
        const updateInventoryMutation = `
          mutation UpdateInventory($inventoryAdjustInput: InventoryAdjustQuantityInput!) {
            inventoryAdjustQuantity(input: $inventoryAdjustInput) {
              inventoryLevel {
                available
              }
              userErrors {
                field
                message
              }
            }
          }
        `;
      
        // Update the variant price if price is provided
        if (price !== null) {
          const variantResponse = await fetch(url, {
            method: 'POST',
            headers: { "Content-Type": "application/json", "Authorization": `Basic ${authToken}` },
            body: JSON.stringify({
              query: updateVariantMutation,
              variables: {
                variantInput: {
                  id: `gid://shopify/ProductVariant/${variantId}`,
                  price: price,
                },
              },
            }),
          });
      
          const variantData = await variantResponse.json();
      
          if (!variantResponse.ok) {
            const userErrors = variantData.data.productVariantUpdate.userErrors;
            const errorMessage = userErrors.map(error => `${error.field}: ${error.message}`).join(', ');
            throw new Error(`Shopify error: ${errorMessage}`);
          }
        }
      
        // Update the inventory level if inventory is provided
        if (inventory !== null) {
          const inventoryResponse = await fetch(url, {
            method: 'POST',
            headers: { "Content-Type": "application/json", "Authorization": `Basic ${authToken}` },
            body: JSON.stringify({
              query: updateInventoryMutation,
              variables: {
                inventoryAdjustInput: {
                  inventoryLevelId: inventoryLevelId,
                  availableDelta: parseInt(inventory, 10),
                },
              },
            }),
          });
      
          const inventoryData = await inventoryResponse.json();
      
          if (!inventoryResponse.ok) {
            const userErrors = inventoryData.data.inventoryAdjustQuantity.userErrors;
            const errorMessage = userErrors.map(error => `${error.field}: ${error.message}`).join(', ');
            throw new Error(`Shopify error: ${errorMessage}`);
          }
        }
      
        // Get the updated product variant information
        const getUpdatedVariantQuery = `
          query GetUpdatedVariant($id: ID!) {
            productVariant(id: $id) {
              id
              price
            }
          }
        `;
      
        const updatedVariantResponse = await fetch(url, {
          method: 'POST',
          headers: { "Content-Type": "application/json", "Authorization": `Basic ${authToken}` },
          body: JSON.stringify({
            query: getUpdatedVariantQuery,
            variables: {
              id: `gid://shopify/ProductVariant/${variantId}`,
            },
          }),
        });
      
        const updatedVariantData = await updatedVariantResponse.json();
      
        if (updatedVariantResponse.ok) {
            const updatedProductVariant = updatedVariantData.data.productVariant;
            return updatedProductVariant;
          } else {
            const errors = updatedVariantData.errors.map(error => error.message).join(', ');
            throw new Error(`Shopify error: ${errors}`);
          }
        };
      
      
      
        exports.handler = async function (event, context) {
            try {
              const { productId, price, inventory } = JSON.parse(event.body);
              const variantId = await getProductVariantId(productId);
              const inventoryLevelId = await getInventoryLevelId(variantId);
          
              // If you want to update the price, pass it as a parameter to the updateProductGQL function
              const updatedProduct = await updateProductGQL(productId, variantId, price, inventory, inventoryLevelId);
          
              return {
                statusCode: 200,
                body: JSON.stringify(updatedProduct),
              };
            } catch (error) {
              console.error('Error in updateProduct function:', error);
              return {
                statusCode: 500,
                body: `Error: ${error.message}`,
              };
            }
          };