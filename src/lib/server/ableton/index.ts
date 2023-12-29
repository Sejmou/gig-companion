import type { WebSocket } from 'ws';
import type { Change } from '$lib/ableton/types';
import { isAction, type Action } from '$lib/ableton/types/actions';
import { isPropUpdate, type PropUpdate } from '$lib/ableton/types/prop-updates';
import { getWSS } from '$lib/server/init';
import {
	processSetAction,
	sendCurrentSetState,
	setupSetUpdateListeners,
	updateSetProp
} from './set';
import { updateTrackProp } from './tracks';

export async function sendCurrentLiveState(ws: WebSocket) {
	await sendCurrentSetState(ws);
}

export async function setupLiveUpdateListeners() {
	setupSetUpdateListeners();
}

/**
 * Tries to process a message received from a client for the purpose of interacting with Ableton Live.
 *
 * Returns true if the message was processed, false otherwise.
 */
export async function processClientLiveMessage(message: unknown) {
	if (isPropUpdate(message)) {
		await processClientPropUpdateRequest(message);
		return true;
	} else if (isAction(message)) {
		await processClientAction(message);
		return true;
	}
	return false;
}

/**
 * Broadcasts a change to all connected clients.
 */
export async function broadcastChange(change: Change) {
	const wss = getWSS();
	wss.clients.forEach((client) => {
		client.send(JSON.stringify(change));
	});
}

async function processClientPropUpdateRequest(update: PropUpdate) {
	if (update.scope === 'set') {
		updateSetProp(update);
	} else if (update.scope === 'track') {
		updateTrackProp(update);
	}
}

async function processClientAction(action: Action) {
	if (action.scope === 'set') {
		processSetAction(action);
	}
}
