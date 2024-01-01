import { isStateUpdate } from '$lib/ableton/types/websocket-api/server/state-updates';
import { handleSetUpdate } from '$lib/ableton/client/stores/set';
import { isServerEvent } from './ableton/types/server-events';
import type { ClientReady } from './ableton/types/client-events';
import { serverReady } from '$lib/ableton/client/stores/server-state';
import { get } from 'svelte/store';

function handleConnectionOpen(event: Event) {
	console.log('WebSocket connection opened', event);

	// tell the server that we're ready to communicate with the server
	// we expect to later receive a 'ready' event from the server in response
	const readyMsg: ClientReady = {
		type: 'clientEvent',
		name: 'ready'
	};
	ws.send(JSON.stringify(readyMsg));
	console.log('Sent ready message to server');
	setTimeout(() => {
		const receivedReady = get(serverReady);
		if (!receivedReady) {
			console.warn('Server did not respond to ready event. Trying to reconnect...');
			resetWebsocketConnection();
		}
	}, 2000);
}

function handleConnectionClose(event: CloseEvent) {
	console.log('WebSocket connection closed', event);
}

function handleConnectionError(event: Event) {
	console.log('WebSocket connection error', event);
}

function handleMessageReceived(event: MessageEvent) {
	const msg = JSON.parse(event.data);
	console.log('Received message from server', msg);
	if (isServerEvent(msg)) {
		if (msg.name === 'ready') {
			serverReady.set(true);
		}
	} else if (isStateUpdate(msg)) {
		if (msg.scope == 'set') {
			handleSetUpdate(msg);
		}
	} else console.warn('Unknown message received', msg);
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
	serverReady.set(false);
}

export let ws = createWebSocketConnection();
