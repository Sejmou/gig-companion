import type { Change } from '$lib/ableton/types';
import type { Action } from '$lib/ableton/types/actions';
import type { PropUpdate } from '$lib/ableton/types/prop-updates';
import { GlobalThisAbleton, GlobalThisWSS } from '../init';
import type { ExtendedGlobal } from '../init';
import { numberToMonitoringState } from './tracks';

/**
 * Broadcasts a state update to all connected clients.
 */
export async function broadcastChange(change: Change) {
	const wss = (globalThis as ExtendedGlobal)[GlobalThisWSS];
	wss.clients.forEach((client) => {
		client.send(JSON.stringify(change));
	});
}

export async function processClientPropUpdateRequest(update: PropUpdate) {
	const ableton = (globalThis as ExtendedGlobal)[GlobalThisAbleton];
	if (update.scope === 'set') {
		const { playing, bpm, time } = update.update;
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
	} else if (update.scope === 'track') {
		const { trackId, update: trackUpdate } = update;
		const tracks = await ableton.song.get('tracks');
		const track = tracks.find((t) => t.raw.id === trackId);
		if (!track) {
			console.warn(`Track with id ${trackId} not found`);
			return;
		}
		const { muted, soloed } = trackUpdate;
		if (muted !== undefined) {
			console.log(`Setting track ${trackId} mute to ${muted}`);
			await track.set('mute', muted);
		}
		if (soloed !== undefined) {
			console.log(`Setting track ${trackId} solo to ${soloed}`);
			await track.set('solo', Boolean(soloed));
		}
		if (trackUpdate.type == 'midiOrAudio') {
			const { armed, monitoringState } = trackUpdate;
			if (armed !== undefined) {
				console.log(`Setting track ${trackId} arm to ${armed}`);
				await track.set('arm', armed);
			}
			if (monitoringState !== undefined) {
				console.log(`Setting track ${trackId} monitoring state to ${monitoringState}`);
				const stateNumber = numberToMonitoringState.getByValue(monitoringState);
				if (!stateNumber) {
					console.warn(`Cloud not find number mapping for monitoring state '${monitoringState}'`);
					return;
				}
				await track.set('current_monitoring_state', stateNumber);
			}
		}
	}
}

export async function processClientAction(action: Action) {
	const ableton = (globalThis as ExtendedGlobal)[GlobalThisAbleton];
	if (action.scope === 'set') {
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
}
