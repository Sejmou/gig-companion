import type { SetUpdate } from '$lib/ableton/types/state-updates/set';
import type { Ableton } from 'ableton-js';

export async function updateSetProp(ableton: Ableton, request: SetUpdate) {
	const { playing, bpm, time } = request.update;
	if (playing !== undefined) {
		console.log(`Setting playing to ${playing}`);
		await ableton.song.set('is_playing', playing);
	}
	if (bpm !== undefined) {
		console.log(`Setting bpm to ${bpm}`);
		await ableton.song.set('tempo', bpm);
	}
	if (time !== undefined) {
		console.log(`Setting time to ${time}`);
		await ableton.song.set('current_song_time', time);
	}
}
