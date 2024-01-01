import type { SetActionsMap } from './set/actions';
import type { SetState } from './set/state';
import type { TrackActionsMap } from './track/actions';
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
