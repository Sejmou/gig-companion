import type { ServerEvent } from '$lib/ableton/types/websocket-api/server/events';
import type { WebSocket } from 'ws';
import { broadcastChange, sendChange } from './out';

export function broadcastServerEvent(event: Omit<ServerEvent, 'type'>) {
	const msg: ServerEvent = {
		type: 'serverEvent',
		...event
	};
	broadcastChange(msg);
}

export function sendServerEvent(event: Omit<ServerEvent, 'type'>, client: WebSocket) {
	const msg: ServerEvent = {
		type: 'serverEvent',
		...event
	};
	sendChange(msg, client);
}
