import type { Change } from '$lib/ableton/types';
import { getWebSocketServer } from '$lib/server/websocket-server';
import type { WebSocket } from 'ws';

/**
 * Broadcasts a change message containing information about an update that is relevant to all connected clients.
 * This allows clients to stay in sync with the server.
 */
export function broadcastChange(msg: Change) {
	const wss = getWebSocketServer();
	wss.clients.forEach((client) => {
		client.send(JSON.stringify(msg));
	});
}

/**
 * Sends a change message containing information about an update to a single client.
 */
export function sendChange(msg: Change, client: WebSocket) {
	client.send(JSON.stringify(msg));
}
