import type { GroupTrack, MidiOrAudioTrack, TrackBase } from '$lib/ableton/types';
import type { TrackUpdate } from '$lib/ableton/types/prop-updates';
import { TwoWayMap } from '$lib/utils';
import type { Ableton } from 'ableton-js';
import type { Track as AbletonTrack } from 'ableton-js/ns/track';

export async function getCurrentTracks(ableton: Ableton) {
	const tracks = await ableton.song.get('tracks');
	const processedTracks = await Promise.all(tracks.map(processTrack));
	const groupTrackIdsAndChildren = new Map<string, string[]>();
	for (const track of processedTracks.map((t) => t.track)) {
		if (track.parentId) {
			if (!groupTrackIdsAndChildren.has(track.parentId)) {
				groupTrackIdsAndChildren.set(track.parentId, []);
			} else {
				groupTrackIdsAndChildren.get(track.parentId)!.push(track.id);
			}
		}
	}
	console.log(groupTrackIdsAndChildren);

	return processedTracks;
}

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

/**
 * Processes an Ableton track and returns a track object that can be used by the frontend.
 * The original Ableton track is also returned so that the server can use it to update the track
 * after receiving a message from the frontend.
 * @param ableTrack AbletonJS track
 */
async function processTrack(
	ableTrack: AbletonTrack
): Promise<{ track: MidiOrAudioTrack | Omit<GroupTrack, 'tracks'>; abletonTrack: AbletonTrack }> {
	const canBeArmed = await ableTrack.get('can_be_armed');
	const id = ableTrack.raw.id;
	const parentId = await ableTrack.get('group_track').then((t) => t?.id);
	const devices = await ableTrack.get('devices');
	const name = await ableTrack.get('name');
	const muted = await ableTrack.get('mute');
	const soloed = await ableTrack.get('solo');

	const baseTrack: TrackBase = {
		id,
		name,
		devices,
		parentId,
		muted,
		soloed
	};

	if (!canBeArmed) {
		const groupTrack: Omit<GroupTrack, 'tracks'> = {
			...baseTrack,
			type: 'group'
		};
		return { track: groupTrack, abletonTrack: ableTrack };
	}

	const armed = await ableTrack.get('arm');
	const monitoringState = numberToMonitoringState.getByKey(
		await ableTrack.get('current_monitoring_state')
	);
	if (!monitoringState) throw new Error(`Unknown monitoring state ${monitoringState}`);

	const midiOrAudioTrack: MidiOrAudioTrack = {
		...baseTrack,
		type: 'midiOrAudio',
		armed,
		monitoringState
	};

	return { track: midiOrAudioTrack, abletonTrack: ableTrack };
}

export const numberToMonitoringState = new TwoWayMap<number, MidiOrAudioTrack['monitoringState']>([
	[0, 'off'],
	[1, 'in'],
	[2, 'auto']
]);
