import { isPropUpdate } from '$lib/ableton/types/prop-updates';
import { handleSetPropUpdate } from '$lib/ableton/client/stores/set';

function handleConnectionOpen(event: Event) {
	console.log('WebSocket connection opened', event);
}

function handleConnectionClose(event: CloseEvent) {
	console.log('WebSocket connection closed', event);
}

function handleConnectionError(event: Event) {
	console.log('WebSocket connection error', event);
}

function handleMessageReceived(event: MessageEvent) {
	const data = JSON.parse(event.data);
	console.log('[websocket] message received', data);
	if (isPropUpdate(data)) {
		console.log('Prop update received', data);
		if (data.scope == 'set') {
			handleSetPropUpdate(data);
		}
	} else console.warn('Unknown message received', data);
}

function createWebSocketConnection() {
	console.log('Creating WebSocket connection');
	const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
	const ws = new WebSocket(`${protocol}//${window.location.host}/websocket`);

	ws.addEventListener('open', handleConnectionOpen);
	ws.addEventListener('close', handleConnectionClose);
	ws.addEventListener('error', handleConnectionError);
	ws.addEventListener('message', handleMessageReceived);

	return ws;
}

export function resetWebsocketConnection() {
	console.log('Resetting WebSocket connection');
	ws.removeEventListener('open', handleConnectionOpen);
	ws.removeEventListener('close', handleConnectionClose);
	ws.removeEventListener('error', handleConnectionError);
	ws.removeEventListener('message', handleMessageReceived);
	ws.close();
	ws = createWebSocketConnection();
}

export let ws = createWebSocketConnection();
