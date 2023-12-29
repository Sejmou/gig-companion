import type { Ableton } from 'ableton-js';
import type { WebSocket } from 'ws';
import { broadcastChange } from '.';

export async function sendCurrentSetState(ws: WebSocket, ableton: Ableton) {
	const playing = await ableton.song.get('is_playing');
	const bpm = await ableton.song.get('tempo');
	const time = await ableton.song.get('current_song_time');
	ws.send(
		JSON.stringify({
			type: 'propUpdate',
			scope: 'set',
			update: {
				playing,
				bpm,
				time
			}
		})
	);
}

export function setupSetUpdateListeners(ableton: Ableton) {
	ableton.song.addListener('is_playing', (playing) => {
		broadcastChange({
			type: 'propUpdate',
			scope: 'set',
			update: {
				playing
			}
		});
	});

	ableton.song.addListener('tempo', (bpm) => {
		broadcastChange({
			type: 'propUpdate',
			scope: 'set',
			update: {
				bpm
			}
		});
	});

	ableton.song.addListener('current_song_time', (time) => {
		broadcastChange({
			type: 'propUpdate',
			scope: 'set',
			update: {
				time
			}
		});
	});
}
