const fetch = require("node-fetch");

exports.handler = async (event) => {
  const { productId, price, inventory } = JSON.parse(event.body);
  const apiKey = process.env.API_KEY;
  const apiPassword = process.env.API_PASSWORD;
  const shopName = "matter-design-dev-test";
  const url = `https://${shopName}.myshopify.com/admin/api/2023-01/products/${productId}.json`;

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": Buffer.from(`${apiKey}:${apiPassword}`).toString("base64"),
      },
      body: JSON.stringify({
        product: {
          variants: [
            {
              price: price,
              inventory_quantity: inventory,
            },
          ],
        },
      }),
    });

    if (response.ok) {
      const result = await response.json();
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: `Product ${productId} updated successfully.`,
          result,
        }),
      };
    } else {
      const error = await response.json();
      throw new Error(`Product ${productId} update error.`);
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};