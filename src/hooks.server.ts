// IIUC, this file can be used to initialize the server.
// At least that's the way I'm using it :)
import { getWSS } from '$lib/server/init';
import {
	processClientLiveMessage,
	sendCurrentLiveState,
	setupLiveUpdateListeners
} from '$lib/server/ableton';

/**
 * Sets up the WebSocket server for communication related to Ableton Live.
 * (i.e. syncing state of Live running on the machine with the connected clients/browsers and
 * forwarding client actions and prop update requests to Live).
 */
async function init() {
	// get the WebSocket server instance we created earlier
	const wss = getWSS();
	setupLiveUpdateListeners();

	wss.on('connection', (ws) => {
		console.log(`WebSocket client connected`);
		sendCurrentLiveState(ws);
		ws.on('message', (message) => {
			const data = JSON.parse(message.toString());
			const processed = processClientLiveMessage(data);
			if (!processed) {
				console.warn(`Received unknown client message: ${message}`);
			}
		});

		ws.on('close', () => {
			console.log(`WebSocket client disconnected`);
		});
	});
}

init();
