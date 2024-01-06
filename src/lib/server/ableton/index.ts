import type { Ableton } from 'ableton-js';
import type { ClientActionMessage } from '$lib/ableton/types/state-and-actions';
import { SetStateManager } from './set';
import { broadcast } from '$lib/server/ws-client-communication';

export class AbletonSyncManager {
	private setStateManager: SetStateManager;
	private tracks: ServerTrack[];

	constructor(private readonly ableton: Ableton) {
		this.setStateManager = new SetStateManager(ableton, (update) => {
			broadcast({ type: 'stateUpdate', scope: 'set', update });
		});
		// TODO: add state manager for tracks with nested state managers for every single track
	}

	handleClientMessage(msg: ClientActionMessage) {
		if (this.ableton.isConnected()) {
			console.log(`Handling client message`, msg);
			const { scope, action } = msg;

			if (scope === 'set') {
				this.setStateManager.handleAction(action);
			} else if (scope === 'track') {
				console.warn(
					`Could not handle client message as tracks state management is not implemented yet`,
					msg
				);
			} else {
				console.warn(`Could not handle client message as scope is not recognized`, msg);
			}
		} else {
			console.warn(`Could not handle client message as Ableton Live is not connected`, msg);
		}
	}
}
