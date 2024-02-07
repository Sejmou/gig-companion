import { derived, get, writable } from 'svelte/store';
import { ws } from '$lib/client/stores/websocket-connection';
import type { ScopeAction, ScopeActionMessage } from '$lib/types/ableton/client';
import type { ScopeStateSnapshot, ScopeStateUpdate } from '$lib/types/ableton/server';

const playingInternal = writable(false);
const timeBeatsInternal = writable(0);
const timeMsInternal = writable(0);
const bpmInternal = writable(0);
const connectedInternal = writable(false);
const loopEnabledInternal = writable(false);
const loopStartInternal = writable(0);
const loopLengthInternal = writable(0);

export function handleSetUpdate(
	update: ScopeStateSnapshot<'set'> | ScopeStateUpdate<'set'>
): boolean {
	const { playing, timeBeats, timeMs, bpm, connected, loopEnabled, loopStart, loopLength } = update;
	let changed = false;
	if (playing !== undefined) {
		playingInternal.set(playing);
		changed = true;
	}
	if (timeBeats !== undefined) {
		timeBeatsInternal.set(timeBeats);
		changed = true;
	}
	if (timeMs !== undefined) {
		timeMsInternal.set(timeMs);
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
	if (loopEnabled !== undefined) {
		loopEnabledInternal.set(loopEnabled);
		changed = true;
	}
	if (loopStart !== undefined) {
		loopStartInternal.set(loopStart);
		changed = true;
	}
	if (loopLength !== undefined) {
		loopLengthInternal.set(loopLength);
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
 * The current time in the Ableton Live set, measured in beats.
 */
export const timeBeats = derived(timeBeatsInternal, ($time) => $time);
/**
 * The current time in the Ableton Live set, measured in milliseconds.
 */
export const timeMs = derived(timeMsInternal, ($time) => $time);
export const bpm = derived(bpmInternal, ($bpm) => $bpm);
export const connected = derived(connectedInternal, ($connected) => $connected);

function createLoopEnabledStore() {
	const { subscribe } = loopEnabledInternal;

	const set = (newValue: boolean) => {
		const action: ScopeAction<'set'> = {
			name: 'loopEnabled',
			value: newValue
		};
		sendSetAction(action);
	};

	const update = (updater: (value: boolean) => boolean) => {
		const newValue = updater(get(loopEnabled));
		set(newValue);
	};

	return {
		subscribe,
		set,
		update
	};
}

function createLoopStartStore() {
	const { subscribe, update } = loopStartInternal;

	const set = (newValue: number) => {
		const action: ScopeAction<'set'> = {
			name: 'loopStart',
			value: newValue
		};
		sendSetAction(action);
	};

	return {
		subscribe,
		set,
		update
	};
}

function createLoopLengthStore() {
	const { subscribe, update } = loopLengthInternal;

	const set = (newValue: number) => {
		const action: ScopeAction<'set'> = {
			name: 'loopLength',
			value: newValue
		};
		sendSetAction(action);
	};

	return {
		subscribe,
		set,
		update
	};
}

/**
 * Whether the loop is currently enabled.
 */
export const loopEnabled = createLoopEnabledStore();
/**
 * Arrangement loop start in beats.
 */
export const loopStart = createLoopStartStore();
/**
 * Arrangement loop length in beats.
 */
export const loopLength = createLoopLengthStore();

function createLoopEndStore() {
	const { subscribe, set: setLoopEnd, update } = writable(0);

	const realLoopEnd = derived(
		[loopStart, loopLength],
		([$loopStart, $loopLength]) => $loopStart + $loopLength
	);

	realLoopEnd.subscribe((newValue) => {
		setLoopEnd(newValue);
	});

	const set = (newValue: number) => {
		const loopLengthValue = newValue - get(loopStart);
		loopLength.set(loopLengthValue);
	};

	return {
		subscribe,
		set,
		update
	};
}

/**
 * Arrangement loop end in beats.
 */
export const loopEnd = createLoopEndStore();
