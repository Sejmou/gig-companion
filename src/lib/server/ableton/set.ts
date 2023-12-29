import type { WebSocket } from 'ws';
import { broadcastChange } from '.';
import type { SetPropUpdate } from '$lib/ableton/types/prop-updates';
import { getAbleton } from '$lib/server/init';
import type { SetAction } from '$lib/ableton/types/actions';

export async function sendCurrentSetState(ws: WebSocket) {
	const ableton = getAbleton();
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

export async function updateSetProp(request: SetPropUpdate) {
	const ableton = getAbleton();
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

export async function processSetAction(action: SetAction) {
	const ableton = getAbleton();
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

export function setupSetUpdateListeners() {
	const ableton = getAbleton();
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
