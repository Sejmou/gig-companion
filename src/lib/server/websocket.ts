// this file is run for the first time on server start, BEFORE SvelteKit really 'starts up'
// it configures the WebSocket Server that is used for communication between the clients and the (SvelteKit) server
// the actual server/client communication code related to Ableton is located in src/lib/server/ableton
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

	const wss = getWSS();

	wss.handleUpgrade(req, sock, head, (ws) => {
		console.log('[handleUpgrade] creating new connection');
		wss.emit('connection', ws, req);
	});
};

export const getWSS = () => {
	const wss = (globalThis as ExtendedGlobal)[GlobalThisWSS];
	if (wss) return wss;
	const newWSS = new WebSocketServer({ noServer: true });
	(globalThis as ExtendedGlobal)[GlobalThisWSS] = newWSS;
	return newWSS;
};
