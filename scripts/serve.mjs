// Serves site/ under the same sub-path GitHub Pages uses.
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../site/', import.meta.url));
const BASE = '/dual-wallet-prototype/';
const PORT = Number(process.env.PORT ?? 4173);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8',
};

createServer(async (request, response) => {
  try {
    const { pathname } = new URL(request.url, 'http://localhost');
    if (pathname === '/') return response.writeHead(302, { location: BASE }).end();
    if (!pathname.startsWith(BASE)) return response.writeHead(404).end('Not found');
    const file = normalize(join(ROOT, decodeURIComponent(pathname.slice(BASE.length)) || 'index.html'));
    if (!file.startsWith(ROOT.endsWith(sep) ? ROOT : ROOT + sep)) return response.writeHead(403).end();
    const body = await readFile(file);
    return response.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' }).end(body);
  } catch {
    return response.writeHead(404).end('Not found');
  }
}).listen(PORT, '127.0.0.1', () => console.log(`http://127.0.0.1:${PORT}${BASE}`));
