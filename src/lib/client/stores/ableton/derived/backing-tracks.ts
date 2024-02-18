import { derived } from 'svelte/store';
import { rootTracks } from '../tracks';
import {
	getMidiOrAudioTrackState,
	getGroupTrackState,
	type GroupTrackState,
	type MidiOrAudioTrackState
} from '../track';
import type { Track } from '$lib/types/ableton/track/state';

const backingTracksGroupTrackName = 'Backing Tracks';

// TODO: consider making backing tracks song-specific as well (like sounds)
export type BackingTracks = {
	groupTrack: GroupTrackState;
	audioTracks: MidiOrAudioTrackState[];
};

export const backingTracks = derived(rootTracks, getBackingTracks);

function getBackingTracks(tracks: Track[]): BackingTracks | undefined {
	const backingTracksGroup = tracks.find((track) => track.name === backingTracksGroupTrackName);
	if (!backingTracksGroup) {
		console.warn(
			`Cannot get backing tracks: No track with name '${backingTracksGroupTrackName}' found`
		);
		return;
	}
	if (backingTracksGroup.type !== 'group') {
		console.warn(
			`Cannot get backing tracks: Track with name '${backingTracksGroupTrackName}' is not a group track`
		);
		return;
	}
	const groupTrack = getGroupTrackState(backingTracksGroup.id);
	if (!groupTrack) {
		console.warn(
			`Cannot get backing tracks: No state found for group track '${backingTracksGroup.name}'`
		);
		return;
	}
	const audioTracks: MidiOrAudioTrackState[] = [];
	for (const track of backingTracksGroup.children) {
		if (track.type !== 'midiOrAudio') {
			console.warn('Unexpected midiOrAudio track in backing tracks group track', track.name);
			continue;
		}
		const audioTrack = getMidiOrAudioTrackState(track.id);
		if (!audioTrack) {
			console.warn(`Cannot get backing tracks: No state found for audio track '${track.name}'`);
			continue;
		}
		audioTracks.push(audioTrack);
	}
	return { groupTrack, audioTracks };
}
