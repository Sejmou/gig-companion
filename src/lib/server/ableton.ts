import type { GroupTrack, MidiOrAudioTrack, Change, TrackBase } from '$lib/ableton/types';
import type { Action } from '$lib/ableton/types/actions';
import type { PropUpdate } from '$lib/ableton/types/prop-updates';
import type { Ableton } from 'ableton-js';
import type { Track as AbletonTrack } from 'ableton-js/ns/track';
import { GlobalThisAbleton, GlobalThisWSS } from './websocket';
import type { ExtendedGlobal } from './websocket';

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

export async function getTracks(ableton: Ableton) {
	const tracks = await ableton.song.get('tracks');
	const processedTracks = await Promise.all(tracks.map(processTrack));
	return processedTracks;
}

/**
 * Processes an Ableton track and returns a track object that can be used by the frontend.
 * The original Ableton track is also returned so that the server can use it to update the track
 * after receiving a message from the frontend.
 * @param ableTrack AbletonJS track
 */
async function processTrack(
	ableTrack: AbletonTrack
): Promise<{ track: MidiOrAudioTrack | GroupTrack; abletonTrack: AbletonTrack }> {
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
		const groupTrack: GroupTrack = {
			...baseTrack,
			type: 'group'
		};
		return { track: groupTrack, abletonTrack: ableTrack };
	}

	const armed = await ableTrack.get('arm');
	const monitoringState = await ableTrack.get('current_monitoring_state');

	const midiOrAudioTrack: MidiOrAudioTrack = {
		...baseTrack,
		type: 'midiOrAudio',
		armed,
		monitoringState
	};

	return { track: midiOrAudioTrack, abletonTrack: ableTrack };
}

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
				await track.set('current_monitoring_state', monitoringState);
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
