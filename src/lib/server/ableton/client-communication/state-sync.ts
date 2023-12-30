import type { Ableton } from 'ableton-js';
import { getCurrentSetState, setupSetUpdateListeners } from './set';
import { getWSS } from '$lib/server/websocket';
import type { PropUpdate, SetUpdate } from '$lib/ableton/types/prop-updates';

export async function sendCurrentLiveState(ableton: Ableton) {
	const setState = await getCurrentSetState(ableton);
	const update: SetUpdate = {
		type: 'propUpdate',
		scope: 'set',
		update: setState
	};
	broadcastUpdateMessage(update);
}

export async function sendLiveOfflineMessage() {
	const update: SetUpdate = {
		type: 'propUpdate',
		scope: 'set',
		update: {
			connected: false
		}
	};
	broadcastUpdateMessage(update);
}

export async function setupLiveUpdateListeners(ableton: Ableton) {
	const setUpdateHandler: (update: SetUpdate['update']) => Promise<void> = async (update) => {
		const updateMessage: SetUpdate = {
			type: 'propUpdate',
			scope: 'set',
			update
		};
		broadcastUpdateMessage(updateMessage);
	};
	setupSetUpdateListeners(ableton, setUpdateHandler);
	// TODO: add other listeners for other scopes, e.g. tracks
}

/**
 * Broadcasts a message containing information about an update to Live's state to all connected clients.
 * This allows clients to stay in sync with Live's state.
 */
async function broadcastUpdateMessage(msg: PropUpdate) {
	const wss = getWSS();
	wss.clients.forEach((client) => {
		client.send(JSON.stringify(msg));
	});
}
