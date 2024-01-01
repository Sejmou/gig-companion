import { isAction, type ClientAction } from '$lib/ableton/types/client-actions';
import { isStateUpdate, type StateUpdate } from '$lib/ableton/types/state-updates';
import type { Ableton } from 'ableton-js';
import { updateSetProp } from './state-updates/set';
import { executeSetAction } from './actions/set';
import { updateTrackProp } from './state-updates/track';

/**
 * Processes messages received from clients. These messages change the state of Ableton Live.
 */
export async function processClientMessage(ableton: Ableton, message: unknown) {
	if (isStateUpdate(message)) {
		await processStateUpdateRequest(ableton, message);
		return true;
	} else if (isAction(message)) {
		await processClientAction(ableton, message);
		return true;
	}
	return false;
}

async function processStateUpdateRequest(ableton: Ableton, update: StateUpdate) {
	if (update.scope === 'set') {
		updateSetProp(ableton, update);
	} else if (update.scope === 'track') {
		updateTrackProp(ableton, update);
	}
}

async function processClientAction(ableton: Ableton, action: ClientAction) {
	if (action.scope === 'set') {
		executeSetAction(ableton, action);
	}
}
