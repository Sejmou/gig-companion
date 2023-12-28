import { parse } from 'url';
import { WebSocketServer } from 'ws';
import type { IncomingMessage } from 'http';
import type { Duplex } from 'stream';
import { Ableton } from 'ableton-js';
// cannot use imports with $lib prefix here!
import {
	processClientAction,
	processClientPropUpdateRequest,
	setupSetUpdateListeners
} from './ableton';
import { isAction } from '../ableton/types/actions';
import { isPropUpdate } from '../ableton/types/prop-updates';

export const GlobalThisWSS = Symbol.for('sveltekit.wss');
export const GlobalThisAbleton = Symbol.for('sveltekit.ableton');

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
	setupSetUpdateListeners(ableton);

	wss.on('connection', (ws) => {
		console.log(`WebSocket client connected`);
		ws.on('message', (message) => {
			const data = JSON.parse(message.toString());
			console.log('Client message received', data);
			if (isPropUpdate(data)) processClientPropUpdateRequest(data);
			else if (isAction(data)) processClientAction(data);
			else console.warn('Unknown message received', data);
		});

		ws.on('close', () => {
			console.log(`WebSocket client disconnected`);
		});
	});

	return wss;
};
