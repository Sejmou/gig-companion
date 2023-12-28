import { writable } from 'svelte/store';

function createPlayingStore(ws: WebSocket) {
	const { subscribe, set, update } = writable(false);

	function customSet(newValue: boolean) {
		ws.send(
			JSON.stringify({
				is_playing: newValue
			})
		);
	}

	ws.addEventListener('message', (event) => {
		const data = JSON.parse(event.data);
		if (data.is_playing !== undefined) {
			set(data.is_playing);
		} else {
			console.warn('Unknown message received', event.data);
		}
	});

	return {
		subscribe,
		set: customSet,
		// If you need to perform additional logic when updating the value,
		// you can use a custom `update` method as well.
		update
	};
}

function createWebSocketConnection() {
	const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
	const ws = new WebSocket(`${protocol}//${window.location.host}/websocket`);
	ws.addEventListener('open', (event) => {
		console.log('WebSocket connection opened', event);
	});
	ws.addEventListener('close', (event) => {
		console.log('WebSocket connection closed', event);
	});
	ws.addEventListener('message', (event) => {
		console.log('[websocket] message received', event);
	});

	return ws;
}

const ws = createWebSocketConnection();
export const playing = createPlayingStore(ws);
