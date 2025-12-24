import { Server } from './.svelte-kit/output/server/index.js';
import { manifest } from './.svelte-kit/output/server/manifest.js';
import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = new Server(manifest);

await server.init({
	env: process.env
});

// MIME types for static files
const mimeTypes = {
	'.css': 'text/css',
	'.js': 'application/javascript',
	'.json': 'application/json',
	'.txt': 'text/plain',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.ico': 'image/x-icon'
};

const httpServer = createServer(async (req, res) => {
	try {
		const url = new URL(req.url, `http://${req.headers.host}`);

		// Handle static assets
		if (url.pathname.startsWith('/_app/')) {
			const filePath = join(__dirname, '.svelte-kit/output/client', url.pathname);
			if (existsSync(filePath)) {
				const ext = extname(filePath);
				const mimeType = mimeTypes[ext] || 'application/octet-stream';
				res.writeHead(200, { 'Content-Type': mimeType });
				res.end(readFileSync(filePath));
				return;
			}
		}

		// Handle robots.txt
		if (url.pathname === '/robots.txt') {
			const filePath = join(__dirname, '.svelte-kit/output/client/robots.txt');
			if (existsSync(filePath)) {
				res.writeHead(200, { 'Content-Type': 'text/plain' });
				res.end(readFileSync(filePath));
				return;
			}
		}

		// Convert Node.js request to Web API Request
		const headers = new Headers();
		for (const [key, value] of Object.entries(req.headers)) {
			if (Array.isArray(value)) {
				headers.set(key, value.join(', '));
			} else if (value) {
				headers.set(key, value);
			}
		}

		// Handle request body for POST requests
		let body = undefined;
		if (req.method !== 'GET' && req.method !== 'HEAD') {
			const chunks = [];
			for await (const chunk of req) {
				chunks.push(chunk);
			}
			body = Buffer.concat(chunks);
		}

		const request = new Request(url, {
			method: req.method,
			headers,
			body
		});

		const response = await server.respond(request);

		// Set status and headers
		res.statusCode = response.status;
		for (const [key, value] of response.headers) {
			res.setHeader(key, value);
		}

		// Handle the response body
		if (response.body) {
			const body = await response.text();
			res.end(body);
		} else {
			res.end();
		}
	} catch (error) {
		console.error('Server error:', error);
		res.writeHead(500, { 'Content-Type': 'text/plain' });
		res.end('Internal Server Error');
	}
});

const port = parseInt(process.env.PORT || '3000');
const host = process.env.HOST || '0.0.0.0';

httpServer.listen(port, host, () => {
	console.log(`Server listening on http://${host}:${port}`);
});