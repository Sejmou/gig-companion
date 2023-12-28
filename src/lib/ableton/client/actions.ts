import { ws } from '$lib/websocket';
import type { Action } from '$lib/ableton/types/actions';

export function sendAction(action: Omit<Action, 'type'>) {
	const type = 'action';
	ws.send(JSON.stringify({ ...action, type }));
}
