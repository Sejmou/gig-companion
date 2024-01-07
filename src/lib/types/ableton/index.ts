import type { SetAction } from './set/actions';
import type { SetState } from './set/state';
import type { TrackAction } from './track/actions';
import type { ObservableTrackState, Track } from './track/state';

export type Scope = 'set' | 'track' | 'tracks';

// =====STATE=====
type StateSnapshotScopes = {
	set: SetState;
	track: ObservableTrackState;
	tracks: Track[];
};
export type ScopeStateSnapshot<T extends Scope> = Partial<StateSnapshotScopes[T]>;
type StateSnapshotMessages = {
	[T in Scope]: ScopeStateSnapshotMessage<T>;
};
export type ScopeStateSnapshotMessage<T extends Scope> = {
	type: 'stateSnapshot';
	scope: T;
	snapshot: Partial<StateSnapshotScopes[T]>;
};
export type StateSnapshotMessage = StateSnapshotMessages[Scope];

// this type guard is surely NOT 100% safe, but the server shouldn't send invalid messages anyway
export const isStateSnapshotMessage = (message: unknown): message is StateSnapshotMessage =>
	typeof message === 'object' &&
	message !== null &&
	'type' in message &&
	message['type'] === 'stateSnapshot';

// =====ACTIONS=====
type ClientActionScopes = {
	set: SetAction;
	track: TrackAction;
	tracks: never; // no client actions for now (could potentially add actions to add/remove tracks, but that's not a priority)
};
export type ScopeAction<T extends Scope> = ClientActionScopes[T];

type ScopeActionMessages = {
	[T in Scope]: ScopeActionMessage<T>;
};
export type ScopeActionMessage<T extends Scope> = {
	type: 'action';
	scope: T;
	action: ClientActionScopes[T];
};
export type ClientActionMessage = ScopeActionMessages[Scope];
