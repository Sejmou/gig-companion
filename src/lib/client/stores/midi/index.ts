import { derived, readable } from 'svelte/store';
import { persisted } from 'svelte-persisted-store';

export const midiInputs = readable<MIDIInput[]>([], (set) => {
	window.navigator.requestMIDIAccess().then((midiAccess) => {
		set([...midiAccess.inputs.values()]);
		const listener = () => {
			set([...midiAccess.inputs.values()]);
		};
		midiAccess.addEventListener('statechange', listener);
	});
});

export const midiInputId = persisted<string | null>('midiInputId', null);

export const midiInput = derived([midiInputs, midiInputId], ([$midiInputs, $midiInputId]) => {
	return $midiInputs.find((input) => input.id === $midiInputId);
});
