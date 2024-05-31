import { derived, writable } from 'svelte/store';
import { persisted } from 'svelte-persisted-store';
import { browser } from '$app/environment';

const midiAccess = writable<MIDIAccess | null>(null);
const midiInputsInternal = writable<MIDIInput[]>([]);
export const midiInputs = derived(midiInputsInternal, ($midiInputs) => $midiInputs);

export async function initializeMidi() {
	if (!browser) return;
	try {
		navigator.requestMIDIAccess().then((access) => {
			midiAccess.set(access);
			console.log('MIDI initialized', access);
			midiInputsInternal.set(Array.from(access.inputs.values()));
			access.addEventListener('statechange', () => {
				// just update all MIDI inputs whenever state changes in any way
				midiInputsInternal.set(Array.from(access.inputs.values()));
			});
		});
	} catch (e) {
		console.warn('MIDI not supported in this browser.');
	}
}

// Persisting MIDI input ID and name so that we can show input in UI even if it not currently available/connected
const midiInputMeta = persisted<{ id: string; name: string } | null>('midiInput', null);

export const updateMidiInput = (input: MIDIInput) => {
	midiInputMeta.set({ id: input.id, name: input.name ?? 'Unknown' });
};

export const resetMidiInput = () => {
	midiInputMeta.set(null);
};

/**
 * Essential metadata for the current MIDI input. Available even if the input is not currently connected.
 */
export const currentMidiInputMeta = derived(midiInputMeta, ($midiInputMeta) => $midiInputMeta);

/**
 * The current MIDI input, if it is currently connected.
 */
export const currentMidiInput = derived(
	[midiInputs, midiInputMeta],
	([$midiInputs, $midiInputMeta]) => {
		if ($midiInputMeta === null) return null;
		return $midiInputs.find((input) => input.id === $midiInputMeta.id);
	}
);
