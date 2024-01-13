import type { Ableton } from 'ableton-js';
import type {
	ScopeStateSnapshot,
	ScopeStateUpdatePayload,
	StateSnapshotScope,
	StateUpdateScope
} from '$lib/types/ableton/server';
import type {
	ClientActionScope,
	ScopeAction,
	ClientActionMessage
} from '$lib/types/ableton/client';
import { SetStateManager } from './set';
import { broadcast, send } from '$lib/server/ws-client-communication';
import type { WebSocket } from 'ws';
import { TrackStateManager } from './track';
import { CuePointStateManager } from './cuepoint';

export class AbletonSyncManager implements ScopeUpdateObserver<StateUpdateScope> {
	private setStateManager: SetStateManager;
	private trackStateManager: TrackStateManager;
	private cuePointStateManager: CuePointStateManager;

	constructor(private readonly ableton: Ableton) {
		this.setStateManager = new SetStateManager(ableton);
		this.setStateManager.attach(this);
		this.trackStateManager = new TrackStateManager(ableton);
		this.trackStateManager.attach(this);
		this.cuePointStateManager = new CuePointStateManager(ableton);
		this.cuePointStateManager.attach(this);

		this.setupConnectionListener();
	}
	notify(payload: ScopeStateUpdatePayload<StateUpdateScope>): void {
		broadcast({ type: 'stateUpdate', ...payload });
	}

	private async getCurrentScopeSnapshotObjects() {
		const set: ScopeSnapshotObj<'set'> = {
			scope: 'set',
			snapshot: await this.setStateManager.getStateSnapshot()
		};
		const tracks: ScopeSnapshotObj<'tracks'> = {
			scope: 'tracks',
			snapshot: await this.trackStateManager.getStateSnapshot()
		};
		const cuepoints: ScopeSnapshotObj<'cuepoints'> = {
			scope: 'cuepoints',
			snapshot: await this.cuePointStateManager.getStateSnapshot()
		};
		return [set, tracks, cuepoints];
	}

	private setupConnectionListener() {
		console.log('setting up Live connection listener');
		// this doesn't relly seem to work atm
		// TODO: consider reaching out to maintainer of ableton-js to fix
		this.ableton.addListener('connected', async () => {
			if (this.ableton.isConnected()) {
				console.log('Ableton Live connected');
				const snapshots = await this.getCurrentScopeSnapshotObjects();
				for (const obj of snapshots) {
					broadcast({ type: 'stateSnapshot', ...obj });
				}
			} else {
				console.log('Ableton Live disconnected');
				broadcast({ type: 'stateUpdate', scope: 'set', update: { connected: false } });
			}
		});
		console.log('Live connection listener has been set up');
	}

	async sendCurrentState(client: WebSocket) {
		if (this.ableton.isConnected()) {
			console.log('Sending current state to client');
			const snapshots = await this.getCurrentScopeSnapshotObjects();
			for (const obj of snapshots) {
				send(client, { type: 'stateSnapshot', ...obj });
			}
		} else {
			console.log('Sending disconnected state to client');
			send(client, { type: 'stateUpdate', scope: 'set', update: { connected: false } });
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

type ScopeSnapshotObj<T extends StateSnapshotScope> = {
	scope: T;
	snapshot: ScopeStateSnapshot<T>;
};

export interface ScopeActionHandler<T extends ClientActionScope> {
	handleAction(action: ScopeAction<T>): Promise<boolean>;
}

export interface ScopeStateSnapshotProvider<T extends StateSnapshotScope> {
	getStateSnapshot(): Promise<ScopeStateSnapshot<T>>;
}

export interface ScopeUpdateObserver<T extends StateUpdateScope> {
	notify(payload: ScopeStateUpdatePayload<T>): void;
}

export interface ScopeUpdateObservable<T extends StateUpdateScope> {
	attach(observer: ScopeUpdateObserver<T>): void;
	// detach(observer: ScopeUpdateObserver<T>): void; // not really needed atm
}
