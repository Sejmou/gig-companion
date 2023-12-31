import type { MidiOrAudioTrack, GroupTrack } from '../state/track';

export type TrackUpdate = {
	type: 'propUpdate';
	scope: 'track';
	trackType: 'midiOrAudio' | 'group';
	trackId: string;
	update: Partial<MidiOrAudioTrack | GroupTrack>;
};
