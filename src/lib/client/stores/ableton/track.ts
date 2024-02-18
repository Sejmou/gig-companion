import type { TrackAction } from '$lib/types/ableton/track/actions';
import { ws } from '../websocket-connection';
import type {
	GroupTrack,
	MidiOrAudioTrack,
	ObservableGroupTrackStateUpdate,
	ObservableMidiOrAudioTrackStateUpdate,
	Track
} from '$lib/types/ableton/track/state';
import type { ScopeActionMessage } from '$lib/types/ableton/client';
import { writable, type Writable } from 'svelte/store';
import type { ScopeStateUpdate } from '$lib/types/ableton/server';
import { rootTracks } from './tracks';

const groupTrackStates = new Map<string, GroupTrackState>();
const midiOrAudioTrackStates = new Map<string, MidiOrAudioTrackState>();
const groupTrackUpdaters = new Map<string, GroupTrackStoreUpdaters>();
const midiOrAudioTrackUpdaters = new Map<string, MidiOrAudioTrackStoreUpdaters>();

rootTracks.subscribe((tracks) => {
	const previousGroupTrackIds = new Set(groupTrackStates.keys());
	const previousMidiOrAudioTrackIds = new Set(midiOrAudioTrackStates.keys());
	tracks.forEach((track) => {
		createTrackState(track);
	});
	const newGroupTrackIds = new Set(groupTrackStates.keys());
	const newMidiOrAudioTrackIds = new Set(midiOrAudioTrackStates.keys());

	// remove all tracks that are no longer in the Live Set
	for (const id of previousGroupTrackIds) {
		if (!newGroupTrackIds.has(id)) {
			console.log(
				`Removing state management logic for group track ${id} as it is no longer in the Live Set`
			);
			groupTrackStates.delete(id);
			groupTrackUpdaters.delete(id);
		}
	}
	for (const id of previousMidiOrAudioTrackIds) {
		if (!newMidiOrAudioTrackIds.has(id)) {
			console.log(
				`Removing state management logic for midiOrAudio track ${id} as it is no longer in the Live Set`
			);
			midiOrAudioTrackStates.delete(id);
			midiOrAudioTrackUpdaters.delete(id);
		}
	}
});

export function getGroupTrackState(id: string): GroupTrackState | undefined {
	return groupTrackStates.get(id);
}

export function getMidiOrAudioTrackState(id: string): MidiOrAudioTrackState | undefined {
	return midiOrAudioTrackStates.get(id);
}

export function getTrackState(id: string): GroupTrackState | MidiOrAudioTrackState | undefined {
	const state = groupTrackStates.get(id) ?? midiOrAudioTrackStates.get(id);
	return state;
}

export function handleTrackUpdate(update: ScopeStateUpdate<'track'>): boolean {
	const { id } = update;
	const track = getTrackState(id);
	if (!track) {
		console.warn(`Received track action for unknown track ${id}`);
		return false;
	}
	let handled = false;
	if (update.type === 'group') {
		const { muted, soloed } = update;
		if (muted !== undefined) {
			const handler = groupTrackUpdaters.get(id)?.muted;
			if (handler) {
				handler(muted);
				handled = true;
			}
		}
		if (soloed !== undefined) {
			const handler = groupTrackUpdaters.get(id)?.soloed;
			if (handler) {
				handler(soloed);
				handled = true;
			}
		}
		if (!handled) {
			console.warn(`Didn't handle action for group track ${id}`, update);
		}
	}
	if (update.type === 'midiOrAudio') {
		const { muted, soloed, armed, monitoringState } = update;
		if (muted !== undefined) {
			const handler = midiOrAudioTrackUpdaters.get(id)?.muted;
			if (handler) {
				handler(muted);
				handled = true;
			}
		}
		if (soloed !== undefined) {
			const handler = midiOrAudioTrackUpdaters.get(id)?.soloed;
			if (handler) {
				handler(soloed);
				handled = true;
			}
		}
		if (armed !== undefined) {
			const handler = midiOrAudioTrackUpdaters.get(id)?.armed;
			if (handler) {
				handler(armed);
				handled = true;
			}
		}
		if (monitoringState !== undefined) {
			const handler = midiOrAudioTrackUpdaters.get(id)?.monitoringState;
			if (handler) {
				handler(monitoringState);
				handled = true;
			}
		}
		if (!handled) {
			console.warn(`Didn't handle action for midiOrAudio track ${id}`, update);
		}
	}
	return handled;
}

function createTrackState(track: Track) {
	if (track.type === 'group') {
		const { stores, updaters } = createGroupTrackManagementTools(track);
		const state = {
			type: 'group',
			id: track.id,
			name: track.name,
			parentId: track.parentId,
			childIds: track.children.map((child) => child.id),
			...stores
		} satisfies GroupTrackState;
		groupTrackStates.set(track.id, state);
		groupTrackUpdaters.set(track.id, updaters);

		// call recursively for all children
		for (const child of track.children) {
			createTrackState(child);
		}

		return state;
	}
	if (track.type === 'midiOrAudio') {
		const { stores, updaters } = createMidiOrAudioTrackManagementTools(track);
		const state = {
			type: 'midiOrAudio',
			id: track.id,
			name: track.name,
			parentId: track.parentId,
			...stores
		} satisfies MidiOrAudioTrackState;
		midiOrAudioTrackStates.set(track.id, state);
		midiOrAudioTrackUpdaters.set(track.id, updaters);
		return state;
	}
}

