// netlify/functions/gate-redirect.js
const DEFAULT_TARGET = "https://t.me/+sIo59FG8Jlw3ZTY0";
exports.handler = async (event, context) => {
  const headers = event.headers || {};
  const ua = (headers['user-agent'] || headers['User-Agent'] || '').toLowerCase();
  const method = (event.httpMethod || 'GET').toUpperCase();
  const target = process.env.TARGET_URL || DEFAULT_TARGET;

  console.log('gate-redirect invoked. method=' + method + ' ua=' + ua);
  console.log('request headers:', JSON.stringify(headers));

  if (method === 'HEAD') {
    return {
      statusCode: 204,
      headers: {
        'cache-control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'x-blocked-by': 'gate-redirect-no-preview'
      },
      body: ''
    };
  }

  const scrapers = [
    'whatsapp', 'whatsappimageproxy', 'facebookexternalhit', 'facebot', 'facebook',
    'twitterbot', 'linkedinbot', 'slackbot', 'telegrambot', 'discord',
    'preview', 'curl', 'python-requests', 'httpclient', 'okhttp', 'axios',
    'bingbot', 'yandex', 'pinterest', 'bingpreview', 'embed', 'previewer'
  ];

  if (!ua || ua.length < 8) {
    console.log('UA missing or short -> blocking preview');
    return {
      statusCode: 204,
      headers: {
        'cache-control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'x-blocked-by': 'gate-redirect-no-preview-ua-missing'
      },
      body: ''
    };
  }

  for (const s of scrapers) {
    if (ua.includes(s)) {
      console.log('Matched scraper substring:', s);
      return {
        statusCode: 204,
        headers: {
          'cache-control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'x-blocked-by': 'gate-redirect-no-preview-matched-' + s.replace(/[^a-z0-9]/g,'')
        },
        body: ''
      };
    }
  }

  return {
    statusCode: 302,
    headers: {
      Location: target,
      'cache-control': 'no-cache, no-store, must-revalidate'
    },
    body: ''
  };
};
