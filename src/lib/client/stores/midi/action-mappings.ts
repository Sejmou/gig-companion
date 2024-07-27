import type { Message as MidiMessage } from 'webmidi';
// The common types of MIDI messages are apparently three bytes long
// apparently, there's both system-level and channel-level messages
// for now, we're only supporting _channel-level_ messages for note on/off
type MidiNoteMessageMapping = {
	type: 'noteoff' | 'noteon';
	// TODO: consider supporting listening on specific channels
	// channel: number;
	/**
	 * The note number, extracted from the first data byte of the message.
	 */
	note: number;
	/**
	 * The velocity, extracted from the second data byte of the message.
	 */
	velocity: number;
};

export function midiMessageToNoteMessage(message: MidiMessage): MidiNoteMessageMapping | null {
	const { type, dataBytes } = message;
	const [note, velocity] = dataBytes;
	if (type !== 'noteon' && type !== 'noteoff') {
		return null;
	}
	if (typeof note !== 'number' || typeof velocity !== 'number') {
		return null;
	}
	return { type, note, velocity };
}
