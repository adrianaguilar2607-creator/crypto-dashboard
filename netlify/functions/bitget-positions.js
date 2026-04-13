const crypto = require('crypto');

exports.handler = async function(event) {
  const apiKey = process.env.BITGET_API_KEY;
  const secretKey = process.env.BITGET_SECRET_KEY;
  const passphrase = process.env.BITGET_PASSPHRASE;

  const timestamp = Date.now().toString();
  const method = 'GET';
  const path = '/api/v2/mix/position/all-position';
  const query = 'productType=COIN-FUTURES&marginCoin=';

  const prehash = timestamp + method + path + '?' + query;
  const sign = crypto
    .createHmac('sha256', secretKey)
    .update(prehash)
    .digest('base64');

  try {
    const res = await fetch(
      `https://api.bitget.com${path}?${query}`,
      {
        headers: {
          'ACCESS-KEY': apiKey,
          'ACCESS-SIGN': sign,
          'ACCESS-TIMESTAMP': timestamp,
          'ACCESS-PASSPHRASE': passphrase,
          'Content-Type': 'application/json',
          'locale': 'es-ES'
        }
      }
    );

    const data = await res.json();

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(data)
    };

  } catch(e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message })
    };
  }
};
