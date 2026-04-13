const crypto = require(‘crypto’);

exports.handler = async function(event, context) {

const apiKey     = process.env.BITGET_API_KEY;
const secretKey  = process.env.BITGET_SECRET_KEY;
const passphrase = process.env.BITGET_PASSPHRASE;

// CORS preflight
if (event.httpMethod === ‘OPTIONS’) {
return {
statusCode: 200,
headers: {
‘Access-Control-Allow-Origin’: ‘*’,
‘Access-Control-Allow-Headers’: ’*’,
‘Access-Control-Allow-Methods’: ‘GET, OPTIONS’
},
body: ‘’
};
}

if (!apiKey || !secretKey || !passphrase) {
return {
statusCode: 400,
headers: { ‘Access-Control-Allow-Origin’: ‘*’ },
body: JSON.stringify({
error: ‘Variables de entorno no configuradas’,
hasKey: !!apiKey,
hasSecret: !!secretKey,
hasPass: !!passphrase
})
};
}

try {
const timestamp  = Date.now().toString();
const method     = ‘GET’;
const path       = ‘/api/v2/mix/position/all-position’;
const queryStr   = ‘productType=COIN-FUTURES&marginCoin=’;
const prehash    = timestamp + method + path + ‘?’ + queryStr;

```
const signature  = crypto
  .createHmac('sha256', secretKey)
  .update(prehash)
  .digest('base64');

const url = `https://api.bitget.com${path}?${queryStr}`;

const response = await fetch(url, {
  method: 'GET',
  headers: {
    'ACCESS-KEY':        apiKey,
    'ACCESS-SIGN':       signature,
    'ACCESS-TIMESTAMP':  timestamp,
    'ACCESS-PASSPHRASE': passphrase,
    'Content-Type':      'application/json',
    'locale':            'es-ES'
  }
});

const data = await response.json();

return {
  statusCode: 200,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
};
```

} catch (err) {
return {
statusCode: 500,
headers: { ‘Access-Control-Allow-Origin’: ‘*’ },
body: JSON.stringify({ error: err.message })
};
}
};