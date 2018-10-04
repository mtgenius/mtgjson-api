const http = require('http');
const url = require('url');
const cards = require('./constants/cards');
const checkForUpdates = require('./constants/check-for-updates');

const TWELVE_HOURS_S = 60 * 60 * 12;
const TWELVE_HOURS_MS = TWELVE_HOURS_S * 1000;

// Check for set updates every 12 hours.
setInterval(checkForUpdates, TWELVE_HOURS_MS);

const headers = {
  'Access-Control-Allow-Methods': 'GET',
  'Access-Control-Allow-Origin': process.env.ACCESS_CONTROL_ALLOW_ORIGIN,
  'Content-Type': 'application/json; charset=utf-8'
};

// Start the server.
http.createServer((request, response) => {
  const query = url.parse(request.url).query;
  if (/^q=./.test(query)) {
    const q = query.substring(2).toLowerCase();
    const found = [];
    for (const card of cards) {
      if (card.name.toLowerCase().indexOf(q) !== -1) {
        found.push(card);
        if (found.length === 5) {
          break;
        }
      }
    }
    response.writeHead(200, {
      ...headers,
      'Cache-Control': 'max-age=' + TWELVE_HOURS_S + ', public',
      'Expires': new Date(Date.now() + TWELVE_HOURS_MS).toUTCString()
    });
    response.write(JSON.stringify(found));
    response.end();
  }
  else {
    response.writeHead(404, {
      ...headers,
      'Cache-Control': 'max-age=' + TWELVE_HOURS_S + ', public',
      'Expires': new Date(Date.now() + TWELVE_HOURS_MS).toUTCString()
    });
    response.write('/* 404 */');
    response.end();
  }
})
  .listen(80, () => {
    console.log('Listening on port 80.');
  });
