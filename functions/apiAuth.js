const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    const API_KEY = process.env.SHOP_API_KEY;
    const API_PASSWORD = process.env.SHOP_API_PASSWORD;
    const authToken = btoa(`${apiKey}:${apiPassword}`);
  
    return {
      statusCode: 200,
      body: JSON.stringify({
        apiKey: API_KEY,
        apiPassword: API_PASSWORD,
        apiToken: authToken
      }),
    };
  };