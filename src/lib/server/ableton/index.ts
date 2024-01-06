import type { Ableton } from 'ableton-js';
import type { ClientActionMessage } from '$lib/types/ableton';
import { SetStateManager } from './set';
import { broadcast, send } from '$lib/server/ws-client-communication';
import type { WebSocket } from 'ws';

export class AbletonSyncManager {
	private setStateManager: SetStateManager;

	constructor(private readonly ableton: Ableton) {
		this.setStateManager = new SetStateManager(ableton, (update) => {
			broadcast({ type: 'stateUpdate', scope: 'set', update });
		});
		// TODO: add state manager for tracks with nested state managers for every single track

		this.setupConnectionListener();
	}

	private setupConnectionListener() {
		this.ableton.addListener('connected', async () => {
			if (this.ableton.isConnected()) {
				console.log('Ableton Live connected');
				const setState = await this.setStateManager.getLatestState();
				broadcast({ type: 'stateUpdate', scope: 'set', update: setState });
			} else {
				console.log('Ableton Live disconnected');
				broadcast({ type: 'stateUpdate', scope: 'set', update: { connected: false } });
			}
		});
	}

	async sendCurrentState(client: WebSocket) {
		if (this.ableton.isConnected()) {
			console.log('Sending current state to client');
			const setState = await this.setStateManager.getLatestState();
			send(client, { type: 'stateUpdate', scope: 'set', update: setState });
		} else {
			send(client, { type: 'stateUpdate', scope: 'set', update: { connected: false } });
		}
	}

	async handleClientMessage(msg: ClientActionMessage): Promise<boolean> {
		if (this.ableton.isConnected()) {
			console.log(`Handling client message`, msg);
			const { scope, action } = msg;

			if (scope === 'set') {
				return this.setStateManager.handleAction(action);
			} else if (scope === 'track') {
				console.warn(
					`Could not handle client message as tracks state management is not implemented yet`,
					msg
				);
				return true;
			} else {
				console.warn(`Could not handle client message as scope is not recognized`, msg);
				return false;
			}
		} else {
			console.warn(`Could not handle client message as Ableton Live is not connected`, msg);
			return false;
		}
	}
}
