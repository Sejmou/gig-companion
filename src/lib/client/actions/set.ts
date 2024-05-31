import { get } from 'svelte/store';
import { currentSong, nextSong, prevSong, type Song } from '../stores/ableton/derived/songs';
import { soundsForOtherSongs } from '../stores/ableton/derived/sounds';

export function goToNextSong() {
	const song = get(nextSong);
	if (song) {
		song.start.jump();
	}
}

export function goToPrevSong() {
	const song = get(prevSong);
	if (song) {
		song.start.jump();
	}
}

export function switchToSong(song: Song) {
	song.start.jump();
	const newSong = get(currentSong);
	if (newSong !== song) {
		console.warn('Failed to switch to song:', song);
		return;
	}
	const otherSongSounds = get(soundsForOtherSongs);
	for (const songSounds of otherSongSounds) {
		songSounds.groupTrack.muted.set(true);
		for (const audioTrack of songSounds.audioTracks) {
			audioTrack.muted.set(true);
			audioTrack.armed.set(false);
			audioTrack.monitoringState.set('auto');
		}
	}
}
