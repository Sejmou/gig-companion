import type { TrackUpdate } from '$lib/ableton/types/prop-updates/track';
import type { Ableton } from 'ableton-js';
import { numberToMonitoringState } from '../../out/state/track';

export async function updateTrackProp(ableton: Ableton, request: TrackUpdate) {
	const { trackId, update: trackUpdate } = request;
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
