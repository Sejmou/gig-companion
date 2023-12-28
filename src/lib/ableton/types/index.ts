import type { Device } from 'ableton-js/ns/device';
import type { PropUpdate } from './prop-updates';
import type { Action } from './actions';

export type LiveSet = {
	playing: boolean;
	bpm: number;
	time: number;
	songs: Song[];
};

export type MidiOrAudioTrack = TrackBase & {
	type: 'midiOrAudio';
	armed: boolean;
	// TODO: investigate what values are possible and what they mean
	monitoringState: number;
};

export type GroupTrack = TrackBase & {
	type: 'group';
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
