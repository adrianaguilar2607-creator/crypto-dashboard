const crypto = require('crypto');

exports.handler = async function(event) {
  const key = process.env.BITGET_API_KEY;
  const secret = process.env.BITGET_SECRET_KEY;
  const pass = process.env.BITGET_PASSPHRASE;

  if (!key || !secret || !pass) {
    return {
      statusCode: 400,
      headers: {'Access-Control-Allow-Origin': '*'},
      body: JSON.stringify({error: 'Variables no configuradas'})
    };
  }

  const ts = Date.now().toString();
  const path = '/api/v2/mix/position/all-position';
  const qs = 'productType=COIN-FUTURES&marginCoin=';
  const msg = ts + 'GET' + path + '?' + qs;

  const sign = crypto
    .createHmac('sha256', secret)
    .update(msg)
    .digest('base64');

  try {
    const res = await fetch(
      'https://api.bitget.com' + path + '?' + qs,
      {
        headers: {
          'ACCESS-KEY': key,
          'ACCESS-SIGN': sign,
          'ACCESS-TIMESTAMP': ts,
          'ACCESS-PASSPHRASE': pass,
          'Content-Type': 'application/json'
        }
      }
    );
    const data = await res.json();
    return {
      statusCode: 200,
      headers: {'Access-Control-Allow-Origin': '*'},
      body: JSON.stringify(data)
    };
  } catch(e) {
    return {
      statusCode: 500,
      headers: {'Access-Control-Allow-Origin': '*'},
      body: JSON.stringify({error: e.message})
    };
  }
};
