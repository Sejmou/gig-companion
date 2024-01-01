import type { ClientAction } from '$lib/ableton/types/websocket-api/client/actions';
import type { Ableton } from 'ableton-js';

/**
 * Processes actions received from clients. These messages change the state of Ableton Live.
 */
async function processClientAction(ableton: Ableton, action: ClientAction) {
	if (action.scope === 'set') {
		executeSetAction(ableton, action);
	}
}
