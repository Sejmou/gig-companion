import type { SetUpdate } from '$lib/ableton/types/prop-updates';
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
