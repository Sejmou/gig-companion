import { isStateUpdateMessage, type ClientActionMessage } from '$lib/types/ableton';
import { handleSetUpdate } from '$lib/client/stores/ableton/set';
import { isServerEvent } from '../../types/server-events';
import type { ClientEvent, ClientReady } from '../../types/client-events';
import { derived, get, writable } from 'svelte/store';

function handleConnectionOpen(event: Event) {
	console.log('WebSocket connection opened', event);

	// tell the server that we're ready to communicate with the server
	// we expect to later receive a 'ready' event from the server in response
	const readyMsg: ClientReady = {
		type: 'clientEvent',
		name: 'ready'
	};
	con.send(JSON.stringify(readyMsg));
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
			_serverReady.set(true);
		}
	} else if (isStateUpdateMessage(msg)) {
		const { scope, update } = msg;
		if (scope == 'set') {
			handleSetUpdate(update);
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
	con.removeEventListener('open', handleConnectionOpen);
	con.removeEventListener('close', handleConnectionClose);
	con.removeEventListener('error', handleConnectionError);
	con.removeEventListener('message', handleMessageReceived);
	con.close();
	con = createWebSocketConnection();
	_serverReady.set(false);
}

const _serverReady = writable(false);
const serverReady = derived(_serverReady, (val) => val);
let con = createWebSocketConnection();

export const ws = {
	send: (msg: ClientActionMessage | ClientEvent) => {
		con.send(JSON.stringify(msg));
	},
	reset: resetWebsocketConnection,
	serverReady
};
