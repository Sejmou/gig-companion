import { isChange, type GroupTrack, type MidiOrAudioTrack, type LiveSet } from './';

export type PropUpdate = TrackPropUpdate | SetPropUpdate;
export type PropUpdateScope = PropUpdate['scope'];
const propUpdateScopes: PropUpdateScope[] = ['track', 'set'] as const;

export type TrackPropUpdate = {
	type: 'propUpdate';
	scope: 'track';
	trackType: 'midiOrAudio' | 'group';
	trackId: string;
	update: Partial<MidiOrAudioTrack | GroupTrack>;
};

export type SetPropUpdate = {
	type: 'propUpdate';
	scope: 'set';
	update: Partial<LiveSet>;
};

export const isPropUpdate = (unknown: unknown): unknown is PropUpdate => {
	return (
		isChange(unknown) && unknown.type == 'propUpdate' && propUpdateScopes.includes(unknown.scope)
	);
};
