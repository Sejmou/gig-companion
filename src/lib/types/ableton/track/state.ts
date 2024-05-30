/**
 * Ableton Live track state to be used for communication between the SvelteKit Server Backend and the Clients.
 *
 * This is essentially a "JSON serializable version/subset" of the `ServerTrack` type (i.e. it excludes the raw AbletonJS track reference).
 */
export type Track = MidiOrAudioTrack | GroupTrack;

/**
 * A track that can be armed (i.e. a MIDI or Audio track).
 */
export type MidiOrAudioTrack = BaseTrack & {
	type: 'midiOrAudio';
	armed: boolean;
	monitoringState: 'in' | 'auto' | 'off';
};

/**
 * A track that groups other tracks. Those tracks can be either `MidiOrAudioTrack`s or `GroupTrack`s.
 */
export type GroupTrack = BaseTrack & {
	type: 'group';
	children: Track[]; // not observable
};

export type BaseTrack = {
	id: string; // not observable, but needs to be present to uniquely identify update
	name: string; // not observable
	devices: Device[]; // TODO: implement support for this
	parentId?: string; // not observable
	muted: boolean;
	soloed: boolean;
};

export type Device = {
	name: string;
	active: boolean;
};

/**
 * Track state that is observable by the frontend (subset of `Track`).
 *
 * This excludes properties like `name`, `parentId` or `childIds` that are not observable, but includes `id` and `type` as they are needed to identify the track and type of change.
 */
export type ObservableTrackStateUpdate =
	| ObservableGroupTrackStateUpdate
	| ObservableMidiOrAudioTrackStateUpdate;
// the following does not work as expected:
// export type ObservableTrackState = Omit<Track, 'name' | 'parentId' | 'childIds'>;

export type ObservableGroupTrackStateUpdate = {
	id: string;
	type: 'group';
} & Partial<Omit<GroupTrack, 'name' | 'parentId' | 'childIds' | 'children'>>;
export type ObservableMidiOrAudioTrackStateUpdate = {
	id: string;
	type: 'midiOrAudio';
} & Partial<Omit<MidiOrAudioTrack, 'name' | 'parentId'>>;
