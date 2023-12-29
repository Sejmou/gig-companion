// this file is run once on server start
// it creates a globalThis object with WebSocket Server (wss) and Ableton (ableton) instances
// the global wss and ableton are reused in server-related code
// I am deliberatly not putting the specific Ableton setup code here as this code is called in such a way that the $lib alias is not available
// The setup code is run at a later point in time, when the $lib alias is available, from src/hooks.server.ts
import { parse } from 'url';
import { WebSocketServer } from 'ws';
import type { IncomingMessage } from 'http';
import type { Duplex } from 'stream';
import { Ableton } from 'ableton-js';

const GlobalThisWSS = Symbol.for('sveltekit.wss');
const GlobalThisAbleton = Symbol.for('sveltekit.ableton');

export type ExtendedGlobal = typeof globalThis & {
	[GlobalThisWSS]: WebSocketServer;
	[GlobalThisAbleton]: Ableton;
};

export const onHttpServerUpgrade = (req: IncomingMessage, sock: Duplex, head: Buffer) => {
	const pathname = req.url ? parse(req.url).pathname : null;
	if (pathname !== '/websocket') return;

	const wss = (globalThis as ExtendedGlobal)[GlobalThisWSS];

	wss.handleUpgrade(req, sock, head, (ws) => {
		console.log('[handleUpgrade] creating new connection');
		wss.emit('connection', ws, req);
	});
};

export const createGlobalInstances = async () => {
	const wss = new WebSocketServer({ noServer: true });
	(globalThis as ExtendedGlobal)[GlobalThisWSS] = wss;

	const ableton = new Ableton({ logger: console });
	await ableton.start();
	(globalThis as ExtendedGlobal)[GlobalThisAbleton] = ableton;
};

export const getAbleton = () => (globalThis as ExtendedGlobal)[GlobalThisAbleton];
export const getWSS = () => (globalThis as ExtendedGlobal)[GlobalThisWSS];
