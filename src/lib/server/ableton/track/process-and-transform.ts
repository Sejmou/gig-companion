import type { Ableton } from 'ableton-js';
import type { Track as AbletonTrack } from 'ableton-js/ns/track';
import type { ServerTrack, ServerGroupTrack, ServerMidiOrAudioTrack } from '.';
import { TwoWayMap } from '$lib/utils';
import type { GroupTrack, MidiOrAudioTrack, TrackBase } from '$lib/types/ableton/track/state';

export async function getCurrentRootTracks(ableton: Ableton) {
	const tracks = await ableton.song.get('tracks');
	const { tracksMap, parentIdChildrenMap } = await getAbletonTracksAndChildren(tracks);
	const tempTracks = await Promise.all(tracks.map((t) => processTrack(t, parentIdChildrenMap)));
	const tempTracksMap = new Map(tempTracks.map((t) => [t.id, t]));
	const trackIds = Array.from(tracksMap.keys());
	const childIds = new Set(Array.from(parentIdChildrenMap.values()).flat());
	const rootIds = trackIds.filter((id) => !childIds.has(id));
	const processedTrackMap: Map<string, ServerTrack> = new Map();
	const result: ServerTrack[] = [];
	for (const id of rootIds) {
		result.push(buildTrackTree(tempTracksMap, processedTrackMap, id));
	}

	return result;
}

function buildTrackTree(
	tempTracksMap: Map<string, TempTrack>,
	processedTrackMap: Map<string, ServerTrack>,
	trackId: string,
	parent?: ServerGroupTrack
): ServerTrack {
	const track = tempTracksMap.get(trackId)!;
	if (track.type === 'midiOrAudio') {
		const processed: ServerMidiOrAudioTrack = {
			...track,
			parent
		};
		processedTrackMap.set(trackId, processed);
		return processed;
	} else {
		// track is a group track
		const processed: ServerGroupTrack = {
			...track,
			parent,
			children: []
		};
		processedTrackMap.set(trackId, processed);
		const children = track.childIds.map((id) =>
			buildTrackTree(tempTracksMap, processedTrackMap, id, processed)
		);
		processed.children = children;
		return processed;
	}
}

async function getAbletonTracksAndChildren(tracks: AbletonTrack[]) {
	const tracksMap = new Map<string, AbletonTrack>();
	const parentIdChildrenMap = new Map<string, string[]>();
	for (const track of tracks) {
		const parentId = await track.get('group_track').then((t) => t?.id);
		if (parentId) {
			if (!parentIdChildrenMap.has(parentId)) {
				parentIdChildrenMap.set(parentId, []);
			}
			parentIdChildrenMap.get(parentId)!.push(track.raw.id);
		}
		tracksMap.set(track.raw.id, track);
	}
	return { tracksMap, parentIdChildrenMap };
}

/**
 * Processes an AbletonJS track and returns a temporary/intermediate track representation that is used to build the server track (`ServerTrack`).
 * @param raw AbletonJS track
 */
async function processTrack(
	raw: AbletonTrack,
	parentIdChildrenMap: Map<string, string[]>
): Promise<TempTrack> {
	const canBeArmed = await raw.get('can_be_armed');
	const id = raw.raw.id;
	const parentId = await raw.get('group_track').then((t) => t?.id);
	// const devices = await raw.get('devices'); // TODO: add that
	const name = await raw.get('name');
	const muted = await raw.get('mute');
	// not sure why this is not a boolean
	const soloed = Boolean(await raw.get('solo'));

	const baseTrack: TempBaseTrack = {
		id,
		name,
		parentId,
		muted,
		soloed,
		raw
	};

	if (!canBeArmed) {
		const groupTrack: TempGroupTrack = {
			...baseTrack,
			type: 'group',
			childIds: parentIdChildrenMap.get(id) ?? []
		};
		return groupTrack;
	}

	const armed = await raw.get('arm');
	const monitoringState = numberToMonitoringState.getByKey(
		await raw.get('current_monitoring_state')
	);
	if (!monitoringState) throw new Error(`Unknown monitoring state ${monitoringState}`);

	const midiOrAudioTrack: TempMidiOrAudioTrack = {
		...baseTrack,
		type: 'midiOrAudio',
		armed,
		monitoringState
	};

	return midiOrAudioTrack;
}

export const numberToMonitoringState = new TwoWayMap<number, MidiOrAudioTrack['monitoringState']>([
	[0, 'off'],
	[1, 'in'],
	[2, 'auto']
]);

type TempBaseTrack = TrackBase & {
	raw: AbletonTrack;
};
type TempGroupTrack = GroupTrack & {
	raw: AbletonTrack;
};
type TempMidiOrAudioTrack = MidiOrAudioTrack & {
	raw: AbletonTrack;
};
type TempTrack = TempGroupTrack | TempMidiOrAudioTrack;
