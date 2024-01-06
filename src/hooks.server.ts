// IIUC, this file can be used to run additional initialization stuff for the SvelteKit server.
// This code runs after the WebSocket server has started, so it can also be used to further configure the WebSocket server
// That's the way I'm using it :)
import type { WebSocket } from 'ws';
import { isClientEvent } from '$lib/types/client-events';
import { AbletonSyncManager } from '$lib/server/ableton';
import { Ableton } from 'ableton-js';
import { getWebSocketServer } from '$lib/server/websocket-server';
import { sendServerEvent } from '$lib/server/events';

let abletonSyncManager: AbletonSyncManager;

configureWebSocketServer();

/**
 * Configures the WebSocket server further, adding all necessary logic for the application to work.
 */
async function configureWebSocketServer() {
	console.log('configuring WebSocket server');
	const ableton = new Ableton({ logger: console });
	await ableton.start();
	abletonSyncManager = new AbletonSyncManager(ableton);
	const wss = getWebSocketServer();
	wss.addListener('connection', handleClientCommunication);
	console.log('WebSocket server configured');
}

function handleClientCommunication(ws: WebSocket) {
	console.log(`WebSocket client connected`);
	abletonSyncManager.sendCurrentState(ws);
	ws.on('message', async (message) => {
		const data = JSON.parse(message.toString());
		console.log(`Received client message:`, data);
		if (isClientEvent(data)) {
			console.log(`Received client event:`, data);
			if (data.name === 'ready') {
				// respond to the client's 'ready' event with a 'ready' event
				sendServerEvent({ name: 'ready' }, ws);
				return;
			}
		} else {
			const processedAbletonRelatedMsg = await abletonSyncManager.handleClientMessage(data);
			if (!processedAbletonRelatedMsg) {
				console.warn(`Received unknown client message: ${message}`);
			}
		}
	});

	ws.on('close', () => {
		console.log(`WebSocket client disconnected`);
	});
}
