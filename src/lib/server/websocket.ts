import { parse } from 'url';
import { WebSocketServer } from 'ws';
import type { IncomingMessage } from 'http';
import type { Duplex } from 'stream';
import { Ableton } from 'ableton-js';

export const GlobalThisWSS = Symbol.for('sveltekit.wss');

export type ExtendedGlobal = typeof globalThis & {
	[GlobalThisWSS]: WebSocketServer;
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

export const createWSSGlobalInstance = async () => {
	const wss = new WebSocketServer({ noServer: true });

	(globalThis as ExtendedGlobal)[GlobalThisWSS] = wss;

	const ableton = await new Ableton({ logger: console });
	await ableton.start();

	ableton.song.addListener('is_playing', (is_playing) => {
		broadcast(JSON.stringify({ is_playing }));
	});

	wss.on('connection', (ws) => {
		console.log(`WebSocket client connected`);
		ws.on('message', (message) => {
			const data = JSON.parse(message.toString());
			console.log('Client message received', data);
			if (data.is_playing !== undefined) {
				ableton.song.set('is_playing', data.is_playing);
			}
		});

		ws.on('close', () => {
			console.log(`WebSocket client disconnected`);
		});
	});

	return wss;
};

function broadcast(message: string) {
	const wss = (globalThis as ExtendedGlobal)[GlobalThisWSS];
	wss.clients.forEach((client) => {
		client.send(message);
	});
}
