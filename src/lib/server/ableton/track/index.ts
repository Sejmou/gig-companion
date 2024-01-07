import type {
	GroupTrack,
	MidiOrAudioTrack,
	ObservableTrackState
} from '$lib/types/ableton/track/state';
import type { Track as AbletonTrack } from 'ableton-js/ns/track';
import type { Ableton } from 'ableton-js';
import type { ScopeActionHandler, ScopeStateSnapshotProvider } from '..';
import { getCurrentRootTracks, numberToMonitoringState } from './process-and-transform';
import type { ScopeAction } from '$lib/types/ableton';

export class TrackStateManager
	implements ScopeStateSnapshotProvider<'tracks'>, ScopeActionHandler<'track'>
{
	private tracksMap: Map<string, ServerTrack> = new Map();
	/**
	 * A list of all 'root level' tracks in the Live Set, including group tracks and midiOrAudio tracks.
	 *
	 * If a track in this list is a group track, it is actually the root of a *tree of tracks* (i.e. it has children).
	 */
	private rootTracks: ServerTrack[] = [];

	constructor(
		private readonly ableton: Ableton,
		private readonly onUpdate: (update: Partial<ObservableTrackState>) => void
	) {
		this.initialize();
	}

	async getStateSnapshot() {
		return this.rootTracks;
	}

	async handleAction(action: ScopeAction<'track'>): Promise<boolean> {
		const { id, name } = action;
		const track = this.tracksMap.get(id);
		if (!track) {
			console.warn(`Could not find track with id ${id} - not updating`);
			return false;
		}
		if (name === 'mute') {
			await track.raw.set('mute', true);
		} else if (name === 'unmute') {
			await track.raw.set('mute', false);
		} else if (name === 'solo') {
			await track.raw.set('solo', true);
		} else if (name === 'unsolo') {
			await track.raw.set('solo', false);
		}
		// MidiOrAudioTrack specific actions; not sure if I should add some checks here to make sure that the track is actually a MidiOrAudioTrack
		else if (name === 'arm') {
			await track.raw.set('arm', true);
		} else if (name === 'disarm') {
			await track.raw.set('arm', false);
		} else if (name === 'setMonitoringState') {
			const { monitoringState } = action;
			await track.raw.set(
				'current_monitoring_state',
				numberToMonitoringState.getByValue(monitoringState)!
			);
		} else {
			console.warn(`Could not handle client message as action is not recognized`, action);
			return false;
		}
		return true;
	}

	private async initialize() {
		this.rootTracks = await getCurrentRootTracks(this.ableton);
		// iterate over all root-level tracks and all their children and add them to the tracksMap
		for (const track of this.rootTracks) {
			this.addNodeAndChildrenToTracksMap(track);
			this.setupTrackTreeUpdateListeners(track);
		}
	}

	private addNodeAndChildrenToTracksMap(trackTreeNode: ServerTrack) {
		this.tracksMap.set(trackTreeNode.id, trackTreeNode);
		if (trackTreeNode.type === 'group') {
			for (const child of trackTreeNode.children) {
				this.addNodeAndChildrenToTracksMap(child);
			}
		}
	}

	private setupTrackTreeUpdateListeners(trackTreeNode: ServerTrack) {
		if (trackTreeNode.type === 'group') {
			for (const child of trackTreeNode.children) {
				this.setupTrackTreeUpdateListeners(child);
			}
		}
		this.setupTrackUpdateListeners(trackTreeNode);
	}

	private setupTrackUpdateListeners(track: ServerTrack): void {
		const { raw, type } = track;
		raw.addListener('mute', (mutedNumber) => {
			const muted = Boolean(mutedNumber);
			track.muted = muted;
			this.onUpdate({ muted });
		});
		raw.addListener('solo', (soloed) => {
			track.soloed = soloed;
			this.onUpdate({ soloed });
		});
		if (type === 'midiOrAudio') {
			if (track.type !== 'midiOrAudio') {
				console.error(
					'Something went wrong: ServerTrack type is not midiOrAudio, but it should be'
				);
				return;
			}
			const mOrATrack = track; // not sure why this assignment is necessary to make TS happy
			raw.addListener('arm', (armedNum) => {
				const armed = Boolean(armedNum);
				mOrATrack.armed = armed;
				this.onUpdate({ armed });
			});
			raw.addListener('current_monitoring_state', (monitoringStateNum) => {
				const monitoringState = numberToMonitoringState.getByKey(monitoringStateNum);
				if (monitoringState) {
					mOrATrack.monitoringState = monitoringState;
					this.onUpdate({ monitoringState });
				} else console.error(`Unknown monitoring state ${monitoringState}`);
			});
		}
	}
}

/**
 * A server-side only internal representation of a track. It contains properties that encapsulate the state of a particular track in the Live Set
 *
 * It improves on AbletonJS's Track type by improving the typing compared to AbletonJS's Track type and adding other properties. This includes (among other things):
 * - additional `type` property that is either `'group'` or `'midiOrAudio'` to help distinguish between the two types of tracks: `MidiOrAudioTrack` and `GroupTrack` (types for tracks that can be armed and tracks that group other tracks, respectively)
 * - improved typing for the monitoring state of MidiOrAudioTracks (`'in' | 'auto' | 'off'` instead of just a magic `number`)
 * - additional `parentId` and `parent` properties to allow building and managing 'trees' of tracks, just as they exist in Ableton Live (e.g. a group track can have other group tracks as children; midiOrAudio tracks can only have group tracks represent 'leaf nodes' in each tree)
 * - a `raw` property that is a reference to the AbletonJS `Track` (this is useful for updating the AbletonJS track after receiving a message from the frontend)
 *
 */
export type ServerTrack = ServerGroupTrack | ServerMidiOrAudioTrack;

// type ServerBaseTrack = Omit<TrackBase, 'parentId'> & {
// 	parent?: ServerTrack;
// 	raw: AbletonTrack;
// };
export type ServerGroupTrack = GroupTrack & {
	parent?: ServerTrack;
	children: ServerTrack[];
	raw: AbletonTrack;
};
export type ServerMidiOrAudioTrack = MidiOrAudioTrack & {
	parent?: ServerTrack;
	raw: AbletonTrack;
};