function createGroupTrackManagementTools(track: GroupTrack): {
	stores: GroupTrackStores;
	updaters: GroupTrackStoreUpdaters;
} {
	const { id, type } = track;
	const stores = {
		muted: createWebSocketServerSyncedTrackPropStore(id, type, 'muted', track.muted),
		soloed: createWebSocketServerSyncedTrackPropStore(id, type, 'soloed', track.soloed)
	} satisfies GroupTrackStores;
	const updaters: GroupTrackStoreUpdaters = {
		muted: stores.muted.realSet,
		soloed: stores.soloed.realSet
	} satisfies GroupTrackStoreUpdaters;
	return { stores, updaters };
}

function createMidiOrAudioTrackManagementTools(track: MidiOrAudioTrack): {
	stores: MidiOrAudioTrackStores;
	updaters: MidiOrAudioTrackStoreUpdaters;
} {
	const { id, type } = track;
	const stores = {
		muted: createWebSocketServerSyncedTrackPropStore(id, type, 'muted', track.muted),
		soloed: createWebSocketServerSyncedTrackPropStore(id, type, 'soloed', track.soloed),
		armed: createWebSocketServerSyncedTrackPropStore(id, type, 'armed', track.armed),
		monitoringState: createWebSocketServerSyncedTrackPropStore(
			id,
			type,
			'monitoringState',
			track.monitoringState
		)
	} satisfies MidiOrAudioTrackStores;
	const updaters: MidiOrAudioTrackStoreUpdaters = {
		muted: stores.muted.realSet,
		soloed: stores.soloed.realSet,
		armed: stores.armed.realSet,
		monitoringState: stores.monitoringState.realSet
	} satisfies MidiOrAudioTrackStoreUpdaters;
	return { stores, updaters };
}

function createWebSocketServerSyncedTrackPropStore<T>(
	id: string,
	type: 'group' | 'midiOrAudio',
	property: keyof ObservableGroupTrackStateUpdate | keyof ObservableMidiOrAudioTrackStateUpdate,
	initialValue: T
) {
	const { subscribe, set, update } = writable(initialValue);

	function customSet(newValue: T) {
		sendTrackAction({
			type,
			id,
			[property]: newValue
		});
	}

	return {
		subscribe,
		// set is overridden to send the update to the server; actual store update ONLY happens after the server has responded (see realSet)
		set: customSet,
		// update is not really relevant for our use case, but we need to implement it to satisfy the writable interface; TODO: consider changing
		update,
		// the actual set function that we want to use in response to a server-side update; only to be called internally!
		realSet: set
	};
}

function sendTrackAction(action: TrackAction) {
	const msg: ScopeActionMessage<'track'> = {
		type: 'action',
		scope: 'track',
		action
	};
	ws.send(msg);
}

/**
 * This utility type allows us to combine the types of two objects, while keeping the keys of both objects.
 *
 * If the two objects have keys in common, the type of the key will be the type of the key in the second object.
 */
type CombinedType<A, B> = {
	[K in keyof A | keyof B]: K extends keyof B ? B[K] : K extends keyof A ? A[K] : never;
};

// I absolutely HATE what I did here, but I don't know how to do it better atm
// I don't really know how to handle nested children properly, so I am using ids instead for now.
export type GroupTrackState = CombinedType<
	Omit<GroupTrack, 'children'> & { childIds: string[] },
	GroupTrackStores
>;
export type MidiOrAudioTrackState = CombinedType<MidiOrAudioTrack, MidiOrAudioTrackStores>;

// I absolutely HATE what I did here, but I don't know how to do it better atm
type ObservableGroupTrackStateProps = Required<
	Omit<ObservableGroupTrackStateUpdate, 'id' | 'type'>
>;
type GroupTrackStores = Required<{
	[K in keyof ObservableGroupTrackStateProps]: Writable<ObservableGroupTrackStateProps[K]>;
}>;
type GroupTrackStoreUpdaters = {
	[K in keyof GroupTrackStores]: (newValue: ObservableGroupTrackStateProps[K]) => void;
};

type ObservableMidiOrAudioTrackStateProps = Required<
	Omit<ObservableMidiOrAudioTrackStateUpdate, 'id' | 'type'>
>;
type MidiOrAudioTrackStores = Required<{
	[K in keyof ObservableMidiOrAudioTrackStateProps]: Writable<
		ObservableMidiOrAudioTrackStateProps[K]
	>;
}>;
type MidiOrAudioTrackStoreUpdaters = {
	[K in keyof MidiOrAudioTrackStores]: (newValue: ObservableMidiOrAudioTrackStateProps[K]) => void;
};
