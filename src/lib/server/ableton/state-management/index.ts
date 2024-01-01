import type { Ableton } from 'ableton-js';
import type { StateAndActionsMap } from '$lib/ableton/types/state-and-actions';

type Scope = keyof StateAndActionsMap;
type StateAndActions = StateAndActionsMap[Scope];

export abstract class AbletonStateManager<T extends StateAndActions> {
	constructor(
		readonly ableton: Ableton,
		updateHandler: (update: Partial<T['state']>) => void,
		messageHandlers: { [K in keyof T['actions']]: (action: T['actions'][K]) => void }
	) {
		this.setupListeners(updateHandler);
		this.messageHandlers = messageHandlers;
	}

	abstract getStateSnapshot(): Promise<T['state']>;
	protected abstract setupListeners(updateHandler: (update: Partial<T['state']>) => void): void;
	protected abstract setupMessageHandlers(): void;

	handleClientMessage(key: keyof T['actions'], msg: T['actions'][keyof T['actions']]) {
		const handler = this.messageHandlers[key];
		if (!handler) {
			console.error(`No handler for client message ${msg}`);
			return;
		}
		if (this.ableton.isConnected()) {
			handler(msg);
		} else {
			console.warn(`Could not handle client message as Ableton Live is not connected`, msg);
		}
	}

	private messageHandlers: {
		[K in keyof T['actions']]: (action: T['actions'][K]) => void;
	};
}
