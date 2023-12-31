import type { Device } from 'ableton-js/ns/device';

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
