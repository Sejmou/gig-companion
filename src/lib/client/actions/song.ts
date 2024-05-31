import { get } from 'svelte/store';
import {
	currentSongSounds,
	soundsForOtherSongs,
	currentSoundsAudioTracks,
	nextSound,
	prevSound
} from '../stores/ableton/derived/sounds';
import type { MidiOrAudioTrackState } from '../stores/ableton/track';

export function useSound(sound: MidiOrAudioTrackState) {
	const songSounds = get(currentSongSounds);
	if (!songSounds) {
		console.warn('Cannot use sound:', sound, 'no song sounds found');
		return;
	}
	const { groupTrack, audioTracks } = songSounds;
	const otherSounds = audioTracks.filter((track) => track !== sound);
	for (const other of otherSounds) {
		other.armed.set(false);
		other.monitoringState.set('auto');
	}
	sound.armed.set(true);
	sound.monitoringState.set('in');
	groupTrack.muted.set(false);

	const soundsForOthers = get(soundsForOtherSongs);
	for (const otherSongSounds of soundsForOthers) {
		otherSongSounds.groupTrack.muted.set(true);
		for (const audioTrack of otherSongSounds.audioTracks) {
			audioTrack.muted.set(true);
			audioTrack.armed.set(false);
			audioTrack.monitoringState.set('auto');
		}
	}
}

export function switchToNextSound() {
	const $nextSound = get(nextSound);
	if (!$nextSound) {
		// just try to pick the first sound
		const firstSound = get(currentSoundsAudioTracks)[0];
		if (firstSound) {
			useSound(firstSound);
		} else {
			console.warn('Cannot activate next sound: no sounds found!');
		}
		return;
	}
	useSound($nextSound);
}

export function switchToPrevSound() {
	const $prevSound = get(prevSound);
	if (!$prevSound) {
		// just try to pick the last sound
		const lastSound = get(currentSoundsAudioTracks).at(-1);
		if (lastSound) {
			useSound(lastSound);
		} else {
			console.warn('Cannot activate previous sound: no sounds found!');
		}
		return;
	}
	useSound($prevSound);
}

export function useSoundAtIndex(index: number) {
	const sounds = get(currentSoundsAudioTracks);
	if (index < 0 || index >= sounds.length) {
		console.warn('Cannot activate sound at index', index, ': index out of bounds');
		return;
	}
	useSound(sounds[index]!);
}

export function useFirstSound() {
	useSoundAtIndex(0);
}
