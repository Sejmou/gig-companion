import { derived, get, writable } from 'svelte/store';
import { ws } from '$lib/client/stores/websocket-connection';
import type { ScopeAction, ScopeActionMessage } from '$lib/types/ableton/client';
import type { ScopeStateSnapshot, ScopeStateUpdate } from '$lib/types/ableton/server';

const playingInternal = writable(false);
const timeInternal = writable(0);
const bpmInternal = writable(0);
const connectedInternal = writable(false);

export function handleSetUpdate(
	update: ScopeStateSnapshot<'set'> | ScopeStateUpdate<'set'>
): boolean {
	const { playing, time, bpm, connected } = update;
	let changed = false;
	if (playing !== undefined) {
		playingInternal.set(playing);
		changed = true;
	}
	if (time !== undefined) {
		timeInternal.set(time);
		changed = true;
	}
	if (bpm !== undefined) {
		bpmInternal.set(bpm);
		changed = true;
	}
	if (connected !== undefined) {
		connectedInternal.set(connected);
		changed = true;
	}
	return changed;
}

function sendSetAction(action: ScopeAction<'set'>) {
	const msg: ScopeActionMessage<'set'> = {
		type: 'action',
		scope: 'set',
		action
	};
	ws.send(msg);
}

function createPlayingStore() {
	const { subscribe, update } = playingInternal;

	const play = () => {
		const playmode = get(playMode);
		if (playmode === 'continue') {
			sendSetAction({ name: 'continuePlayback' });
		} else {
			sendSetAction({ name: 'startPlayback' });
		}
	};

	const stop = () => {
		sendSetAction({ name: 'stopPlayback' });
	};

	function customSet(newValue: boolean) {
		if (newValue) {
			play();
		} else {
			stop();
		}
	}

	return {
		subscribe,
		set: customSet,
		update
	};
}

export const playing = createPlayingStore();
export const playMode = writable<'continue' | 'start'>('start');
export const playModes = [
	{
		value: 'continue',
		label: 'Continue where last stopped'
	},
	{
		value: 'start',
		label: 'Always start from marker position'
	}
] as const;

/**
 * The current time in the Ableton Live set. Note that this is measured in beats, not seconds!
 */
export const time = derived(timeInternal, ($time) => $time);
export const bpm = derived(bpmInternal, ($bpm) => $bpm);
export const connected = derived(connectedInternal, ($connected) => $connected);
