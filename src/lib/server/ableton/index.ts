import type { Ableton } from 'ableton-js';
import type {
	ClientActionMessage,
	Scope,
	ScopeAction,
	ScopeStateSnapshot
} from '$lib/types/ableton';
import { SetStateManager } from './set';
import { broadcast, send } from '$lib/server/ws-client-communication';
import type { WebSocket } from 'ws';
import { TrackStateManager } from './track';

export class AbletonSyncManager {
	private setStateManager: SetStateManager;
	private trackStateManager: TrackStateManager;

	constructor(private readonly ableton: Ableton) {
		this.setStateManager = new SetStateManager(ableton, (snapshot) => {
			broadcast({ type: 'stateSnapshot', scope: 'set', snapshot });
		});
		this.trackStateManager = new TrackStateManager(ableton, (snapshot) => {
			broadcast({ type: 'stateSnapshot', scope: 'track', snapshot });
		});

		this.setupConnectionListener();
	}

	private getCurrentStateSnapshots() {
		const state: ScopeStateSnapshot<'set'> = {
			connected: this.ableton.isConnected()
		};
		return [state];
	}

	private setupConnectionListener() {
		this.ableton.addListener('connected', async () => {
			if (this.ableton.isConnected()) {
				console.log('Ableton Live connected');
				const snapshots = this.getCurrentStateSnapshots();
				for (const snapshot of snapshots) {
					broadcast({ type: 'stateSnapshot', scope: 'set', snapshot: snapshot });
				}
			} else {
				console.log('Ableton Live disconnected');
				broadcast({ type: 'stateSnapshot', scope: 'set', snapshot: { connected: false } });
			}
		});
	}

	async sendCurrentState(client: WebSocket) {
		if (this.ableton.isConnected()) {
			console.log('Sending current state to client');
			const snapshots = this.getCurrentStateSnapshots();
			for (const snapshot of snapshots) {
				send(client, { type: 'stateSnapshot', scope: 'set', snapshot: snapshot });
			}
		} else {
			console.log('Sending disconnected state to client');
			send(client, { type: 'stateSnapshot', scope: 'set', snapshot: { connected: false } });
		}
	}

	async handleClientMessage(msg: ClientActionMessage): Promise<boolean> {
		if (this.ableton.isConnected()) {
			console.log(`Handling client message`, msg);
			const { scope, action } = msg;
			if (scope === 'set') {
				return await this.setStateManager.handleAction(action);
			} else if (scope === 'track') {
				return await this.trackStateManager.handleAction(action);
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
export interface ScopeActionHandler<T extends Scope> {
	handleAction(action: ScopeAction<T>): Promise<boolean>;
}

export interface ScopeStateSnapshotProvider<T extends Scope> {
	getStateSnapshot(): Promise<ScopeStateSnapshot<T>>;
}
