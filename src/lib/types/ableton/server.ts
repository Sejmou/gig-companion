import type { CuePoint, CuePointUpdate } from './cuepoint/state';
import type { SetState } from './set/state';
import type { TrackStateUpdate, Track } from './track/state';

// =====STATE SNAPSHOTS=====
type StateSnapshotScopes = {
	set: SetState;
	track: TrackStateUpdate;
	tracks: Track[];
	cuepoints: CuePoint[];
};
export type StateSnapshotScope = keyof StateSnapshotScopes;
export type ScopeStateSnapshot<T extends StateSnapshotScope> = StateSnapshotScopes[T];
type StateSnapshotMessages = {
	[T in StateSnapshotScope]: ScopeStateSnapshotMessage<T>;
};
export type ScopeStateSnapshotMessage<T extends StateSnapshotScope> = {
	type: 'stateSnapshot';
	scope: T;
	snapshot: StateSnapshotScopes[T];
};
export type StateSnapshotMessage = StateSnapshotMessages[StateSnapshotScope];

// this type guard is surely NOT 100% safe, but the server shouldn't send invalid messages anyway
export const isStateSnapshotMessage = (message: unknown): message is StateSnapshotMessage =>
	typeof message === 'object' &&
	message !== null &&
	'type' in message &&
	message['type'] === 'stateSnapshot';

// =====STATE UPDATES=====
type StateUpdateScopes = {
	set: Partial<SetState>;
	track: TrackStateUpdate;
	/**
	 * Contains the name and new time of the updated cue point.
	 */
	cuepoint: CuePointUpdate;
};
export type StateUpdateScope = keyof StateUpdateScopes;
export type ScopeStateUpdate<T extends StateUpdateScope> = StateUpdateScopes[T];
type StateUpdatePayload<T extends StateUpdateScope> = {
	scope: T;
	update: StateUpdateScopes[T];
};
type ScopeStateUpdatePayloads = {
	[T in StateUpdateScope]: StateUpdatePayload<T>;
};
export type ScopeStateUpdatePayload<T extends StateUpdateScope> = ScopeStateUpdatePayloads[T];
type StateUpdateMessages = {
	[T in StateUpdateScope]: ScopeStateUpdateMessage<T>;
};
export type ScopeStateUpdateMessage<T extends StateUpdateScope> = {
	type: 'stateUpdate';
} & StateUpdatePayload<T>;
export type StateUpdateMessage = StateUpdateMessages[StateUpdateScope];

// this type guard is surely NOT 100% safe, but the server shouldn't send invalid messages anyway
export const isStateUpdateMessage = (message: unknown): message is StateUpdateMessage =>
	typeof message === 'object' &&
	message !== null &&
	'type' in message &&
	message['type'] === 'stateUpdate';
