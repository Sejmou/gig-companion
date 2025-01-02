import { persisted } from 'svelte-persisted-store';
import { playing, recording } from '$lib/client/stores/ableton/set';
import { goToNextSong, goToPrevSong } from '$lib/client/actions/set';
import { switchToNextSound, switchToPrevSound } from '$lib/client/actions/song';
import type { Message as MIDIMessage } from 'webmidi';
import { get } from 'svelte/store';

const actionExecutors = {
	start: () => playing.set(true),
	stop: () => playing.set(false),
	record: () => recording.update((recording) => !recording),
	'previous song': () => goToPrevSong(),
	'next song': () => goToNextSong(),
	'next sound': () => switchToNextSound(),
	'previous sound': () => switchToPrevSound()
} as const;

export const actionNames = Object.keys(actionExecutors) as Readonly<ActionName[]>;

type MIDINoteOnMessage = {
	type: 'noteon';
	note: number;
	velocity: number;
	channel: number;
};
type MIDIControlChangeMessage = {
	type: 'controlchange';
	control: number;
	value: number;
	channel: number;
};

function midiNoteNumberToIdentifier(number: number) {
	if (isNaN(number) || number < 0 || number > 127) throw new RangeError('Invalid note number');

	const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
	const octave = Math.floor(number / 12 - 1);
	return notes[number % 12] + octave.toString();
}

export type ActionMappableMIDIMessage = MIDINoteOnMessage | MIDIControlChangeMessage;

export type ActionName = keyof typeof actionExecutors;
export const midiMappings = persisted<Record<string, ActionName>>('midi-mappings', {}); // TODO: fix this, it's ugly af lol

export function takeActionIfMapped(midiMessage: MIDIMessage) {
	const key = stringifyIfMappableToAction(midiMessage);
	if (!key) return;
	const $mappings = get(midiMappings);
	const actionName = $mappings[key];
	if (actionName) {
		console.log(`MIDI message (${key}) is mapped to action '${actionName}', executing...`);
		actionExecutors[actionName]();
	}
}

function stringifyIfMappableToAction(midiMsg: MIDIMessage): string | null {
	// data byte 2 is velocity for noteon messages, value for controlchange messages
	// we don't care about either
	const [dataByte1] = midiMsg.dataBytes as [number, number];
	if (midiMsg.type === 'noteon') {
		const noteNumber = dataByte1;
		const noteIdentifier = midiNoteNumberToIdentifier(noteNumber);
		return `noteon (note ${noteNumber} (${noteIdentifier}) on channel ${midiMsg.channel})`;
	} else if (midiMsg.type === 'controlchange') {
		const control = dataByte1;
		return `controlchange (control ${control} on channel ${midiMsg.channel})`;
	}
	return null;
}

export function addMapping(msg: MIDIMessage, actionName: ActionName): boolean {
	const key = stringifyIfMappableToAction(msg);
	if (!key) {
		console.error('Adding MIDI mapping failed! Cannot map this MIDI message to an action:', msg);
		return false;
	}
	midiMappings.update((mappings) => {
		mappings[key] = actionName;
		return mappings;
	});
	return true;
}

export function removeMapping(stringifiedMsg: string) {
	midiMappings.update((mappings) => {
		delete mappings[stringifiedMsg];
		return mappings;
	});
}
