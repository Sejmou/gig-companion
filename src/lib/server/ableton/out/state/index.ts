import type { Ableton } from 'ableton-js';
import { getCurrentSetState, setupSetUpdateListeners } from './set';
import type { StateUpdate } from '$lib/ableton/types/state-updates';
import type { SetUpdate } from '$lib/ableton/types/state-updates/set';
import type { WebSocket } from 'ws';
import { broadcastChange } from '..';
import { getTrackHierarchy } from './track';

/**
 * Broadcasts the current state of Live to all connected clients. Intended to be called when the Ableton connection is (re-)established.
 */
export async function broadcastCurrentLiveState(ableton: Ableton) {
	const updates = await createUpdateMessages(ableton);
	for (const update of updates) {
		broadcastUpdateMessage(update);
	}
}

/**
 * Sends the current state of Live to a single client. Intended to be called when a new client connects.
 */
export async function sendCurrentLiveState(ws: WebSocket, ableton: Ableton) {
	// TODO: debug, remove later
	const tracks = await getTrackHierarchy(ableton);
	console.log(tracks);

	const updates = await createUpdateMessages(ableton);
	for (const update of updates) {
		ws.send(JSON.stringify(update));
	}
}

async function createUpdateMessages(ableton: Ableton) {
	const setState = await getCurrentSetState(ableton);
	const setUpdate: SetUpdate = {
		type: 'stateUpdate',
		scope: 'set',
		update: setState
	};
	return [setUpdate];
}

/**
 * Sends a message to a single client that Live is not running. Intended to be called when a new client connects while Live is offline.
 */
export function sendLiveOffline(ws: WebSocket) {
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
export async function broadcastLiveOffline() {
	const update: SetUpdate = {
		type: 'stateUpdate',
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
			type: 'stateUpdate',
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
function broadcastUpdateMessage(msg: StateUpdate) {
	broadcastChange(msg);
}
