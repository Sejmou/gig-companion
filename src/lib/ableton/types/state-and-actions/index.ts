import type { SetActionsMap, SetAction } from './set/actions';
import type { SetState } from './set/state';
import type { TrackActionsMap, TrackAction } from './track/actions';
import type { Track } from './track/state';

export type Scope = keyof StateAndActionsMap;

export type StateAndActionsMap = {
	set: {
		state: SetState;
		actions: SetActionsMap;
	};
	tracks: {
		state: Track[];
		actions: TrackActionsMap;
	};
};

export type StateUpdateMessage = {
	type: 'stateUpdate';
	scope: Scope;
	update: Partial<StateAndActionsMap[Scope]['state']>;
};

export type ClientAction = SetAction | TrackAction;
export type ClientActionMessage =
	| {
			type: 'action';
			scope: 'set';
			action: SetAction;
	  }
	| {
			type: 'action';
			scope: 'tracks';
			action: TrackAction;
	  };
