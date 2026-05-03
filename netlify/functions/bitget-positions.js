const crypto = require('crypto');

const BASE = 'https://api.bitget.com';

function sign(secret, ts, method, path, qs = '') {
  const msg = ts + method + path + (qs ? '?' + qs : '');
  return crypto.createHmac('sha256', secret).update(msg).digest('base64');
}

function makeHeaders(key, secret, pass, ts, method, path, qs = '') {
  return {
    'ACCESS-KEY': key,
    'ACCESS-SIGN': sign(secret, ts, method, path, qs),
    'ACCESS-TIMESTAMP': ts,
    'ACCESS-PASSPHRASE': pass,
    'Content-Type': 'application/json',
    'locale': 'en-US'
  };
}

async function fetchBitget(key, secret, pass, path, qs = '') {
  const ts = Date.now().toString();
  const url = BASE + path + (qs ? '?' + qs : '');
  const res = await fetch(url, {
    headers: makeHeaders(key, secret, pass, ts, 'GET', path, qs)
  });
  return res.json();
}

exports.handler = async function (event) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  const key    = process.env.BITGET_API_KEY;
  const secret = process.env.BITGET_SECRET_KEY;
  const pass   = process.env.BITGET_PASSPHRASE;

  if (!key || !secret || !pass) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Variables de entorno no configuradas' }) };
  }

  const ep = (event.queryStringParameters || {}).endpoint || 'positions';

  try {
    let data;

    if (ep === 'positions') {
      data = await fetchBitget(key, secret, pass,
        '/api/v2/mix/position/all-position',
        'productType=USDT-FUTURES&marginCoin=USDT'
      );

    } else if (ep === 'balance') {
      data = await fetchBitget(key, secret, pass,
        '/api/v2/mix/account/accounts',
        'productType=USDT-FUTURES'
      );

    } else if (ep === 'history') {
      const endTime = Date.now();
      const startTime = endTime - 90 * 24 * 60 * 60 * 1000;
      data = await fetchBitget(key, secret, pass,
        '/api/v2/mix/order/orders-history',
        `productType=USDT-FUTURES&startTime=${startTime}&endTime=${endTime}&limit=100`
      );

    } else {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Endpoint no valido' }) };
    }

    return { statusCode: 200, headers: cors, body: JSON.stringify(data) };

  } catch (e) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: e.message }) };
  }
};
