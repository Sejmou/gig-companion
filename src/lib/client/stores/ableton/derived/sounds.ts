import { derived } from 'svelte/store';
import { rootTracks } from '../tracks';
import { songs } from './songs';
import {
	getGroupTrackState,
	getMidiOrAudioTrackState,
	type GroupTrackState,
	type MidiOrAudioTrackState
} from '../track';

const songSoundsGroupTrackName = 'Song Sounds';
export const songSoundsGroup = derived(rootTracks, ($rootTracks) => {
	return $rootTracks.find((track) => track.name === songSoundsGroupTrackName);
});

export const songSounds = derived([songSoundsGroup, songs], ([$songSoundsGroup, $songs]) => {
	const songSounds = new Map<string, SongSounds>();
	if (!$songSoundsGroup) {
		console.warn(`Cannot get sounds: No track with name '${songSoundsGroupTrackName}' found`);
		// return empty map
		return songSounds;
	}
	if ($songSoundsGroup.type !== 'group') {
		console.warn(
			`Cannot get sounds: Track with name '${songSoundsGroupTrackName}' is not a group track`
		);
		// return empty map
		return songSounds;
	}

	const sounds: SongSounds[] = [];
	for (const track of $songSoundsGroup.children) {
		if (track.type === 'midiOrAudio') {
			console.warn('Unexpected midiOrAudio track in sounds group track', track.name);
			continue;
		}
		const groupTrack = getGroupTrackState(track.id);
		if (!groupTrack) {
			console.warn(`Cannot get sounds: No state found for group track '${track.name}'`);
			continue;
		}
		const audioTracks: MidiOrAudioTrackState[] = [];
		for (const child of track.children) {
			if (child.type !== 'midiOrAudio') {
				console.warn(`Unexpected track type in sounds group track '${track.name}':`, child.type);
				continue;
			}
			const audioTrack = getMidiOrAudioTrackState(child.id);
			if (!audioTrack) {
				console.warn(`Cannot get sounds: No state found for audio track '${child.name}'`);
				continue;
			}
			audioTracks.push(audioTrack);
		}
		sounds.push({ groupTrack, audioTracks });
	}

	const songNames = $songs.map((song) => song.name);
	const remainingSongNames = new Set(songNames);
	for (const sound of sounds) {
		const songGroupName = sound.groupTrack.name;
		if (songNames.includes(songGroupName)) {
			songSounds.set(songGroupName, sound);
			remainingSongNames.delete(songGroupName);
		} else {
			console.warn(`Song sound group track '${songGroupName}' has no matching song`);
		}
	}
	if (remainingSongNames.size > 0) {
		console.warn('No sound group track found for songs:', remainingSongNames);
	}
	return songSounds;
});

export type SongSounds = {
	groupTrack: GroupTrackState;
	audioTracks: MidiOrAudioTrackState[];
};
