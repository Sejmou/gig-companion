import { derived, get, writable } from 'svelte/store';
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
		removeCurrentInputListener();
		if ($midiInputMeta === null) {
			return null;
		}
		const input = $midiInputs.find((input) => input.id === $midiInputMeta.id);
		if (input) {
			addListener(input);
			return input;
		}
	}
);

function handleMidiMessage(event: MIDIMessageEvent) {
	console.log('MIDI message received', event.data);
}

function addListener(input: MIDIInput) {
	input.addEventListener('midimessage', handleMidiMessage);
	console.log('MIDI input listener added for input with ID', input.id);
}

/**
 * call this BEFORE changing the current MIDI input. Otherwise we would still listen to messages from the old input after the change
 */
function removeCurrentInputListener() {
	const currentInput = get(currentMidiInput);
	if (!currentInput) return;
	currentInput.removeEventListener('midimessage', handleMidiMessage);
	console.log('MIDI input listener remove for input with ID', currentInput.id);
}
