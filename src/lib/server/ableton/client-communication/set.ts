import type { SetUpdate } from '$lib/ableton/types/prop-updates';
import type { SetAction } from '$lib/ableton/types/actions';
import type { Ableton } from 'ableton-js';
import type { SetState } from '$lib/ableton/types';

export async function getCurrentSetState(ableton: Ableton): Promise<SetState> {
	const playing = await ableton.song.get('is_playing');
	const bpm = await ableton.song.get('tempo');
	const time = await ableton.song.get('current_song_time');
	return {
		playing,
		bpm,
		time,
		connected: true,
		// TODO: implement song extraction
		songs: []
	};
}

export async function setupSetUpdateListeners(
	ableton: Ableton,
	handler: (update: SetUpdate['update']) => Promise<void>
) {
	ableton.song.addListener('is_playing', (playing) => {
		handler({
			playing
		});
	});

	ableton.song.addListener('tempo', (bpm) => {
		handler({
			bpm
		});
	});

	ableton.song.addListener('current_song_time', (time) =>
		handler({
			time
		})
	);
}

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

export async function executeSetAction(ableton: Ableton, action: SetAction) {
	if (!ableton) return;
	if (action.name === 'continuePlayback') {
		await ableton.song.continuePlaying();
	}
	if (action.name === 'stopPlayback') {
		await ableton.song.stopPlaying();
	}
	if (action.name === 'startPlayback') {
		await ableton.song.startPlaying();
	}
}
