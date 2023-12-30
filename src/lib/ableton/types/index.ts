import type { Device } from 'ableton-js/ns/device';
import type { PropUpdate } from './prop-updates';
import type { Action } from './actions';

/**
 * The current state of Ableton Live's set.
 * This includes information about the current song, the current playback state, the current time, etc.
 * This is the only state that is not scoped to a specific track.
 */
export type SetState = {
	/**
	 * Whether the connection to Ableton Live is established.
	 * If this is false, no other state is guaranteed to be up to date.
	 */
	connected: boolean;
	/**
	 * Whether Ableton Live is currently playing.
	 */
	playing: boolean;
	/**
	 * The current tempo in beats per minute.
	 */
	bpm: number;
	/**
	 * The current time in seconds.
	 */
	time: number;
	/**
	 * The songs in the current set.
	 */
	songs: Song[];
};

export type Track = MidiOrAudioTrack | GroupTrack;

export type MidiOrAudioTrack = TrackBase & {
	type: 'midiOrAudio';
	armed: boolean;
	monitoringState: 'in' | 'auto' | 'off';
};

export type GroupTrack = TrackBase & {
	type: 'group';
	tracks: Track[];
};

export type TrackBase = {
	id: string;
	name: string;
	devices: Device[];
	parentId?: string;
	muted: boolean;
	// TODO: investigate why this is not a boolean prop
	soloed: number;
};

export type Song = {
	name: string;
	sections: Section[];
	tracks: MidiOrAudioTrack[];
};

type Section = {
	name: string;
	timestamp: number;
};

export type Change = PropUpdate | Action;
export type ChangeType = Change['type'];

export const isChange = (unknown: unknown): unknown is Change => {
	return typeof unknown == 'object' && unknown !== null && 'type' in unknown && 'scope' in unknown;
};
