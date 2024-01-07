import type { ClientEvent } from '$lib/types/client-events';
import type { ServerEvent } from '$lib/types/server-events';
import type { StateSnapshotMessage, StateUpdateMessage } from '$lib/types/ableton/server';
import type { ClientActionMessage } from '$lib/types/ableton/client';
import { getWebSocketServer } from '$lib/server/websocket-server';
import type { WebSocket } from 'ws';

type ServerMessage = StateSnapshotMessage | StateUpdateMessage | ServerEvent;

/**
 * Broadcasts a message to all connected clients
 */
export function broadcast(msg: ServerMessage) {
	const wss = getWebSocketServer();
	const msgString = JSON.stringify(msg);
	for (const client of wss.clients) {
		client.send(msgString);
	}
}

/**
 * Sends a message to a single client
 */
export function send(client: WebSocket, msg: ServerMessage) {
	const msgString = JSON.stringify(msg);
	client.send(msgString);
}

/**
 * Parses an incoming message sent by a client
 */
export function parseClientMessage(msg: string): ClientActionMessage | ClientEvent | null {
	try {
		const parsed = JSON.parse(msg);
		return parsed;
	} catch (e) {
		console.error('Failed to parse client message', msg);
		return null;
	}
}
