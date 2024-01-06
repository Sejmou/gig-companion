// this file is imported for the first time on server start, BEFORE SvelteKit really 'starts up'
// on first import, a new WebSocketServer is created, hooked up w/ the HTTP server
// additionally, a reference to the WebSocket Server is stored in the globalThis object
// this global reference is also used via the getWebSocketServer function by any other server-side code that needs to communicate w/ clients
import { parse } from 'url';
import { WebSocketServer } from 'ws';
import type { IncomingMessage } from 'http';
import type { Duplex } from 'stream';

const GlobalThisWSS = Symbol.for('sveltekit.wss');

type ExtendedGlobal = typeof globalThis & {
	[GlobalThisWSS]?: WebSocketServer;
};

export const onHttpServerUpgrade = (req: IncomingMessage, sock: Duplex, head: Buffer) => {
	const pathname = req.url ? parse(req.url).pathname : null;
	if (pathname !== '/websocket') return;

	console.log('[onHttpServerUpgrade] creating new connection');

	const wss = getWebSocketServer();

	wss.handleUpgrade(req, sock, head, (ws) => {
		console.log('[handleUpgrade] creating new connection');
		wss.emit('connection', ws, req);
	});
};

export const getWebSocketServer = () => {
	const wss = (globalThis as ExtendedGlobal)[GlobalThisWSS];
	if (wss) return wss;
	const newWSS = new WebSocketServer({ noServer: true });
	(globalThis as ExtendedGlobal)[GlobalThisWSS] = newWSS;
	return newWSS;
};
