import { isChange, type GroupTrack, type MidiOrAudioTrack, type SetState } from './';

export type PropUpdate = TrackUpdate | SetUpdate;
export type PropUpdateScope = PropUpdate['scope'];
const propUpdateScopes: PropUpdateScope[] = ['track', 'set'] as const;

export type TrackUpdate = {
	type: 'propUpdate';
	scope: 'track';
	trackType: 'midiOrAudio' | 'group';
	trackId: string;
	update: Partial<MidiOrAudioTrack | GroupTrack>;
};

export type SetUpdate = {
	type: 'propUpdate';
	scope: 'set';
	update: Partial<SetState>;
};

export const isPropUpdate = (unknown: unknown): unknown is PropUpdate => {
	return (
		isChange(unknown) &&
		unknown.type == 'propUpdate' &&
		'scope' in unknown &&
		propUpdateScopes.includes(unknown.scope)
	);
};
