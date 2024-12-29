import { derived } from 'svelte/store';
import { rootTracks } from '../tracks';
import { songs } from './songs';
import {
	getGroupTrackState,
	getMidiOrAudioTrackState,
	type GroupTrackState,
	type MidiOrAudioTrackState
} from '../track';
import { currentSongName } from './songs';

const songSoundsGroupTrackName = 'Guitar Sounds';
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

export const currentSongSounds = derived(
	[songSounds, currentSongName],
	([$songSounds, $songName]) => {
		if (!$songName) {
			return null;
		}
		return $songSounds.get($songName) ?? null;
	}
);

export const currentSoundsAudioTracks = derived(
	currentSongSounds,
	($currentSongSounds) => $currentSongSounds?.audioTracks ?? []
);
export const currentSoundsGroupTrack = derived(
	currentSongSounds,
	($currentSongSounds) => $currentSongSounds?.groupTrack
);

export const soundsForOtherSongs = derived(
	[songSounds, currentSongName],
	([$songSounds, $songName]) => {
		if (!$songName) {
			return Array.from($songSounds.values());
		}
		const allSounds = Array.from($songSounds.values());
		const soundsForOthers = allSounds.filter((sounds) => sounds.groupTrack.name !== $songName);
		return soundsForOthers;
	}
);

export const currentSound = derived(currentSoundsAudioTracks, ($currentAudioTracks) => {
	return $currentAudioTracks.find((track) => track.armed);
});

export const nextSound = derived(
	[currentSound, currentSoundsAudioTracks],
	([$currentSound, $currentAudioTracks]) => {
		const currentSoundIdx = $currentAudioTracks.findIndex((sound) => sound === $currentSound);
		if (currentSoundIdx === -1) {
			return null;
		}
		return $currentAudioTracks[currentSoundIdx + 1] ?? null;
	}
);

export const prevSound = derived(
	[currentSound, currentSoundsAudioTracks],
	([$currentSound, $currentSoundsAudioTracks]) => {
		const currentSoundIdx = $currentSoundsAudioTracks.findIndex((sound) => sound === $currentSound);
		if (currentSoundIdx === -1) {
			return null;
		}
		return $currentSoundsAudioTracks[currentSoundIdx - 1] ?? null;
	}
);

export type SongSounds = {
	groupTrack: GroupTrackState;
	audioTracks: MidiOrAudioTrackState[];
};
