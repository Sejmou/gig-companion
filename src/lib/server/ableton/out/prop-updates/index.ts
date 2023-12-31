import type { Ableton } from 'ableton-js';
import { getCurrentSetState, setupSetUpdateListeners } from './set';
import type { PropUpdate } from '$lib/ableton/types/prop-updates';
import type { SetUpdate } from '$lib/ableton/types/prop-updates/set';
import type { WebSocket } from 'ws';
import { broadcastChange } from '..';

/**
 * Broadcasts the current state of Live to all connected clients. Intended to be called when the Ableton connection is (re-)established.
 */
export async function broadcastCurrentLiveState(ableton: Ableton) {
	const setState = await getCurrentSetState(ableton);
	const update: SetUpdate = {
		type: 'propUpdate',
		scope: 'set',
		update: setState
	};
	broadcastUpdateMessage(update);
}

/**
 * Sends the current state of Live to a single client. Intended to be called when a new client connects.
 */
export async function sendCurrentLiveState(ws: WebSocket, ableton: Ableton) {
	const setState = await getCurrentSetState(ableton);
	const update: SetUpdate = {
		type: 'propUpdate',
		scope: 'set',
		update: setState
	};
	ws.send(JSON.stringify(update));
}

/**
 * Sends a message to a single client that Live is not running. Intended to be called when a new client connects while Live is offline.
 */
export function sendLiveOffline(ws: WebSocket) {
	const update: SetUpdate = {
		type: 'propUpdate',
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
function broadcastUpdateMessage(msg: PropUpdate) {
	broadcastChange(msg);
}
