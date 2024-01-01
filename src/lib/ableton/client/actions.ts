import { ws } from '$lib/websocket-client';
import type { ClientAction } from '$lib/ableton/types/websocket-api/client/actions';

export function sendAction(action: Omit<ClientAction, 'type'>) {
	const type = 'action';
	ws.send(JSON.stringify({ ...action, type }));
}
