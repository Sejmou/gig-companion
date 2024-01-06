// TODO: implement track state management logic

// import type {
// 	GroupTrack,
// 	MidiOrAudioTrack,
// 	ObservableTrackState,
// 	TrackBase
// } from '$lib/types/ableton/track/state';
// import type { Track as AbletonTrack } from 'ableton-js/ns/track';
// import { TwoWayMap } from '$lib/utils';
// import type { Ableton } from 'ableton-js';
// import type { TrackAction } from '$lib/types/ableton/track/actions';

// export class TrackStateManager {
// 	private tracks: ServerTrack[];
// 	constructor(
// 		private readonly ableton: Ableton,
// 		private readonly onUpdate: (update: Partial<ObservableTrackState>) => void
// 	) {
// 		this.setupListeners();
// 	}

// 	// protected setupListeners(): void {
// 	// 	const { raw, type } = this.track;
// 	// 	raw.addListener('mute', (mutedNumber) => {
// 	// 		const muted = Boolean(mutedNumber);
// 	// 		this.track.muted = muted;
// 	// 		this.onUpdate({ muted });
// 	// 	});
// 	// 	raw.addListener('solo', (soloed) => {
// 	// 		this.track.soloed = soloed;
// 	// 		this.onUpdate({ soloed });
// 	// 	});
// 	// 	if (type === 'midiOrAudio') {
// 	// 		if (this.track.type !== 'midiOrAudio') {
// 	// 			console.error(
// 	// 				'Something went wrong: ServerTrack type is not midiOrAudio, but it should be'
// 	// 			);
// 	// 			return;
// 	// 		}
// 	// 		const mOrATrack = this.track; // not sure why this assignment is necessary to make TS happy
// 	// 		raw.addListener('arm', (armedNum) => {
// 	// 			const armed = Boolean(armedNum);
// 	// 			mOrATrack.armed = armed;
// 	// 			this.onUpdate({ armed });
// 	// 		});
// 	// 		raw.addListener('current_monitoring_state', (monitoringStateNum) => {
// 	// 			const monitoringState = numberToMonitoringState.getByKey(monitoringStateNum);
// 	// 			if (monitoringState) {
// 	// 				mOrATrack.monitoringState = monitoringState;
// 	// 				this.onUpdate({ monitoringState });
// 	// 			} else console.error(`Unknown monitoring state ${monitoringState}`);
// 	// 		});
// 	// 	}
// 	// }

// 	async getStateSnapshot(): Promise<ObservableTrackState> {
// 		const { raw, type, id, muted, soloed, pare } = this.track;
// 		const baseClientTrack: ObservableTrackState = {
// 			type,
// 			id
// 		};
// 		return clientTrack;
// 	}

// 	async handleAction(action: TrackAction): Promise<boolean> {
// 		const { id, name } = action;
// 		const track = this.tracks.find((t) => t.id === id);
// 		if (!track) {
// 			console.warn(`Could not find track with id ${id}`);
// 			return false;
// 		}

// 		if (name === 'mute') {
// 			await track.raw.set('mute', true);
// 		} else if (name === 'solo') {
// 			await track.raw.set('solo', true);
// 		} else if (name === 'arm') {
// 			await track.raw.set('arm', true);
// 		} else if (name === 'setMonitoringState') {
// 			await track.raw.set(
// 				'current_monitoring_state',
// 				numberToMonitoringState.getByValue(action.monitoringState)!
// 			);
// 		} else if (name === 'disarm') {
// 			await track.raw.set('arm', false);
// 		} else if (name === 'unmute') {
// 			await track.raw.set('mute', false);
// 		} else if (name === 'unsolo') {
// 			await track.raw.set('solo', false);
// 		} else {
// 			console.warn(`Could not handle client message as action is not recognized`, action);
// 			return false;
// 		}

// 		return true;
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
// /**
//  * A server-side only internal representation of a track. It contains properties that encapsulate the state of a particular track in the Live Set
//  *
//  * It improves on AbletonJS's Track type by improving the typing compared to AbletonJS's Track type and adding other properties. This includes (among other things):
//  * - additional `type` property that is either `'group'` or `'midiOrAudio'` to help distinguish between the two types of tracks: `MidiOrAudioTrack` and `GroupTrack` (types for tracks that can be armed and tracks that group other tracks, respectively)
//  * - improved typing for the monitoring state of MidiOrAudioTracks (`'in' | 'auto' | 'off'` instead of just a magic `number`)
//  * - additional `parentId` and `parent` properties to allow building and managing 'trees' of tracks, just as they exist in Ableton Live (e.g. a group track can have other group tracks as children; midiOrAudio tracks can only have group tracks represent 'leaf nodes' in each tree)
//  * - a `raw` property that is a reference to the AbletonJS `Track` (this is useful for updating the AbletonJS track after receiving a message from the frontend)
//  *
//  */
// export type ServerTrack = ServerGroupTrack | ServerMidiOrAudioTrack;

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
// 	// const devices = await raw.get('devices'); // TODO: add that
// 	const name = await raw.get('name');
// 	const muted = await raw.get('mute');
// 	// not sure why this is not a boolean
// 	const soloed = Boolean(await raw.get('solo'));

// 	const baseTrack: TempBaseTrack = {
// 		id,
// 		name,
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
