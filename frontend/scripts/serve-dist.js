const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 8080;
const dist = path.join(__dirname, '..', 'dist');

const mime = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(dist, reqPath);

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    // SPA fallback to index.html
    const indexPath = path.join(dist, 'index.html');
    fs.readFile(indexPath, (e, data) => {
      if (e) {
        res.writeHead(500);
        res.end('Index not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Static server serving ${dist} at http://127.0.0.1:${port}`);
});

process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});
