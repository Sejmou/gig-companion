import type { ServerEvent } from '$lib/types/server-events';
import type { WebSocket } from 'ws';
import { broadcast, send } from './ws-client-communication';

export function broadcastServerEvent(event: Omit<ServerEvent, 'type'>) {
	const msg: ServerEvent = {
		type: 'serverEvent',
		...event
	};
	broadcast(msg);
}

export function sendServerEvent(event: Omit<ServerEvent, 'type'>, client: WebSocket) {
	const msg: ServerEvent = {
		type: 'serverEvent',
		...event
	};
	send(client, msg);
}
