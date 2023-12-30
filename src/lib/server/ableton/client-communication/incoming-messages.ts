import { isAction, type Action } from '$lib/ableton/types/actions';
import { isPropUpdate, type PropUpdate } from '$lib/ableton/types/prop-updates';
import type { Ableton } from 'ableton-js';
import { executeSetAction, updateSetProp } from './set';
import { updateTrackProp } from './tracks';

/**
 * Processes messages received from clients. These messages change the state of Ableton Live.
 *
 * This class is NOT responsible for sending state updates to clients! For this plese refer to `state-sync.ts` and its usages.
 */
export class ClientMessageProcessor {
	ableton: Ableton;

	constructor(ableton: Ableton) {
		this.ableton = ableton;
	}

	/**
	 * Tries to process a message received from a client for the purpose of interacting with Ableton Live.
	 *
	 * Returns true if the message was processed, false otherwise.
	 */
	async processClientMessage(message: unknown) {
		if (isPropUpdate(message)) {
			await this.processClientPropUpdateRequest(message);
		} else if (isAction(message)) {
			await this.processClientAction(message);
		}
	}

	private async processClientPropUpdateRequest(update: PropUpdate) {
		if (update.scope === 'set') {
			updateSetProp(this.ableton, update);
		} else if (update.scope === 'track') {
			updateTrackProp(this.ableton, update);
		}
	}

	private async processClientAction(action: Action) {
		if (action.scope === 'set') {
			executeSetAction(this.ableton, action);
		}
	}
}
