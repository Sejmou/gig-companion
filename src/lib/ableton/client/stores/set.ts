import { derived, get, writable } from 'svelte/store';
import type { SetPropUpdate } from '$lib/ableton/types/prop-updates';
import { sendAction } from '../actions';

const playingInternal = writable(false);
const timeInternal = writable(0);
const bpmInternal = writable(0);

export function handleSetPropUpdate(data: SetPropUpdate) {
	console.log('Prop update received', data);
	const { update } = data;
	const { playing, time, bpm } = update;
	if (playing !== undefined) {
		playingInternal.set(playing);
	}
	if (time !== undefined) {
		timeInternal.set(time);
	}
	if (bpm !== undefined) {
		bpmInternal.set(bpm);
	}
}

function createPlayingStore() {
	const { subscribe, update } = playingInternal;

	const play = () => {
		const playmode = get(playMode);
		if (playmode === 'continue') {
			sendAction({ scope: 'set', name: 'continuePlayback' });
		} else {
			sendAction({ scope: 'set', name: 'startPlayback' });
		}
	};

	const stop = () => {
		sendAction({ scope: 'set', name: 'stopPlayback' });
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
export const time = derived(timeInternal, ($time) => $time);
export const bpm = derived(bpmInternal, ($bpm) => $bpm);
