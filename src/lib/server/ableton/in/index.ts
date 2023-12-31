import { isAction, type ClientAction } from '$lib/ableton/types/client-actions';
import { isPropUpdate, type PropUpdate } from '$lib/ableton/types/prop-updates';
import type { Ableton } from 'ableton-js';
import { updateSetProp } from './prop-updates/set';
import { executeSetAction } from './actions/set';
import { updateTrackProp } from './prop-updates/track';

/**
 * Processes messages received from clients. These messages change the state of Ableton Live.
 */
export async function processClientMessage(ableton: Ableton, message: unknown) {
	if (isPropUpdate(message)) {
		await processClientPropUpdateRequest(ableton, message);
		return true;
	} else if (isAction(message)) {
		await processClientAction(ableton, message);
		return true;
	}
	return false;
}

async function processClientPropUpdateRequest(ableton: Ableton, update: PropUpdate) {
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
