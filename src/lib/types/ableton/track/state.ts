/**
 * Ableton Live track state to be used for communication between the SvelteKit Server Backend and the Clients.
 *
 * This is essentially a "JSON serializable version/subset" of the `ServerTrack` type (i.e. it excludes the raw AbletonJS track reference).
 */
export type Track = MidiOrAudioTrack | GroupTrack;

/**
 * A track that can be armed (i.e. a MIDI or Audio track).
 */
export type MidiOrAudioTrack = TrackBase & {
	type: 'midiOrAudio';
	armed: boolean;
	monitoringState: 'in' | 'auto' | 'off';
};

/**
 * A track that groups other tracks. Those tracks can be either `MidiOrAudioTrack`s or `GroupTrack`s.
 */
export type GroupTrack = TrackBase & {
	type: 'group';
	childIds: string[]; // not observable
};

export type TrackBase = {
	id: string; // not observable, but needs to be present to uniquely identify update
	name: string; // not observable
	// devices: Device[]; // TODO: implement support for this
	parentId?: string; // not observable
	muted: boolean;
	soloed: boolean;
};

/**
 * Track state that is observable by the frontend (subset of `Track`).
 *
 * This excludes properties like `parentId` or `childIds` that are not observable.
 */
export type ObservableTrackState =
	| Omit<GroupTrack, 'name' | 'parentId' | 'childIds'>
	| Omit<MidiOrAudioTrack, 'name' | 'parentId'>;
// the following does not work as expected:
// export type ObservableTrackState = Omit<Track, 'name' | 'parentId' | 'childIds'>;
