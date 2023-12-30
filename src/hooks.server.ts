// IIUC, this file can be used to run additional initialization stuff for the SvelteKit server AFTER the WebSocket.
// At least that's the way I'm using it :)
import { getWSS } from '$lib/server/websocket';
import {
	sendCurrentLiveState,
	setupLiveUpdateListeners
} from '$lib/server/ableton/client-communication/state-sync';
import { ClientMessageProcessor } from '$lib/server/ableton/client-communication/incoming-messages';
import { Ableton } from 'ableton-js';
import { ServiceMonitor } from '$lib/utils';

/**
 * The AbletonJS instance used to communicate with Live.
 *
 * It could potentially NOT be connected to Live (i.e. if Live is not running). In that case any call to AbletonJS methods will fail with an error.
 */
let ableton = new Ableton({ logger: console });

/**
 * Sets up the WebSocket server for communication related to Ableton Live.
 * (i.e. syncing state of Live running on the machine with the connected clients/browsers and
 * forwarding client actions and prop update requests to Live).
 */
const websocketSetupHelper = new ServiceMonitor({
	serviceName: 'Ableton Live WebSocket Handler',
	startService: async () => {
		try {
			await ableton.start();
			return true;
		} catch (e) {
			console.error(e);
			return false;
		}
	},
	checkServiceRunning: () => ableton.isConnected(),
	checkInterval: 1000,
	onStartSuccess: onAbletonConnected,
	onStartFailure: onAbletonDisconnected,
	onServiceOffline: onAbletonDisconnected
});

let messageProcessor: ClientMessageProcessor | null = null;
websocketSetupHelper.start();

function onAbletonConnected() {
	console.log('configuring WebSocket server for Ableton Live communication');
	const wss = getWSS();
	setupLiveUpdateListeners(ableton);

	messageProcessor = new ClientMessageProcessor(ableton);

	wss.on('connection', (ws) => {
		console.log(`WebSocket client connected`);
		sendCurrentLiveState(ableton);
		ws.on('message', (message) => {
			const data = JSON.parse(message.toString());
			console.log(`Received client message:`, data);
			const processed = messageProcessor?.processClientMessage(data) ?? false;
			if (!processed) {
				console.warn(`Received unknown client message: ${message}`);
			}
		});

		ws.on('close', () => {
			console.log(`WebSocket client disconnected`);
		});
	});
	console.log('WebSocket server configured');
}

async function onAbletonDisconnected() {
	ableton = new Ableton({ logger: console });
	messageProcessor = null;
}
