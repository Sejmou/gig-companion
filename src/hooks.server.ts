// IIUC, this file can be used to run additional initialization stuff for the SvelteKit server.
// This code runs after the WebSocket server has started, so it can also be used to further configure the WebSocket server
// That's the way I'm using it :)
import { getWebSocketServer } from '$lib/server/websocket-server';
import { Ableton } from 'ableton-js';
import { ServiceMonitor } from '$lib/utils';
import type { WebSocket, WebSocketServer } from 'ws';
import { isClientEvent } from '$lib/ableton/types/client-events';
import { SetStateManager } from '$lib/server/ableton/set';
import { broadcast } from '$lib/server/ws-client-communication';

async function abletonSetup() {
	const wss = getWebSocketServer();
	const ableton = new Ableton({ logger: console });
	await ableton.start();
	const abletonConnectionMonitor = createConnectionMonitor(ableton);
	abletonConnectionMonitor.start();
	configureWSSWithAbleton(wss, ableton);
}

abletonSetup();

function createConnectionMonitor(ableton: Ableton) {
	const abletonConnectionMonitor = new ServiceMonitor({
		serviceName: 'Ableton Live Connection',
		checkServiceRunning: () => ableton.isConnected(),
		checkInterval: 1000,
		onServiceOnline: onAbletonConnected,
		onServiceOffline: onAbletonDisconnected
	});

	async function onAbletonConnected() {
		console.log('[Monitor] Ableton Live connected');
		const setStateManager = new SetStateManager(
			ableton,
			(update) => {
				broadcast(update);
			},
			{
				startPlayback: async () => await ableton.song.startPlaying(),
				stopPlayback: async () => await ableton.song.stopPlaying(),
				continuePlayback: async () => await ableton.song.continuePlaying()
			}
		);
		const currentSetState = await setStateManager.getStateSnapshot();
		if (currentSetState) {
			const change: SetUpdate = {
				type: 'stateUpdate',
				scope: 'set',
				update: currentSetState
			};
			broadcastChange(change);
		}
	}

	async function onAbletonDisconnected() {
		console.log('[Monitor] Live disconnected');
		await broadcastLiveOffline();
	}

	return abletonConnectionMonitor;
}

/**
 * Sends a message to a single client that Live is not running. Intended to be called when a new client connects while Live is offline.
 */
function sendLiveOffline(ws: WebSocket) {
	const update: SetUpdate = {
		type: 'stateUpdate',
		scope: 'set',
		update: {
			connected: false
		}
	};
	ws.send(JSON.stringify(update));
}

/**
 * Broadcasts a message to all connected clients that Live is not running. Intended to be called when the Ableton connection is lost.
 */
function broadcastLiveOffline() {
	const update: SetUpdate = {
		type: 'stateUpdate',
		scope: 'set',
		update: {
			connected: false
		}
	};
	broadcastUpdateMessage(update);
}

/**
 * Configures the WebSocket server to communicate with Ableton Live.
 *
 * This function should be called after the websocket server starts up.
 */
export function configureWSSWithAbleton(wss: WebSocketServer, ableton: Ableton) {
	console.log('configuring WebSocket server for Ableton Live communication');
	console.log('setting up live update listeners');
	wss.addListener('connection', handleAbletonClientCommunication.bind(null, ableton));
	console.log('WebSocket server configured');
}

function handleAbletonClientCommunication(ableton: Ableton, ws: WebSocket) {
	console.log(`WebSocket client connected`);
	if (ableton.isConnected()) {
		sendCurrentLiveState(ws, ableton);
	} else {
		sendLiveOffline(ws);
	}
	ws.on('message', async (message) => {
		const data = JSON.parse(message.toString());
		console.log(`Received client message:`, data);
		if (ableton.isConnected()) {
			const processedAbletonRelatedMsg = await processClientMessage(ableton, data);
			if (!processedAbletonRelatedMsg) {
				if (isClientEvent(data)) {
					console.log(`Received client event:`, data);
					if (data.name === 'ready') {
						// respond to the client's 'ready' event with a 'ready' event
						sendServerEvent({ name: 'ready' }, ws);
						return;
					}
				}
				console.warn(`Received unknown client message: ${message}`);
			}
		} else {
			console.warn(`Received client message while Live is offline: ${message}`);
		}
	});

	ws.on('close', () => {
		console.log(`WebSocket client disconnected`);
	});
}
