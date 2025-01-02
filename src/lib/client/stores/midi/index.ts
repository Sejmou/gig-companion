import { derived, get, writable } from 'svelte/store';
import { persisted } from 'svelte-persisted-store';
import { browser } from '$app/environment';
import { Message as MIDIMessage } from 'webmidi';
import { takeActionIfMapped } from './action-mappings';

const midiAccess = writable<MIDIAccess | null>(null);
const midiInputsInternal = writable<MIDIInput[]>([]);
export const midiInputs = derived(midiInputsInternal, ($midiInputs) => $midiInputs);

export async function initializeMidi() {
	if (!browser) return;
	try {
		const access = await navigator.requestMIDIAccess();
		midiAccess.set(access);
		console.log('MIDI initialized', access);
		midiInputsInternal.set(Array.from(access.inputs.values()));
		access.addEventListener('statechange', () => {
			// just update all MIDI inputs whenever state changes in any way
			midiInputsInternal.set(Array.from(access.inputs.values()));
		});
		// TODO: rewrite this mess; apparently code breaks if I don't subscribe here which feels weird
		currentMidiInput.subscribe((input) => {
			console.log('MIDI input changed', input);
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
		// crazy, but this actually seems to work without getting into recursion issues, noice
		const $currentInput = get(currentMidiInput);
		if ($currentInput) {
			$currentInput.removeEventListener('midimessage', handleMidiMessage);
			console.log('MIDI input listener remove for input with ID', $currentInput.id);
		}
		if ($midiInputMeta === null) {
			return null;
		}
		const input = $midiInputs.find((input) => input.id === $midiInputMeta.id);
		if (input) {
			input.addEventListener('midimessage', handleMidiMessage);
			console.log('MIDI input listener added to input', input);
			return input;
		}
	}
);

type MIDIMessageWithTimestamp = {
	message: MIDIMessage;
	timestamp: number;
};

export const lastMidiMessage = writable<MIDIMessageWithTimestamp | null>(null);

function handleMidiMessage(event: MIDIMessageEvent) {
	if (!event.data) {
		console.warn('Received MIDI message without data', event);
		return;
	}
	const message = new MIDIMessage(event.data);
	const { type } = message;
	// ignore activesensing messages as they are sent very frequently and apparently only sent by the MIDI device to indicate that it is still connected
	// we don't really need to know about this atm; also, it looks like some devices don't even send this message
	if (type === 'activesensing') {
		return;
	}
	console.log('MIDI message received', message);
	lastMidiMessage.set({ message, timestamp: event.timeStamp });
	takeActionIfMapped(message);
}
