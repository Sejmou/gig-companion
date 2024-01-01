// TODO: properly implement commented out stuff using StateManager

// import type { GroupTrack, MidiOrAudioTrack, Track, TrackBase } from '$lib/ableton/types/state/track';
// import { TwoWayMap } from '$lib/utils';
// import type { Ableton } from 'ableton-js';
// import type { Track as AbletonTrack } from 'ableton-js/ns/track';
// import { AbletonStateManager } from '.';

// export class TracksStateManager extends AbletonStateManager<Track[]> {
// 	protected stateType = 'set';

// 	protected async getStateSnapshot(): Promise<Track[]> {
// 		const playing = await this.ableton.song.get('is_playing');
// 		const bpm = await this.ableton.song.get('tempo');
// 		const time = await this.ableton.song.get('current_song_time');
// 		return {
// 			playing,
// 			bpm,
// 			time,
// 			connected: true
// 		};
// 	}

// 	protected setupListeners(updateHandler: (update: Partial<Track[]>) => Promise<void>): void {

// 	}

// 	protected async set(update: Partial<Track[]>) {
// 		const { playing, bpm, time } = update;
// 		if (playing !== undefined) {
// 			await this.ableton.song.set('is_playing', playing);
// 		}
// 		if (bpm !== undefined) {
// 			await this.ableton.song.set('tempo', bpm);
// 		}
// 		if (time !== undefined) {
// 			await this.ableton.song.set('current_song_time', time);
// 		}
// 	}
// }

// async function getCurrentTracks(ableton: Ableton) {
// 	const tracks = await ableton.song.get('tracks');
// 	const { tracksMap, parentIdChildrenMap } = await getAbletonTracksAndChildren(tracks);
// 	const tempTracks = await Promise.all(tracks.map((t) => processTrack(t, parentIdChildrenMap)));
// 	const tempTracksMap = new Map(tempTracks.map((t) => [t.id, t]));
// 	const trackIds = Array.from(tracksMap.keys());
// 	const childIds = new Set(Array.from(parentIdChildrenMap.values()).flat());
// 	const rootIds = trackIds.filter((id) => !childIds.has(id));
// 	const processedTrackMap: Map<string, ServerTrack> = new Map();
// 	const result: ServerTrack[] = [];
// 	for (const id of rootIds) {
// 		result.push(buildTrackTree(tempTracksMap, processedTrackMap, id));
// 	}

// 	return result;
// }

// function buildTrackTree(
// 	tempTracksMap: Map<string, TempTrack>,
// 	processedTrackMap: Map<string, ServerTrack>,
// 	trackId: string,
// 	parent?: ServerGroupTrack
// ): ServerTrack {
// 	const track = tempTracksMap.get(trackId)!;
// 	if (track.type === 'midiOrAudio') {
// 		const processed: ServerMidiOrAudioTrack = {
// 			...track,
// 			parent
// 		};
// 		processedTrackMap.set(trackId, processed);
// 		return processed;
// 	} else {
// 		// track is a group track
// 		const processed: ServerGroupTrack = {
// 			...track,
// 			parent,
// 			children: []
// 		};
// 		processedTrackMap.set(trackId, processed);
// 		const children = track.childIds.map((id) =>
// 			buildTrackTree(tempTracksMap, processedTrackMap, id, processed)
// 		);
// 		processed.children = children;
// 		return processed;
// 	}
// }

// async function getAbletonTracksAndChildren(tracks: AbletonTrack[]) {
// 	const tracksMap = new Map<string, AbletonTrack>();
// 	const parentIdChildrenMap = new Map<string, string[]>();
// 	for (const track of tracks) {
// 		const parentId = await track.get('group_track').then((t) => t?.id);
// 		if (parentId) {
// 			if (!parentIdChildrenMap.has(parentId)) {
// 				parentIdChildrenMap.set(parentId, []);
// 			}
// 			parentIdChildrenMap.get(parentId)!.push(track.raw.id);
// 		}
// 		tracksMap.set(track.raw.id, track);
// 	}
// 	return { tracksMap, parentIdChildrenMap };
// }

// type TempBaseTrack = TrackBase & {
// 	raw: AbletonTrack;
// };
// type TempGroupTrack = GroupTrack & {
// 	raw: AbletonTrack;
// };
// type TempMidiOrAudioTrack = MidiOrAudioTrack & {
// 	raw: AbletonTrack;
// };
// type TempTrack = TempGroupTrack | TempMidiOrAudioTrack;

