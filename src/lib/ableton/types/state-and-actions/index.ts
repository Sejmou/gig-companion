import type { SetActionsMap, SetAction } from './set/actions';
import type { SetState } from './set/state';
import type { TrackActionsMap, TrackAction } from './track/actions';
import type { ObservableTrackState, Track } from './track/state';

export type Scope = keyof StateAndActionsMap;

type StateAndActionsMap = {
	set: {
		state: SetState;
		actions: SetActionsMap;
	};
	track: {
		state: ObservableTrackState;
		actions: TrackActionsMap;
	};
	tracks: {
		state: Track[];
		// no client actions for now (could potentially add actions to add/remove tracks, but that's not a priority)
		actions: never;
	};
};

export type StateUpdateMessage = {
	type: 'stateUpdate';
	scope: Scope;
	update: Partial<StateAndActionsMap[Scope]['state']>;
};

export type ClientAction = SetAction | TrackAction;
type BaseActionMessage<T extends Scope> = {
	type: 'action';
	scope: T;
	action: ClientAction;
};
export type SetActionMessage = BaseActionMessage<'set'> & {
	action: SetAction;
};
export type TrackActionMessage = BaseActionMessage<'track'> & {
	action: TrackAction;
};
export type ClientActionMessage = SetActionMessage | TrackActionMessage;