// // type ServerBaseTrack = Omit<TrackBase, 'parentId'> & {
// // 	parent?: ServerTrack;
// // 	raw: AbletonTrack;
// // };
// type ServerGroupTrack = GroupTrack & {
// 	parent?: ServerTrack;
// 	children: ServerTrack[];
// 	raw: AbletonTrack;
// };
// type ServerMidiOrAudioTrack = MidiOrAudioTrack & {
// 	parent?: ServerTrack;
// 	raw: AbletonTrack;
// };
// type ServerTrack = ServerGroupTrack | ServerMidiOrAudioTrack;

// /**
//  * Processes an Ableton track and returns a track object that can be used by the frontend.
//  * The original Ableton track is also returned so that the server can use it to update the track
//  * after receiving a message from the frontend.
//  * @param raw AbletonJS track
//  */
// async function processTrack(
// 	raw: AbletonTrack,
// 	parentIdChildrenMap: Map<string, string[]>
// ): Promise<TempTrack> {
// 	const canBeArmed = await raw.get('can_be_armed');
// 	const id = raw.raw.id;
// 	const parentId = await raw.get('group_track').then((t) => t?.id);
// 	const devices = await raw.get('devices');
// 	const name = await raw.get('name');
// 	const muted = await raw.get('mute');
// 	const soloed = await raw.get('solo');

// 	const baseTrack: TempBaseTrack = {
// 		id,
// 		name,
// 		devices,
// 		parentId,
// 		muted,
// 		soloed,
// 		raw
// 	};

// 	if (!canBeArmed) {
// 		const groupTrack: TempGroupTrack = {
// 			...baseTrack,
// 			type: 'group',
// 			childIds: parentIdChildrenMap.get(id) ?? []
// 		};
// 		return groupTrack;
// 	}

// 	const armed = await raw.get('arm');
// 	const monitoringState = numberToMonitoringState.getByKey(
// 		await raw.get('current_monitoring_state')
// 	);
// 	if (!monitoringState) throw new Error(`Unknown monitoring state ${monitoringState}`);

// 	const midiOrAudioTrack: TempMidiOrAudioTrack = {
// 		...baseTrack,
// 		type: 'midiOrAudio',
// 		armed,
// 		monitoringState
// 	};

// 	return midiOrAudioTrack;
// }

// export const numberToMonitoringState = new TwoWayMap<number, MidiOrAudioTrack['monitoringState']>([
// 	[0, 'off'],
// 	[1, 'in'],
// 	[2, 'auto']
// ]);

// import type { TrackUpdate } from '$lib/ableton/types/websocket-api/server/state-updates/track';
// import type { Ableton } from 'ableton-js';
// import { numberToMonitoringState } from '../../state-updates/track';

// export async function updateTrackProp(ableton: Ableton, request: TrackUpdate) {
// 	const { trackId, update: trackUpdate } = request;
// 	const tracks = await ableton.song.get('tracks');
// 	const track = tracks.find((t) => t.raw.id === trackId);
// 	if (!track) {
// 		console.warn(`Track with id ${trackId} not found`);
// 		return;
// 	}
// 	const { muted, soloed } = trackUpdate;
// 	if (muted !== undefined) {
// 		console.log(`Setting track ${trackId} mute to ${muted}`);
// 		await track.set('mute', muted);
// 	}
// 	if (soloed !== undefined) {
// 		console.log(`Setting track ${trackId} solo to ${soloed}`);
// 		await track.set('solo', Boolean(soloed));
// 	}
// 	if (trackUpdate.type == 'midiOrAudio') {
// 		const { armed, monitoringState } = trackUpdate;
// 		if (armed !== undefined) {
// 			console.log(`Setting track ${trackId} arm to ${armed}`);
// 			await track.set('arm', armed);
// 		}
// 		if (monitoringState !== undefined) {
// 			console.log(`Setting track ${trackId} monitoring state to ${monitoringState}`);
// 			const stateNumber = numberToMonitoringState.getByValue(monitoringState);
// 			if (!stateNumber) {
// 				console.warn(`Cloud not find number mapping for monitoring state '${monitoringState}'`);
// 				return;
// 			}
// 			await track.set('current_monitoring_state', stateNumber);
// 		}
// 	}
// }
